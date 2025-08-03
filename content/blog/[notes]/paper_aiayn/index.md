---
title: Paper Notes - Attention is All You Need
date: 2025-07-27
categories:
    - ai
tags:
    - paper
    - transformer
draft: false
image: paper_aiayn.png
layout: blog-post
toc: true
---

>[!References]
> [💻 Attention Is All You Need](https://proceedings.neurips.cc/paper_files/paper/2017/file/3f5ee243547dee91fbd053c1c4a845aa-Paper.pdf)
>
> A great video explaining the paper is available on [YouTube](https://www.youtube.com/watch?v=bCz4OMemCcA) by **Umar Jamil**

### Context

The `Attention Is All You Need` paper is hailed as perhaps the biggest turning point in artificial intelligence research, promoting the adoption of the transformer and pushing AI from science fiction into the mainstream discourse with the release of ChatGPT based on this same architecture.

Before the attention mechanism, the main components of language models were the `recurrent neural networks (RNN)`, later refined as `long short-term memory (LSTM)` units. The issue with these models was that their execution had to be computed step by step, in order, making it hard to parallelize and run on GPUs, which we now know are the backbone of modern AI training.

The paper proposes a new architecture called the `Transformer`, which is based on the attention mechanism, solving the issues of parallelization and improving dependency learning over longer sequences, the main focuses of this paper.

### Attention Mechanism

So how do we relate words to each other in a sentence without treating it as a continuous sequence? The attention mechanism takes the approach that all words have **some** level of relationship to each other and computes these relationships at the same time. In order to do this, each word's embedding is transformed into three vectors: `Query`, `Key`, and `Value`. The attention mechanism then computes a weighted sum of these values between words to determine how much **attention** each word should pay to all other words in the sequence.


### Self Attention

Self attention computes the attention between a single word, and all the words in the sequence in relation to it. 

### Multi Head Attention

Multi Head attention is does the attention learning with multiple starting conditions for the `Query`, `Key`, and `Value` vectors, allowing the model to learn different but similar relationships between words. The paper uses 8 different attention heads, each having 512/8 = 64 dimensions, which are then concatenated to produce a final output of 512 dimensions per word.


### Transformer
The architecture is popularized by this image, which shows the main components of the transformer architecture. The transformer is made up of an `encoder` and a `decoder`, each containing multiple layers of attention and feed-forward networks.

![alt text](architecture.png)


### Architecture

