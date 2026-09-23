---
type: artifact
artifact_type: guide
title: LLM Tool Calling
description: Simple and effective tool call example
feature_subtitle: A practical, end-to-end example
feature_summary: A hands-on walkthrough of how to give language models access to external tools. We build a simple calculator tool, wire it up with function calling, and explore how to use it to solve math problems.
date: 2026-07-11
lastmod: 2026-07-11
slug: calculator-tool-call
aliases:
  - /blog/guides/calculator-tool-call/
categories:
  - ai
tags:
  - python
draft: false
image: calculator_tool_call.png
layout: blog-post
toc: true
publish_section: artifacts
params:
  math: true
---

### Simple Math is actually Hard?

A very simple problem with large language models, which frequently gets highlighted, is their poor ability to accurately do simple grade school math. Something that would be easy for human beings, even just in their head, can be surprisingly difficult for these models to do reliably. 

There are many benchmarks for model performance on simple math problems, and their results are often disappointing. This isn't that surprising, given that their training is based on next token prediction, which isn't as well suited to number crunching like a calculator. Computers though, should be very good at number crunching. **If we could just hook up LLMs to a calculator, we could fix this problem.**

### LLM Tool Calls

If we can get the LLM to output something that *looks* like a function call, we can provide some parsing logic, actually execute the request deterministically, and provide the final answer back to the model. This way the model is only concerned with providing the right inputs, for which it can leverage its next token prediction, and then we can be certain that with the right inputs we will also be getting the right outputs. 

### Calculator Example

Let's write the simplest possible LLM tool call for a calculator. We can use Python for this.
A similar example is also provided by OpenAI's [function calling](https://developers.openai.com/api/docs/guides/function-calling#function-tool-example) page.

```python
from openai import OpenAI
import json

client = OpenAI(api_key="your_api_key_here")

# 1. Define a list of callable tools for the model
tools = [
    {
        "type": "function",
        "name": "calculate",
        "description": "Execute a simple arithmetic operation on two integers.",
        "parameters": {
            "type": "object",
            "properties": {
                "first": {
                    "type": "integer",
                    "description": "First number",
                },
                "second": {
                    "type": "integer",
                    "description": "Second number",
                },
                "sign": {
                    "type": "string",
                    "description": "Symbol to execute the operation",
                },
            },
            "required": ["first", "second", "sign"],
        },
    },
]

#2. Define the function logic that will execute when the model calls the tool
def calculate(first: int, second: int, sign: str) -> int:
    if sign == '+':
        return str(first + second)
    elif sign == '-':
        return str(first - second)
    elif sign == '*':
        return str(first * second)
    elif sign == '/':
        return str(first / second)
    else:
        raise ValueError(f'Unknown sign: {sign}')

# Create a running input list we will add to over time
input_list = [
    {"role": "user", "content": "What is 221 * 645?"}
]

print("User Question:")
print("What is 221 * 645?")
print("\n")

# 3. Prompt the model with tools defined
response = client.responses.create(
    model="gpt-4.1-mini",
    tools=tools,
    input=input_list,
)

# Save function call outputs for subsequent requests
input_list += response.output

# 4. If the function call is present in the model's response, attempt to execute it
for item in response.output:
    if item.type == "function_call":
        print("Model Output:")
        print(item)
        print("========LLM Invoked Function Call============")
        print(f"Function Call: {item.name}")
        print(f"Arguments: {item.arguments}")
        if item.name == "calculate":
            # 5. Execute the function logic for calculate
            first = json.loads(item.arguments)["first"]
            second = json.loads(item.arguments)["second"]
            sign = json.loads(item.arguments)["sign"]
            result = calculate(first, second, sign)
            
            # 6. Provide function call results to the model
            input_list.append({
                "type": "function_call_output",
                "call_id": item.call_id,
                "output": result,
            })

            print(f"Function Call Output: {result}")
        print("=============================================")
        print("\n")

# 5. Prompt the model again with function call outputs for final answer
response = client.responses.create(
    model="gpt-4.1-mini",
    instructions="Respond only with the full answer in plain text format.",
    tools=tools,
    input=input_list,
)

print("========LLM Recieved Call Answer============")
print("Final output:")
print(response.output_text)
print("============================================")
```

> [!Important]
> Step 1 in the above code defined what calling the calculate function would require:
> 1. **Type:** function
> 2. **Name:** calculate
> 3. **Parameters:** first, second, sign

When the model registers that calculate would be useful it sends a response to us that looks like this:
```shell
[ResponseFunctionToolCall(
  type='function_call', 
  name='calculate',
  arguments='{"first":221,"second":645,"sign":"*"}'
)]
```

At **step 4** in our code we check for any responses with type **function**. If we find one we parse out the function name. We use the provided paramters to run the appropriate function as a "tool call". Then we simply provide the result of the function to our chat history for the model to observe. 

The last part is simply asking the model to use the output from the function to answer the original question as a sentence which it can easily do.

Here is the full print output of the code block:

```json
User Question:
What is 221 * 645?


Model Output:
ResponseFunctionToolCall(arguments='{"first":221,"second":645,"sign":"*"}', call_id='call_IA3XFzdm5YcamN26Nd7WeISX', name='calculate', type='function_call', id='fc_088a460995856027006a51ee403ea081929c055bb039b6a32c', caller=None, namespace=None, status='completed')
========LLM Invoked Function Call============
Function Call: calculate
Arguments: {"first":221,"second":645,"sign":"*"}
Function Call Output: 142545
=============================================

========LLM Recieved Call Answer============
Final output:
221 multiplied by 645 is 142,545.
============================================
```

> [!Info]
> By providing function calls to the model we can leverage our ability to execute functions reliably so long as the model is able to correctly identify when functions can be invoked and with the right arguments.


### Generating Testing Values

In order to test how well a model can predict random arithmetic operations we have to first generate a few random values so that we can compare the results with and without tool calls.I picked two ways of generating values randomly:

1. For a **linear** approach we pick a random magnitude from -5 to 5 as the exponent and a random value from -1 to 1 and we get a random value back of \([value * 10^{exp}]\)
2. For a **gaussian** approach we use a normal distribution with a set standard deviation. This ensures that our values are a bit closer to what we would consider normal, from around 100 to 0.001 with a low chance of outliers.

Both distributions can be seen visualized below for 100 distinct values.

{{< img src="value_distribution.png" width="600" height="400" caption="generate_graph.py">}}

Unfortunately the values which are generated for negative magnitudes of 10 are compressed into a very smal range inside -1 to 1.

It helps to plot the charts on a scale of magnitude versus their coefficients and draw the regions where 95% of the values (2 sigma) are found for each distribution. In the chart below we see that we get a much tighter range from the gassian distribution than we do from the linearly generated one. Based on the kind of values we want to test with we we can see if the model performs better or worse when the values are more or less spread out. 

{{< img src="scientific_distribution.png" width="600" height="400" caption="generate_graph.py">}}

We can also heatmap the values into a 2D grid to see where the values are concentrated. The heatmaps show the values for both the linear and gaussian distributions. This is a similar view to the sigma region chart above, but it shows the distribution in a more concentrated way.

{{< img src="distribution_heatmaps.png" width="600" height="400" caption="generate_graph.py">}}

{{< row >}}
{{< download src="log_distribution.py" >}}
{{< download src="plot_log_chart.py" >}}
{{< download src="plot_scientific_distribution.py" >}}
{{< download src="plot_distribution_heatmaps.py" >}}
{{< /row >}}

We'll use both of these distributions to generate random values for testing the model's ability to do simple math with and without tool calls. The next step is to run a series of tests using these generated values and compare the results.

### Testing the Model without Tool Calls

With the test data we have available we can pick two random values and a random operator and ask the model to calculate the result without using tool calls. We can then compare the model's output with the actual result of the operation and see how well it performs.





