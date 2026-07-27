import numpy as np
import matplotlib.pyplot as plt

np.set_printoptions(suppress=True)

def round_generated_value(value):
    magnitude = abs(value)

    # Values at least 1: nearest integer
    if magnitude >= 1:
        return int(round(value))

    # Preserve zero
    if magnitude == 0:
        return 0.0

    # Values below 1: one significant digit
    decimal_places = -int(np.floor(np.log10(magnitude)))
    return round(value, decimal_places)

# ------------------------------------------------------------
# Configuration
# ------------------------------------------------------------

RANDOM_SEED = 42
NUMBER_OF_POINTS = 100
GAUSSIAN_SIGMA = 3

rng = np.random.default_rng(RANDOM_SEED)


# ------------------------------------------------------------
# Generate log-uniform values
# ------------------------------------------------------------

sample_numbers = np.arange(1, NUMBER_OF_POINTS + 1)

uniform_exponents = rng.uniform(
    low=-10,
    high=10,
    size=NUMBER_OF_POINTS,
)

uniform_signs = rng.choice(
    [-1, 1],
    size=NUMBER_OF_POINTS,
)

uniform_values = uniform_signs * 10.0**uniform_exponents

uniform_values = np.array([
    round_generated_value(value)
    for value in uniform_values
])

# ------------------------------------------------------------
# Generate truncated log-Gaussian values
# ------------------------------------------------------------

gaussian_exponents = []

while len(gaussian_exponents) < NUMBER_OF_POINTS:
    candidates = rng.normal(
        loc=0,
        scale=GAUSSIAN_SIGMA,
        size=NUMBER_OF_POINTS,
    )

    valid_candidates = candidates[
        (candidates >= -10)
        & (candidates <= 10)
    ]

    gaussian_exponents.extend(valid_candidates)

gaussian_exponents = np.asarray(
    gaussian_exponents[:NUMBER_OF_POINTS]
)

gaussian_signs = rng.choice(
    [-1, 1],
    size=NUMBER_OF_POINTS,
)

gaussian_values = (
    gaussian_signs
    * 10.0**gaussian_exponents
)

gaussian_values = np.array([
    round_generated_value(value)
    for value in gaussian_values
])

print(gaussian_values)

# ------------------------------------------------------------
# Create chart
# ------------------------------------------------------------

# Use your custom style if the file is in the same directory.
# Comment this line out to use Matplotlib's default style.
plt.style.use("michael_muratov_light.mplstyle")

fig, ax = plt.subplots(figsize=(11, 6))

uniform_scatter = ax.scatter(
    sample_numbers,
    uniform_values,
    label="Log-uniform",
    marker="o",
    s=26,
    alpha=0.78,
)

gaussian_scatter = ax.scatter(
    sample_numbers,
    gaussian_values,
    label="Log-Gaussian, σ=3",
    marker="o",
    s=26,
    alpha=0.78,
)


# ------------------------------------------------------------
# Configure axes
# ------------------------------------------------------------

ax.set_yscale(
    "symlog",
    base=10,
    linthresh=1e-10,
)

ax.set_ylim(-1e10, 1e10)

ax.set_xlabel("Sample number")
ax.set_ylabel("Generated value")

ax.set_title(
    "Random values across twenty orders of magnitude",
    loc="left",
)

ax.legend()


# ------------------------------------------------------------
# Create hidden tooltip
# ------------------------------------------------------------

annotation = ax.annotate(
    "",
    xy=(0, 0),
    xytext=(0, 12),
    textcoords="offset points",
    ha="center",
    va="bottom",
    bbox={
        "boxstyle": "round,pad=0.35",
        "facecolor": "#f6f4ef",
        "edgecolor": "#8f9d8a",
        "linewidth": 0.8,
    },
    arrowprops={
        "arrowstyle": "-",
        "color": "#8f9d8a",
        "linewidth": 0.8,
    },
)

annotation.set_visible(False)


# ------------------------------------------------------------
# Hover handling
# ------------------------------------------------------------

scatters = [
    uniform_scatter,
    gaussian_scatter,
]


def hide_annotation():
    """Hide the tooltip when it is currently visible."""

    if annotation.get_visible():
        annotation.set_visible(False)
        fig.canvas.draw_idle()


def on_hover(event):
    """Show the value of the marker under the mouse."""

    if event.inaxes != ax:
        hide_annotation()
        return

    for scatter in scatters:
        contains_marker, marker_info = scatter.contains(event)

        if contains_marker:
            marker_index = marker_info["ind"][0]

            x_value, y_value = scatter.get_offsets()[marker_index]

            annotation.xy = (x_value, y_value)

            # Scientific notation works well across this large range.
            annotation.set_text(f"{y_value}")

            annotation.set_visible(True)
            fig.canvas.draw_idle()
            return

    hide_annotation()


# Run on_hover whenever the mouse moves inside the figure.
fig.canvas.mpl_connect(
    "motion_notify_event",
    on_hover,
)

# ------------------------------------------------------------
# Display chart
# ------------------------------------------------------------

fig.tight_layout()
plt.show()