"""Plot JSON values as signed scientific coefficients versus magnitudes."""

from __future__ import annotations

import json
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
from matplotlib.patches import Ellipse


DATA_FILE = Path(__file__).with_name("log_distribution_data.json")
OUTPUT_FILE = Path(__file__).with_name("scientific_distribution.png")

plt.style.use("michael_muratov_light.mplstyle")

def to_scientific_coordinates(value: float) -> tuple[float, int]:
    """Return coefficient and exponent where value = coefficient * 10**exponent.

    The coefficient is normalized to the intervals [-1, -0.1] and [0.1, 1],
    which places signed values inside the requested x-axis domain.
    """
    if value == 0:
        return 0.0, 0

    exponent = int(np.floor(np.log10(abs(value)))) + 1
    coefficient = value / (10**exponent)
    return coefficient, exponent


def load_coordinates(path: Path) -> dict[str, tuple[list[float], list[int]]]:
    with path.open(encoding="utf-8") as json_file:
        data = json.load(json_file)

    coordinates = {}
    for list_name, values in data.items():
        points = [to_scientific_coordinates(float(value)) for value in values]
        coordinates[list_name] = (
            [coefficient for coefficient, _ in points],
            [exponent for _, exponent in points],
        )
    return coordinates


def add_two_sigma_region(
    ax: plt.Axes,
    coefficients: list[float],
    exponents: list[int],
    color: str,
    label: str,
) -> None:
    """Shade the two-standard-deviation covariance ellipse for a dataset."""
    points = np.column_stack((coefficients, exponents))
    center = points.mean(axis=0)
    covariance = np.cov(points, rowvar=False)
    eigenvalues, eigenvectors = np.linalg.eigh(covariance)
    order = eigenvalues.argsort()[::-1]
    eigenvalues = eigenvalues[order]
    eigenvectors = eigenvectors[:, order]

    angle = np.degrees(np.arctan2(eigenvectors[1, 0], eigenvectors[0, 0]))
    width, height = 2 * 2 * np.sqrt(eigenvalues)
    region = Ellipse(
        xy=center,
        width=width,
        height=height,
        angle=angle,
        facecolor=color,
        edgecolor=color,
        linewidth=1.5,
        alpha=0.16,
        label=f"{label} 2σ region",
        zorder=1,
    )
    ax.add_patch(region)


def plot_distribution() -> None:
    coordinates = load_coordinates(DATA_FILE)
    fig, ax = plt.subplots(figsize=(10, 10))
    colors = plt.rcParams["axes.prop_cycle"].by_key()["color"]

    for color, (list_name, (coefficients, exponents)) in zip(
        colors, coordinates.items()
    ):
        display_name = list_name.replace("_", " ").title()
        add_two_sigma_region(
            ax, coefficients, exponents, color, display_name
        )
        ax.scatter(
            coefficients,
            exponents,
            s=42,
            alpha=0.72,
            color=color,
            label=display_name,
            zorder=2,
        )

    ax.set(
        xlim=(-1.2, 1.2),
        ylim=(-6, 6),
        xlabel="Signed coefficient",
        ylabel="Magnitude (base-10 exponent)",
        title="Scientific-notation distribution",
    )
    ax.set_xticks(np.arange(-1.2, 1.21, 0.2))
    ax.set_yticks(np.arange(-6, 6.01, 1))
    ax.grid(True, alpha=0.3)
    ax.legend()
    fig.tight_layout()
    fig.savefig(OUTPUT_FILE, dpi=150)
    plt.show()


if __name__ == "__main__":
    plot_distribution()
