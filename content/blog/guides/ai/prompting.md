---
title: The Anatomy of a Good Prompt
description: A guide to writing effective prompts for text based models.
date: 2025-05-29
lastmod: 2025-05-29
categories:
  - ai
tags:
  - prompting
draft: false
image: /img/banner/prompting.png
layout: blog-post
toc: true
---

> [!Note]
> This is a guide to writing effective prompts for text based models based on my experience. It is a work in progress and will be updated as I learn and improve.

### Prompting Basics

>[!Tip] Definition:
> Prompting is the process of crafting requests to direct a language model's output.

We all know how difficult it can be to understand **exactly** what some else is saying, especially if they are a poor communicator. When it comes to working with language models, generally the same problem arises. 

How do you carry across your intention with enough context and without any extra fluff? How do you make someone else get it? To feel what you're feeling in the same way.

This problem isn't really new, writers and communicators have been iterating on effective models for translating their ideas into others' minds for centuries. The challenge we're facing now is that we're no longer trying to speak to another human being, we're speaking to a machine that somehow understands what we're saying.

### Why Prompt Engineering Matters

AI models aren't magic.

At the very core the models act as fancy autocomplete machines. You give them a bit of information to get started, and they give you whatever information is likely to come next.

You have the best chance of getting a useful response when you give clear, specific, and contextual prompts. If your question aligns with the model's training data, you're more likely to get an answer that the model has seen before, and relates back to your question.
### Key Principles of Effective Prompting

#### 1. Role Assignment
Models tend to work well when you set the scene by placing them in an appropriate environment. Telling the model that it should act as a developer, writer, philosopher, etc. can help activate the parts of the model which are familiar with that role's tasks.

>[!Example]
> 
> Role: **You are a senior software developer.**
> 
> Write a function in Python that calculates the factorial of a number.
> 
> Include comments and testing examples.

In this example, the model is given a specific role to play, which helps give contextual information for the kind of information the user is looking for. By specifying that the model should act as a senior software developer, the model is more likely to generate a response that was produced by a senior developer, rather than a beginner or intermediate one. This behavior is not guaranteed, but it helps build a foundation for the rest of the prompt.

#### 2. Context
Some problems which are more difficult than the example above require additional context. If you ask the model to pick the best gardening tool, you likely won't get satisfying answer. What does best mean? In what context? Some things are better than others in different contexts. A rake is better in autumn while a shovel is better in spring. There are countless ways to approach even what seems like a simple question. 

>[!Example]
>Suggest the best gardening tool for repotting
>
>**Context:**
>
>I am a novice gardener and I would like to repot an orchid with long external roots. The plant is housed in a room temperature and mildly humid environment. The repotting will be from a smaller ceramic pot into a larger glass vase. I will need to transfer all the dirt from the original pot into the new one. I'm doing this because the plant has overgrown the pot it is in now.
>

Notice we hit on the common **Who, Where, What, How, Why** contextual information for all the important aspects of the problem.
#### 3. Instruction

Models hate vague language. When trying to get a specific answer, it's important to be clear about what you're asking and using direct language. Using phrases like "What do you think about" or "Can you tell me" can lead to vague responses. Instead, use direct instructions like "List the top 5 features of X" or "Explain how Y works".

>[!Error] Bad Examples
>
>- What do you think is the best programming language?
>
>- Can you write a paragraph about why tomatoes are good for you?

>[!Success] Good Examples
>
>- **Rank** the top 5 programming languages for web development in 2025, best to worst based on popularity and community support.
>
>- **Give a detailed explanation** of the health benefits of tomatoes, including their nutritional value and how they can be incorporated into a balanced diet.

Using direct language helps the model understand that you're looking for a specific answer, rather than a general opinion or vague response. Unless you want the model to yap yap yap a stream of consciousness, it's best to avoid open-ended questions and instead use clear, concise instructions.

#### 4. Thought Process
It's been shown in multiple papers and studies that models perform better when they are asked to think step by step. This is especially true for complex problems or tasks that require multiple steps to complete.
>[!Example]
> Solve the following math problem **step by step**:
>
> What is the integral of x^2 + 3x + 2 with respect to x?

When you ask the model to think step by step, it breaks down the problem into smaller parts and provides a more detailed and accurate response. Because models generate text in ["zero-shot"](https://www.promptingguide.ai/techniques/zeroshot) they don't get to think about the problem in the same way a human would. By asking the model to think step by step, it will generate additional context and reasoning that can lead to a more accurate and useful response as it builds on its own answer.

#### 5. Output Format
When you want the model to return a specific format, it's important to specify that in your prompt. This can include things like bullet points, tables, or JSON. You're not always guaranteed to get the exact format you want, but specifying it can help guide the model's output.

>[!Example]
> Populate a table of the best sleep  habits for improving sleep quality.
>
> **Output Format: Table**
>
> **Habit | Description | Benefits | Impact Score**

This will help the model understand that you want the output in a specific format, a table in this case, and it will try its response as a table. If you don't specify the format, the model may return the information in a paragraph or list format, which may not be what you want.

The following are my personal go-to output formats:

| Type          | Use Case                          |
|---------------|-----------------------------------|
| Markdown      | For leisure reading                |
| Bullet Points | For a quick overview or summary   |
| Tables        | For comparisons or structured data |
| JSON          | For coding and testing purposes    |

#### 6. Examples

Examples separate the good prompts from the great ones. When you provide examples, you're giving the model a clear idea of what you're looking for. This also mimics the way the model was trained, with examples of input and output. Including examples can help guide the model's response and improve its accuracy.
>[!Example]
> Give me a list of jsons for capital cities and their countries.
>
> **Example 1:**
>
> [{
>   "country": "France",
>   "capital": "Paris"
> }]
>
> **Example 2:**
>
> [{
>   "country": "Japan",
>   "capital": "Tokyo"
> },
> {
>   "country": "Canada",
>   "capital": "Ottawa"
> }]

The examples you provide should be relevant to the task and replace the responses you would like the model to generate. It can be tedious to write out examples, but it's worth the effort. The more specific and relevant the examples, the more likely the model will perform at its best.

#### 7. Iteration
Prompting is an iterative process. You may not get the desired response on the first try, and that's okay. It's important to refine your prompts based on the model's responses. If the model doesn't understand your prompt or gives an incorrect answer, try rephrasing it or adding more context.
>[!Tip]
> Iteration is key to effective prompting. Don't be afraid to experiment with different prompts and refine them based on the model's responses.

### Full Prompt
After understanding the key principles of effective prompting, it's important to put them all together into a cohesive prompt. A well-structured prompt should include the role assignment, context, direct instructions, thought process, output format, and examples.

Here's a full example of a prompt that incorporates all the principles we've discussed:

>[!Task] Prompt
> **Role**: You are a senior software developer.
>
> **Instruction**:
> Write a function in Python that calculates the factorial of a number.
> Include comments and testing examples.
> 
> **Context:**
> I am working on a project that has strict requirements for performance and accuracy. The function should handle edge cases, such as negative numbers and zero. The function should have a valid docstring and be well-commented. Use the logging module to log any errors or exceptions.
>
> **Thought Process**:
> Think step by step about how to calculate the factorial of a number in any language. Consider edge cases and how to handle them.
>
> **Output Format:**
>```python
>def factorial(n:int) -> int:
>    """Your code here"""
>    return result
>```
>
>**Example 1:**\
>factorial(5) = 120
>
>**Example 2:**\
>factorial(0) = 1
>
>**Example 3:**\
>factorial(-3) = throw "Error: Negative numbers do not have a factorial."

This prompt sets the role, provides context, gives clear instructions, asks the model to think step by step, specifies the output format, and includes an example. By following these principles, you can create effective prompts that lead to better responses from language models.

>[!Abstract]ChatGPT 4o Response
> ```python
>import logging
>
>#Configure logging
>logging.basicConfig(level=logging.ERROR, format='%(asctime)s - %(levelname)s - %(message)s')
>
>def factorial(n: int) -> int:
>    """
>    Calculate the factorial of a non-negative integer using an iterative approach.
>
>    Parameters:
>    n (int): A non-negative integer whose factorial is to be computed.
>
>    Returns:
>    int: The factorial of the input integer.
>
>    Raises:
>    ValueError: If the input is a negative integer.
>
>    Examples:
>    >>> factorial(5)
>    120
>    >>> factorial(0)
>    1
>    >>> factorial(-3)
>    ValueError: Negative numbers do not have a factorial.
>    """
>    if n < 0:
>        logging.error("Invalid input: Factorial is not defined for negative numbers.")
>        raise ValueError("Error: Negative numbers do not have a factorial.")
>
>    result = 1
>    for i in range(2, n + 1):
>        result *= i
>
>    return result
> 
> #Example test cases
> if __name__ == "__main__":
>    try:
>        print("factorial(5) =", factorial(5))  # Expected: 120
>        print("factorial(0) =", factorial(0))  # Expected: 1
>        print("factorial(-3) =", factorial(-3))  # Should raise ValueError
>    except ValueError as e:
>        print(e)


In the response, the model has provided a Python function that calculates the factorial of a number, including error handling for negative inputs. The function is well-documented with a docstring, and it uses the logging module to log errors. The examples provided in the prompt are also reflected in the code comments and test cases. Overall a successful response that includes everything we asked for and is verifyably correct.

### Conclusion
Prompting is a skill that takes time and practice to master. By following the principles outlined in this guide, you can improve your prompting skills and get better results from language models. 

Remember the key principles of effective prompting:
- Assign a role to the model
- Provide context
- Use direct instructions
- Ask the model to think step by step
- Specify the output format
- Include examples
- Iterate on your prompts based on the model's responses

Different models come and go, but the principles of effective communication remains the same. As you continue to work with language models, keep experimenting and refining your prompts to get the best results.

Prompting is an art and a science, and the more you practice, the better you'll become.

Happy prompting!

### Resources

- [OpenAI Prompting Document](https://cookbook.openai.com/examples/gpt4-1_prompting_guide)
- [OpenAI Examples](https://help.openai.com/en/articles/6654000-best-practices-for-prompt-engineering-with-the-openai-api)
- [Anthropic Prompting Guide](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview)
- [Prompting Guide](https://www.promptingguide.ai/)

{{< columns cols="2" minWidth="180px" gap="1.5rem" >}}

{{< img src="/img/diagrams/prompting_[prompting_flow].png" alt="Prompting Flow" class="img-fluid" >}}

{{< img src="/img/diagrams/prompting_[prompting_text].png" alt="Prompting Flow" class="img-fluid" >}}

{{< /columns >}}