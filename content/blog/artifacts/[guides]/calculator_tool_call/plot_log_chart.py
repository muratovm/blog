import numpy as np
import matplotlib.pyplot as plt
from log_distribution import (
    GAUSSIAN_SIGMA,
    NUMBER_OF_POINTS,
    generate_log_gaussian_values,
    generate_log_uniform_values,
)
# ------------------------------------------------------------
# Configuration
# ------------------------------------------------------------
np.set_printoptions(suppress=True)
# Use your custom style if the file is in the same directory.
# Comment this line out to use Matplotlib's default style.
plt.style.use("michael_muratov_light.mplstyle")

sample_numbers = np.arange(1, NUMBER_OF_POINTS + 1)
uniform_values = generate_log_uniform_values()
gaussian_values = generate_log_gaussian_values()

def generate_chart(sample_numbers, uniform_values, gaussian_values):
    fig, ax = plt.subplots(figsize=(11, 6))
    # ------------------------------------------------------------
    # Configure axes
    # ------------------------------------------------------------
    # With base 10, linscale=0.9 makes the central 0-to-10^0 interval
    # occupy the same visual height as each logarithmic decade.
    ax.set_yscale("symlog", base=10, linthresh=1, linscale=0.9)
    ax.set_ylim(-1e5, 1e5)
    ax.set_xlabel("Sample number")
    ax.set_ylabel("Generated value")
    ax.set_title("Random values across twenty orders of magnitude",loc="left",)
    uniform_scatter = ax.scatter(sample_numbers,uniform_values,
                                  label="Log-uniform", marker="o", s=26, alpha=0.78,
    )
    gaussian_scatter = ax.scatter(sample_numbers,gaussian_values,
                                  label=f"Log-Gaussian, σ={GAUSSIAN_SIGMA}",marker="o",s=26,alpha=0.78,
    )
    scatters = [uniform_scatter,gaussian_scatter]
    ax.legend(title="Distribution", loc="best")
    # ------------------------------------------------------------
    # Create hidden tooltip
    # ------------------------------------------------------------
    annotation = ax.annotate("",xy=(0, 0),xytext=(0, 12),textcoords="offset points",ha="center",va="bottom",
                                bbox={"boxstyle": "round,pad=0.35","facecolor": "#f6f4ef","edgecolor": "#8f9d8a","linewidth": 0.8},
                                arrowprops={"arrowstyle": "-","color": "#8f9d8a","linewidth": 0.8},
        )
    annotation.set_visible(False)
    
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
                print(event)
                marker_index = marker_info["ind"][0]
                x_value, y_value = scatter.get_offsets()[marker_index]
                annotation.xy = (x_value, y_value)
                annotation.set_text(f"{y_value}")
                annotation.set_visible(True)
                fig.canvas.draw_idle()
                return
        hide_annotation()
        
    # Run on_hover whenever the mouse moves inside the figure.
    fig.canvas.mpl_connect("motion_notify_event",on_hover)
    fig.tight_layout()
    plt.savefig('value_distribution.png')
    plt.show()

generate_chart(sample_numbers, uniform_values, gaussian_values)
