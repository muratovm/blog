---
title: Curve Fitting Univariate Data
date: 2024-11-01
categories:
    - modeling
    - statistics
tags:
    - distribution
    - subsets
draft: false
image: /img/banner/population_fitting.png
layout: blog-post
toc: true
---

## Exploring and Synthesizing Population Data

Generally it can be very useful to accurately model a single variable of a population. 

Once you've measured a fit for your data you are able to derive and analyze new data with respect to a context, for example:

- Examine characteristics of single variables
- Take random samples representative of the entire dataset
- Determine if a new sample is representative of the existing data

We'll be analyzing an example dataset to show how we can answer the questions above and show why answering these questions can be valuable.

For this we'll be making use of the popular titanic dataset by loading it in through the seaborn sample data:

```python
import seaborn as sns
import matplotlib.pyplot as plt

titanic = sns.load_dataset('titanic')
```

And using seaborn to get a plot of the ages of people who were on the titanic:

```python
def plot_variable_histogram(series):
    ax = sns.histplot(series, bins=30, kde=True, color='gray', line_kws={'linewidth': 2, 'color': 'red'})
    ax.lines[0].set_color('crimson')
    ax.plot()

#get a histogram of population by age
ages = titanic['age'].dropna()
plot_variable_histogram(ages)
```

![image](../../../img/chart/population_fitting_[age_histogram].png)

Here we've binned all the passengers into 30 groups and fitted a frequency curve with a KDE (Kernel Density 
Estimation) line that attempts to represent the histogram as a curve.

### Kernel Density Estimation

This method adds together small distributions around each point to aggregate the probabilities, each point has a small gaussian curve that gets added with the gaussian curves of the points next to it to plot the final curve higher on the y axis. 

![image](../../../img/chart/population_fitting_[kde_kernel].png)

We can also plot the KDE independently of the histogram, and directly specify the type of kernel that we want for each point. We'll choose gaussian just like in the default to see the results line up.

```python
def chart_variable_density(series):
    kde = gaussian_kde(series)
    # Define a range for the KDE
    x_range = np.linspace(min(series) - 1, max(series) + 1, 1000)  # 1000 points across the data range
    # Compute KDE PDF values over the range
    pdf_values = kde(x_range)
    # Plot the KDE
    plt.plot(x_range, pdf_values, color='blue', lw=2)
    return x_range, pdf_values

ages = titanic['age'].dropna()
x_range, pdf_values = chart_variable_density(ages)
```

![image](../../../img/chart/population_fitting_[gaussian_kernel].png)

### Sampling from a Distribution

Now we can use this distribution as the base for our random sampling! 

Once we normalize the values of the KDE we can use it as the probability spectrum for np.random and get random samples subject to the same distribution as our data. In the example below we sampled 10,000 points to see how closely it resembles the KDE distribution.

```python
def sample_based_on_kde(pdf_values, sample_size=10000):
    # Normalize PDF values to sum to 1
    pmf_values = pdf_values / pdf_values.sum()
    
    # Sample points from the KDE distribution
    samples = np.random.choice(x_range, size=sample_size, p=pmf_values)

    # Plot the original KDE
    fig, ax1 = plt.subplots(figsize=(10, 6))
    ax2 = ax1.twinx()
    
    data = pd.DataFrame({"age":x_range, "density":pdf_values/sum(pdf_values)})
    sns.lineplot(ax=ax2,x="age", y="density", data=data, label="KDE PDF", color="blue")

    # Plot histogram of samples
    sns.histplot(samples, ax=ax1, bins=30, alpha=0.5, label="Sampled Points", color='orange')

    plt.title("Sampling from KDE-Defined Distribution")
    plt.xlabel("Value")
    plt.ylabel("Density")
    plt.legend()
    plt.show()

    return samples

samples = sample_based_on_kde(pdf_values, sample_size = 10000)
```

![image](../../../img/chart/population_fitting_[sample_histogram].png)

Here we see the histogram of the 10,000 samples and they match the KDE very closely.
### Individual Samples

To see what this looks like on individual values we can chart this graph with just a handful of sample points. Imagine the red lines below are randomly selected people, but in fact they are new points, that were selected randomly based on the context our existing data gave us.

```python
def draw_samples_on_histogram(series, x_range, pdf_values, samples):
    # Plot the KDE
    plt.figure(figsize=(10, 6))
    plt.plot(x_range, pdf_values, label="KDE PDF", color="blue")

    # Plot histogram of the data for reference
    plt.hist(ages, bins=30, density=True, alpha=0.3, color="gray", label="Data Histogram")

    # Plot vertical lines for each sampled point
    kde = gaussian_kde(series)
    plt.vlines(samples, ymin=0, ymax=kde(samples), color='red', alpha=0.6, linewidth=0.8, label="Sampled Points")

    # Final plot labels and title
    plt.title("Sampling from KDE-Defined Distribution with Sampled Points")
    plt.xlabel("Value")
    plt.ylabel("Density")
    plt.legend()
    plt.show()

def sample_on_distribution(series, pdf_values, sample_size = 10):
    # Normalize PDF values to sum to 1
    pmf_values = pdf_values / pdf_values.sum()
    x_range = np.linspace(min(series) - 1, max(series) + 1, 1000)  # 1000 points across the data range
    samples = np.random.choice(x_range, size=sample_size, p=pmf_values)

    draw_samples_on_histogram(series, x_range, pdf_values, samples)

sample_on_distribution(ages, pdf_values, sample_size = 10)
```

![image](../../../img/chart/population_fitting_[sample_handfull].png)

Points in the ```20-30``` age range are more likely to come up than ages in the ```0-10``` or ```70-80``` ranges. We can even say by how much by comparing the area under those segments of the curve.

```python
def subset_likelihood(series, subset):
    # Fit a KDE to the data
    kde = gaussian_kde(series)
    # Compute the likelihood of each point in the subset
    likelihoods = kde(subset)
    # Compute the overall likelihood of the subset
    subset_likelihood = likelihoods.prod()
    log_likelihood = np.sum(np.log(likelihoods))
    return subset_likelihood, log_likelihood
```

We can also multiply the probability of each point being chosen and compare the likelihood of various subsets. In this function we add together the log probabilities of a likely subset and compare it with an unlikely or random sample to establish the range for a sample of a fixed length.

### Likely Subset

```python
#likely sample
likely_sample = pd.Series([28, 32, 25, 30, 22])
likelihood, log_likelihood = subset_likelihood(ages, likely_sample)
print("Subset Likelihood:", likelihood)
print("Log Likelihood:", log_likelihood)
draw_samples_on_histogram(ages, x_range, pdf_values, likely_sample)

Subset Likelihood: 2.0059300667485313e-08
Log Likelihood: -17.72457291705993
```

![image](../../../img/chart/population_fitting_[likely_subset].png)

### Unlikely Subset
```python
#unlikely sample
unlikely_subset = pd.Series([28, 32, 25, 30, 22])
likelihood, log_likelihood = subset_likelihood(ages, unlikely_subset)
print("Subset Likelihood:", likelihood)
print("Log Likelihood:", log_likelihood)
draw_samples_on_histogram(ages, x_range, pdf_values, unlikely_subset)

Subset Likelihood: 3.5243296326736624e-12
Log Likelihood: -26.37133087287794
```

![image](../../../img/chart/population_fitting_[unlikely_subset].png)

### Random Subset
```python
#random sample
random_sample = generate_samples(x_range, pdf_values, sample_size=5)
likelihood, log_likelihood = subset_likelihood(ages, random_sample)
print("Subset Likelihood:", likelihood)
print("Log Likelihood:", log_likelihood)
draw_samples_on_histogram(ages, x_range, pdf_values, random_sample)

Subset Likelihood: 8.882741892157985e-10
Log Likelihood: -20.84174064895712
```

![image](../../../img/chart/population_fitting_[random_subset].png)

We can clearly see that a likely subset has a higher log likelihood than an unlikely subset with the range being somewhere between -17 and -27 log likelihood with a random sample falling somewhere in the middle. This is a quick and rough method of comparing subset likelihoods and there are other methods to arrive at this measure but the bottom line is that the KDE allows us to both create samples and compare samples of a dataset.