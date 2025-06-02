---
title: Intro to Image Watermarking
description: The first step to signing your images
date: 2025-05-25
lastmod: 2025-05-25
categories:
  - security
tags:
  - watermarking
  - steganography
draft: false
image: /img/banner/watermark_intro.png
layout: blog-post
toc: true
---

### Intro to Image Watermarking

Watermarking is a technique used to embed information into an image, which can be used for various purposes such as copyright protection, authentication, or non-repudiation. In this guide, we will explore the basics of image watermarking and how you can implement it in your projects.

#### Why Use Watermarking?


>[!Task]Watermarking serves several purposes:
>**Copyright protection:**\
> Watermarks can help protect your images from unauthorized use by clearly indicating ownership.
>
>**Authentication:**\
> Watermarks can be used to verify the authenticity of an image, ensuring that it has not been tampered with.
>
>**Branding:**\
>Adding a logo or signature to your images can help promote your brand and increase recognition.
>
>**Non-repudiation:**\
> Watermarks can provide proof of ownership or authorship, making it difficult for others to deny their use of the image.


#### Basic Techniques for Watermarking
##### 1. Visible Watermarking
One of the simplest methods of watermarking is to alter the pixel values of an image. This is usually done for copyright protection or branding purposes. The watermark can be a logo, text, or any other image that is blended with the original image. This type of watermarking is immediately noticeable and can be readily removed by someone with image editing skills, but it serves as a visible deterrent against unauthorized use.

{{< img src="/img/image/shutterstock_watermark.jpg" alt="Prompting Flow" class="img-fluid" >}}

##### 2. Least Significant Bit (LSB) Insertion
Least significant bit insertion is a subset of steganography where a hidden message is imbedded into an image to bypass detection. The simplest method involves modifying the least significant bits (LSBs) of pixel values, which allows for a more robust and imperceptible watermark.

{{< img src="/img/image/least_significant_bit_description.png" >}}

##### 3. Frequency Domain Manipulation
This method involves transforming the image into the frequency domain using techniques like the Discrete Cosine Transform (DCT) or Discrete Wavelet Transform (DWT). Watermarks can then be embedded in the frequency coefficients, which are not visible to the human eye.

These techniques are more complex but provide better security and robustness against attacks such as cropping, resizing, or compression. We will cover the DWT in a more advanced quide.

{{< img src="/img/diagrams/dwt.png" caption="https://www.intechopen.com/chapters/18615" class="img-fluid" >}}

### Least Signifiacant Bit Watermarking
To implement watermarking in your images, you can use various libraries and tools available in programming languages like Python, Java, or C#. Here’s a simple example using Python with the stegano library.
```python
import cv2

def embed_lsb(image_path, message, output_path):
    image = cv2.imread(image_path)
    flat = image.flatten()

    # Convert message to binary
    bits = ''.join([format(ord(i), '08b') for i in message]) + '00000000'  # Null terminator
    for i in range(len(bits)):
        flat[i] = (flat[i] & ~1) | int(bits[i])  # Set LSB

    watermarked = flat.reshape(image.shape)
    cv2.imwrite(output_path, watermarked)

def extract_lsb(image_path):
    # Load image and flatten to 1D array
    image = cv2.imread(image_path).flatten()
    bits = ""
    for byte in image:
        bits += str(byte & 1)  # Get LSB

        # Check every 8 bits for null terminator
        if len(bits) % 8 == 0:
            char = chr(int(bits[-8:], 2))
            if char == '\x00':
                break

    # Convert full bitstring to characters (excluding null terminator)
    message = ''.join(
        chr(int(bits[i:i+8], 2)) for i in range(0, len(bits)-8, 8)
    )
    return message

if __name__ == "__main__":

    # Example usage
    embed_lsb("image.png", "Secret Watermark", "output.png")

    message = extract_lsb("image.png")
    print("Extracted message:", message)

    message = extract_lsb("output.png")
    print("Extracted message:", message)
```

This code opens an image, creates a watermark with text, and combines the two images before saving the result. You can customize the watermark text, position, and opacity as needed.

### Watermarking Example

{{< columns cols="2" minWidth="180px" gap="1.5rem" >}}

{{< img src="/img/image/portrait.png" caption="Original Image" class="img-fluid" >}}

{{< img src="/img/image/watermarked_portrait.png" caption="Watermarked Image" class="img-fluid" >}}

{{< /columns >}}

### Reading the Watermark
To read the watermark from an image, you can reverse the process by extracting the pixel values or frequency coefficients where the watermark was embedded. This can be done using similar libraries and techniques as mentioned above.

#### Using the extract_lsb function

>[!Success] Results
> **Original Image Text:**\
> ÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿ
>
> **Watermarked Image Text:**\
> Secret Watermark