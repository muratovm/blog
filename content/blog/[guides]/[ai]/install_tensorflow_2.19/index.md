---
title: Installing Tensorflow 2.19
date: 2025-05-07
categories:
    - ai
tags:
draft: true
image: tensorflow.png
layout: blog-post
toc: true
---

### Install Libraries

```bash

#Install build dependencies
sudo apt update && sudo apt install -y \
  build-essential zlib1g-dev libncurses5-dev libgdbm-dev libnss3-dev \
  libssl-dev libreadline-dev libffi-dev libsqlite3-dev wget libbz2-dev

# Download and extract Python 3.12
cd /usr/src
sudo wget https://www.python.org/ftp/python/3.12.3/Python-3.12.3.tgz
sudo tar xzf Python-3.12.3.tgz
cd Python-3.12.3

# Compile and install to /opt (without overwriting system python)
sudo ./configure --enable-optimizations --prefix=/opt/python3.12
sudo make -j$(nproc)
sudo make altinstall

# Add aliases to .zshrc
echo 'alias python3.12="/opt/python3.12/bin/python3.12"' >> ~/.bashrc
echo 'alias pip3.12="/opt/python3.12/bin/pip3.12"' >> ~/.bashrc
source ~/.zshrc

# (Optional) Verify installation
python3.12 --version
pip3.12 --version

#Create virtual environment
python3.12 -m venv tensorflow_venv
#activate virtual environment
source tensorflow_venv/bin/activate

#update pip
pip install --upgrade pip
#install tensorflow
pip install tensorflow[and-cuda]
```

### Run Workload
```python
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # 0 = all logs, 1 = INFO, 2 = WARNING, 3 = ERROR
os.environ['CUDA_VISIBLE_DEVICES'] = '0'  # optional: controls which GPU is visible

import logging
logging.getLogger('tensorflow').setLevel(logging.FATAL)

import time
import numpy as np
import tensorflow as tf
from tensorflow.python.client import device_lib
from tensorflow.keras import mixed_precision
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.applications.resnet50 import preprocess_input


# If using absl-py logging (common in TensorFlow):
try:
    import absl.logging
    absl.logging.set_verbosity('fatal')
except ImportError:
    pass

print(f"Tensorflow Version: {tf.__version__}")
print("Num GPUs Available: ", len(tf.config.list_physical_devices('GPU')))
#print(device_lib.list_local_devices())

# Enable mixed precision
mixed_precision.set_global_policy("mixed_float16")

def run_benchmark(device_name, dtype='float32'):
    with tf.device(device_name):
        # Generate fake data
        x_train = np.random.rand(256, 32, 32, 3).astype(dtype)
        y_train = np.random.randint(0, 1000, size=(256,))
        y_train = tf.keras.utils.to_categorical(y_train, 1000)
        
        
        start = time.time()
        # Build model
        model = ResNet50(weights=None, input_shape=(32, 32, 3), classes=1000)
        model.compile(optimizer='adam', loss='categorical_crossentropy')
        end = time.time()
        print(f"Loading ResNet50 model on {device_name} with {dtype} precision: {end - start:.4f}s")
        
        start = time.time()
        # Timed run
        model.fit(x_train, y_train, epochs=3, batch_size=32, verbose=0)
        end = time.time()

        print(f"ResNet50 training time on {device_name} with {dtype} precision: {end - start:.4f}s")

# Run on CPU
run_benchmark('/CPU:0', dtype='float32')

# Run on GPU (if available)
if tf.config.list_physical_devices('GPU'):
    run_benchmark('/GPU:0', dtype='float32')        # Standard
    run_benchmark('/GPU:0', dtype='float16')        # Mixed precision (activates Tensor Cores)
```


### Output

```
ResNet50 training time on /CPU:0 with float32 precision: 77.7919s 

ResNet50 training time on /GPU:0 with float32 precision: 44.3151s 
ResNet50 training time on /GPU:0 with float16 precision: 38.5496s
```