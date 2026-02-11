---
title: Binary Search in Python
description: And you don’t need to memorize how binary search works
date: 2021-06-27
lastmod: 2021-06-27
slug: binary-search-python
aliases:
  - /blog/guides/binary-search-python/
categories:
  - data structures
tags:
  - python
  - trees
  - recursion
draft: false
image: binary_search.webp
layout: blog-post
toc: true
kind: artifact
publish_section: artifacts
---

I always get anxious when I see a problem that involves a sorted list because I know that it’ll inevitably involve using binary search.

This fear is completely irrational, and I always kick myself for feeling this way because binary search is beautiful. Given a sorted list you can find the index of any value in log(N) time because you get to cut your search space in half with every lookup.

{{< img src="table.webp" width="600" height="400" caption="geeksforgeeks.org/binary-search">}}

Precisely this operation allows sorted lists to be very space and time efficient at solving problems requiring lookups as well as determining how many entries are greater or less than your target.

Now if you want to take advantage of your sorted lists you may be tempted to write your own binary search and insert functions like I’ve been doing so far and inevitably it takes a few tries to actually get it working right. Thankfully there’s a built in library that already does the same thing, in a single line and a lot faster too.

### Bisect

The bisect library is a tiny one, but it does two things and it does them well; **search** and **insert**.

For search we have **bisect_left** and **bisect_right** which perform binary search to find where to insert a value right before our target on either the left or right. In the case of **bisect_right** it will overshoot by one index to show you where you should insert your new value to maintain order.

list: [1,2,3,4,5], target = 4

- **bisect_left**: [1,2,3, _ , 4,5] index= 3
- **bisect_right**: [1,2,3,4, _ ,5] index= 3+1

For insertion we have **insort_left** and **insort_right** which perform binary insert to actually insert our value on either the left or the right of our target and manipulates our list inplace.

- **insort_left**: [1,2,3, 4 ,4,5] inserted index= 3
- **insort_right**: [1,2,3,4, 4 ,5] inserted index= 3+1

Apart from **bisect** and insort which are equivalent in function to **bisect_right** and **insort_right** respectivly, these are the only functions available in this library. However they completely replace the need to write your own functions for lookups and inserts.

### Bisect is Fast

```python
def binary_search(lst, target):
    start, end = 0, len(lst) - 1
    while start <= end:
        middle = (end+start)//2
        if target > lst[middle]:
            start = middle + 1
        elif target < lst[middle]:
            end = middle - 1
        else:
            return middle
    return -1
```

And here’s a binary race between it and bisect. We’ll be looking for value 0 because ironically it will take the longest to find with binary search since 0 is never in the middle of anything.

```python
#list and target
input_list = list(range(1000000))
target = 0

#my binary search
start = time.time()
index = binary_search(input_list, target)
duration = time.time() - start
print("search found {} at index {} in {} seconds".format(target,index,duration))

#bisect binary search
start = time.time()
index = bisect.bisect_left(input_list, target)
if index == len(input_list) or input_list[index] != target:
    index = -1
duration = time.time() - start
print("bisect found {} at index {} in {} seconds".format(target,index,duration))
```

- search found 0 at index 0 in **1.6927719116210938e-05 seconds**
- bisect found 0 at index 0 in **2.6226043701171875e-06 seconds**

Here we can see that bisect is **6** times faster than my implementation

Because bisect is implemented in C it is much faster, though both functions use the exact same algorithm. Python is just a lot slower at adding numbers than C because all numbers in Python are actually Integer classes which in turn take time to call their addition functions whereas in C integers are just 4 byte data types and are processed very efficiently by the CPU. The difference in time can start to compound into a tangible boost in performance when you start doing many lookups or insertions sequentially.

### Conclusion

Bisect is a small but useful library that helps maintain sorted order in lists as well as providing lookups in a quick and efficient way. Knowing about its existence can save on both implementation and runtime and it is an indespensible tool for many coding interviews where questions about sorted lists tend to crop up from time to time.
