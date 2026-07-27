"""Create separate binned heatmaps for the two value distributions."""

from __future__ import annotations

from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
from matplotlib.colors import LinearSegmentedColormap

from plot_scientific_distribution import DATA_FILE, load_coordinates


X_EDGES = np.arange(-1.2, 1.21, 0.2)
Y_EDGES = np.arange(-6, 6.01, 1)
STYLE_FILE = Path(__file__).with_name("michael_muratov_light.mplstyle")

plt.style.use(str(STYLE_FILE))


def style_heatmap_colors() -> LinearSegmentedColormap:
    """Build a heatmap gradient from colors selected in the style file."""
    cycle_colors = plt.rcParams["axes.prop_cycle"].by_key()["color"]
    return LinearSegmentedColormap.from_list(
        "michael_muratov_heatmap",
        [
            plt.rcParams["axes.facecolor"],
            cycle_colors[0],
            cycle_colors[1],
        ],
    )


def make_histogram(
    coefficients: list[float], exponents: list[int]
) -> np.ndarray:
    """Count coordinates in each x/y grid square."""
    counts, _, _ = np.histogram2d(
        coefficients,
        exponents,
        bins=(X_EDGES, Y_EDGES),
    )
    return counts.T


def plot_heatmap_on_axes(
    ax: plt.Axes,
    counts: np.ndarray,
    distribution_name: str,
    maximum_count: int,
) -> plt.cm.ScalarMappable:
    heatmap_colors = style_heatmap_colors()
    heatmap = ax.pcolormesh(
        X_EDGES,
        Y_EDGES,
        counts,
        cmap=heatmap_colors,
        vmin=0,
        vmax=maximum_count,
        edgecolors=plt.rcParams["grid.color"],
        linewidth=0.7,
    )

    # Put the tally in the center of every nonempty square.
    for row, column in np.argwhere(counts > 0):
        count = int(counts[row, column])
        fill_strength = count / maximum_count
        x_center = (X_EDGES[column] + X_EDGES[column + 1]) / 2
        y_center = (Y_EDGES[row] + Y_EDGES[row + 1]) / 2
        ax.text(
            x_center,
            y_center,
            str(count),
            ha="center",
            va="center",
            fontsize=9,
            color=(
                plt.rcParams["figure.facecolor"]
                if fill_strength >= 0.55
                else plt.rcParams["text.color"]
            ),
            fontweight="bold" if fill_strength >= 0.55 else "normal",
        )

    ax.set(
        xlim=(X_EDGES[0], X_EDGES[-1]),
        ylim=(Y_EDGES[0], Y_EDGES[-1]),
        xlabel="Signed coefficient",
        ylabel="Magnitude (base-10 exponent)",
        title=f"{distribution_name} — values per grid square",
    )
    ax.set_xticks(X_EDGES)
    ax.set_yticks(Y_EDGES)
    ax.set_aspect(0.2)
    return heatmap


def create_heatmaps() -> None:
    coordinates = load_coordinates(DATA_FILE)
    histograms = {
        name: make_histogram(coefficients, exponents)
        for name, (coefficients, exponents) in coordinates.items()
    }
    fig, axes = plt.subplots(
        1,
        len(histograms),
        figsize=(18, 8),
        sharex=True,
        sharey=True,
    )
    for ax, (name, counts) in zip(axes, histograms.items()):
        display_name = name.replace("_", " ").title()
        maximum_count = int(counts.max())
        heatmap = plot_heatmap_on_axes(
            ax,
            counts,
            display_name,
            maximum_count,
        )
        colorbar = fig.colorbar(
            heatmap,
            ax=ax,
            label="Number of values",
            pad=0.03,
        )
        colorbar.set_ticks(np.arange(0, maximum_count + 1))
        print(f"{display_name}: {int(counts.sum())} values")

    fig.suptitle("Distribution density by scientific-notation grid square")
    fig.subplots_adjust(left=0.06, right=0.96, bottom=0.12, top=0.87, wspace=0.18)

    output_file = Path(__file__).with_name("distribution_heatmaps.png")
    fig.savefig(output_file, dpi=150)
    plt.close(fig)
    print(f"Combined heatmaps -> {output_file.name}")


if __name__ == "__main__":
    create_heatmaps()
