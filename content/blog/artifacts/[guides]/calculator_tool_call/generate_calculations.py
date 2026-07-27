import numpy as np
from log_distribution import generate_log_uniform_values, generate_log_gaussian_values, NUMBER_OF_POINTS
from decimal import Decimal

# ------------------------------------------------------------
# Configuration
# ------------------------------------------------------------
np.set_printoptions(suppress=True)
NUM_INPUTS = 50

uniform_values = generate_log_uniform_values()
gaussian_values = generate_log_gaussian_values()

calculations = []
for i in range(NUM_INPUTS):
    #pick random value from uniform_values
    left = np.random.choice(uniform_values)
    right = np.random.choice(gaussian_values)
    result = float(Decimal(str(left)) + Decimal(str(right)))
    calculations.append((left.item(), right.item(), result))
    #print(f"{i+1}. {left} + {right} = {result}")
    
