---
title: Toy Car Reinforcement Learning
description: Undergraduate introduction to machine learning on human generated data
date: 2019-08-11
lastmod: 2019-08-11
slug: toy-car-ml
aliases:
  - /blog/builds/toy-car-ml/
categories:
  - ai
tags:
  - python
  - android
  - reinforcement learning
  - tensorflow
draft: false
image: toycar.webp
layout: blog-post
toc: true
kind: artifact
publish_section: artifacts
---

### Introduction

As a team of three undergraduate students, we were tasked with building a concept self driving car in our winter semester. Not having much experience in data science or machine learning meant that the production process was a mess, although looking back we probably could have made the same amount of progress in a fraction of the time.

This article is for those who are interested in what it takes to build a functioning self driving car in record time, on a budget, without the headaches that we had to go through! I don’t go too much in depth on all the details but there are a few snippets of code to spice things up. Also if you are interested in the code you can help yourself to our Github page, https://github.com/RoboticsCourse, but be warned that it’s not documented and was not created for general use.


### What We’ll Need:
- [Remote Control/Demo Car](https://www.amazon.com/dp/B09YTG1LFD/ref=sspa_dk_detail_3?psc=1&pd_rd_i=B09YTG1LFD&pd_rd_w=3pESF&content-id=amzn1.sym.386c274b-4bfe-4421-9052-a1a56db557ab&pf_rd_p=386c274b-4bfe-4421-9052-a1a56db557ab&pf_rd_r=6RPTHKRZEY7TXSRJBBEG&pd_rd_wg=7xuuP&pd_rd_r=24695953-241e-4d3d-9f00-f71d2b63e104&s=toys-and-games&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM)
- [Arduino Uno board](https://www.amazon.com/gp/product/B008GRTSV6/ref=as_li_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B008GRTSV6&linkCode=as2&tag=michaelmurato-20&linkId=5f8175e1eb6844326ad63db3658f1215)
- [Motor Shield](https://www.amazon.com/gp/product/B00PUTH3B0/ref=as_li_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00PUTH3B0&linkCode=as2&tag=michaelmurato-20&linkId=11c76b435eb0e749b7ecf059377394c2)
- [Bluetooth BLE Module](https://www.amazon.com/gp/product/B01HN72K14/ref=as_li_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B01HN72K14&linkCode=as2&tag=michaelmurato-20&linkId=2419b3f00601a89ef9ec37ea1cad1ecf)
- 2 Mobile Devices


### Cars are meant for driving

First of all, we wanted to finely control the motion of the car, and the best way to do that was to throw away the controller that came with the original car and instead use an Arduino board. Since they’re programmable and compatible with a whole suite of additional modules which we could buy online for cheap, it was amazing for prototyping. The board we used was the Arduino UNO Rev3 which you can get for $20.

Now to actually be able to control the car via the Arduino board we had to hook it up to a Motor Shield which is a useful little add-on that gives you the ability to power a variety of motors from your Arduino board with just a few lines of code. The snippet bellow shows a simple implementation.

```cpp
void Navigation::goForward(int speed) {
    frontMotor->setSpeed(speed);
    frontMotor->run(FORWARD);
    rearMotor->setSpeed(speed);
    rearMotor->run(FORWARD);
}

void Navigation::goBackward(int speed) {
    frontMotor->setSpeed(speed);
    frontMotor->run(BACKWARD);
    rearMotor->setSpeed(speed);
    rearMotor->run(BACKWARD);   
}

void Navigation::SteerSpeed(int speed){
  if(speed > 0) turnMotor->run(FORWARD);
  else {
    speed *= -1;
    turnMotor->run(BACKWARD);
  }
  turnMotor->setSpeed(speed);
}
```

An important implementation challenge was that there is no way to specify distances that the motor will be doing useful work over but instead you must pass in the speed the motor will turn at and the time interval. This means that deepening on the amount of power supplied by the motor, you are responsible for fine tuning these measurements.

Ours ran three DC Motors which were well supported by our Motor Shield. This setup guide really helped us set up and run this configuration.

{{< img src="arduino.webp" width="600" height="400" >}}

Now that the Arduino + Motor Shield were all hooked up, and the motors were buzzing we gained the ability to control the car through its new small Arduino brain. However this early in the project it could only follow pre-programmed instructions in a loop and it was time to test what we’ve built.

### Manual Control

The next step was to hook up a way to control the car manually, which turned out to be really useful in the training phase. A really handy module available in the Arduino arsenal is the Bluetooth Low Energy chip (BLE). The setup is quick and there’s available example source code for mobile devices to BLE connection so it only took us some minor tweaking to get the board connected to one of our phones.

We used an Android phone to interface with the chip, the the help of this [BLE Android project](https://github.com/googlearchive/android-BluetoothLeGatt). That sample code is an example of Bluetooth text messaging which is very similar to what we’ll be doing to communicate with the car, in fact our implementation will be even simpler.

All it takes is to scan for local Bluetooth devices and connect to the chip, after which we can start sending and receiving messages in a few lines of code! This gave us the freedom to go wild with the input type for the car controller, with my preference being a simple joystick. By sending messages such as S10 (Steer Left at speed 10) or F -100 (Go backwards at speed 100), with S representing the steering motor and F representing the front and back motors, we could encode directions for the car in just a few bytes.

{{< img src="android.webp" width="600" height="400" >}}

The latency between the controller and the car proved to be nonexistent and even worked for up to 10m away with no issues. At this point the car was controllable in the same way it was before, if not better. The next step was to actually make car drive on its own and after a few failed attempts at coming up with logic for the car, we turned to neural networks.

### Machine Learning Needs Data

Since with neural networks we really can’t get anywhere without gathering a large data set, it’s time to roll out the car and gather sweet data. Like any explorer venturing out into the unknown, our car will want to record all of its experiences for future self reflection. This means that we’ll need one mobile device to drive the car (from the implementation above), and another device with a camera strapped to the front of the car.

{{< img src="train_process.webp" width="150" height="100" caption="Mobile devices in red">}}

Because our budget was small we strapped a second phone to the car to record video as the car drove around. The input data we could collect was what the camera on the car can see and the logs left by the controller app as a human pilots the car with the other phone. As it turns out, this setup we had now, was the bare minimum required to train a neural network, featuring the input set and a label set.

The input set was the data captured by the camera on the car, and the label set was the input of the human driver piloting the remote car. Now how does that second set work as a label set exactly?

### Imitation Learning

Do you remember the very first steps you took as a child? Chances are you did not. Even before conscious thought develops in the brain, its capacity to imitate the actions of other people are baked into the wiring of our brains and it allows for learning at an astonishing rate. Our car can’t “walk” yet but just like in the case of the baby, it’s our job to give it an example to follow.

By having a method of controlling the car and logging the input from the human, our car can learn what input it should supply to itself over time and become as good as the pilot.

{{< img src="test_process.webp" width="150" height="100" caption="Celebrate while you still can, human">}}

### Gathering the Data

We created a diagram of extreme values for the joystick. The first coordinate value being the degree of steering (x axis) and the second value being the amount of motion (y axis). Having a line of (0,0) cut through the middle of the joystick allowed for a gradient of speed between moving full force forward and moving full force backwards, reducing the wear and tear on our motors, and with maximum steering at 45 degree angles.

{{< img src="input.webp" width="600" height="400" >}}

Below is the trigonometry that constrains the input joystick to a circle

```java
float x = event.getX()- (circle.getWidth() >> 1);
float y = event.getY()- (circle.getHeight() >> 1);

double distance = Math.sqrt(Math.pow(x,2)+ (float) Math.pow(y,2));
double angle  = Math.atan2(x,y);

if (distance > circle.getWidth()/2){ //if outside the joystick

    cursorX = (float) ((circle.getWidth()/2)*Math.sin(angle));
    cursorY = (float) ((circle.getHeight()/2)*Math.cos(angle));

    cursorX+=circle.getX() + (circle.getWidth() >> 1) - (control.getWidth() >> 1);
    cursorY+=circle.getY() + (circle.getHeight() >> 1) - (control.getHeight() >> 1);
}
else{ //if inside the joystick
    cursorX = x+circle.getX() + (circle.getWidth() >> 1) - (control.getWidth() >> 1);
    cursorY = y+circle.getY() + (circle.getHeight() >> 1) - (control.getHeight() >> 1);
}
control.setX(cursorX);
control.setY(cursorY);

final int vector_X = (int)(circle.getX() + circle.getWidth()/2 - control.getWidth()/2 - cursorX) * 255/(circle.getWidth()/2);
final int vector_Y = (int)(circle.getY() + circle.getHeight()/2 - control.getHeight()/2 - cursorY) * 255/(circle.getHeight()/2);

int final_distance = (int) (dist*distance);
if(vector_X < 0){
      final_distance *= -1;
}

distance = (int) Math.sqrt(Math.pow(vector_Y, 2) + Math.pow(vector_X, 2));

//get scaled values between -255 and 255 for X and between -150 and 150 for Y

float dist = 0;
if(Math.abs(vector_X) >= Math.abs(vector_Y)){
    if(vector_X != 0){
        dist = (float) Math.abs(vector_Y)/Math.abs(vector_X);
    }
}
else{
    if(vector_Y != 0) {
        dist = (float) Math.abs(vector_X)/Math.abs(vector_Y);
    }
}

int final_distance = (int) (dist*distance);

final int final_X = final_distance;
final int final_Y = vector_Y * 150/255;
```

The result was an input range of -150 and 150 for Y and between -255 and 255 for X, the values for Y were smaller because we didn’t want the car to move too fast but a full range of steering was crucial. Below are the results of a training session.

{{< img src="training_data.webp" width="600" height="400" >}}

Each dot on the above graph represent the location of the finger on the trackpad at the time that a training image was sliced from the video. The top part represents forward motion, the bottom backwards motion and when the car steered it produced dots that form the diagonals of this hourglass shaped graph. We cut the data into a few logical sectors,

1. Forward

2. 50% Forward

3. Forward Left

4. Forward Right

5. Backward

6. 50% Backward

7. Backward Left

8. Backward Right

And “Stop” which proved to be pretty disastrous because at some point the car would learn to permanently stop.

Collecting the image data was somewhat easier, all we had to do was record a video while the car was being driven. Here’s a link to a sample [android project](https://github.com/googlearchive/android-Camera2Video) that records a video and saves it to storage when you’re done, we used the same code to capture our videos and even your ordinary camera app works if you don’t want to implement anything custom. The only meta data that’s required is the length of the video and when the recording was initiated.

### Combining Inputs and Labels

In order to match the correct actions with what the car is actually seeing we have to bring the two data sets together. By splitting the training video captured by the front facing camera and time stamping it into separate images we can match them to the timestamp of a log from the controller’s input.

The video was split into 4 images per second of video, although with a 30fps recording we could have gone for a lot more detail. On the other hand our mobile device could capture hundreds of actions on the touchscreen per second, requiring us to disregard most of the data for picking one log per image from the video. Both data sets where submitted to a python script to slice the videos and create matching (image, log) pairs.

{{< img src="footage.webp" width="600" height="400" caption="Each training frame receives one direction label">}}

After driving the car around our building for a bit, we gathered close to 7000 pairs of images and associated human control label pairs. Due our small budget and running the neural network on a phone, we had to down sample our images to 50x50 pixels so that our setup had a fighting chance of working in real time.

### Using Neural Networks

This was arguably the most exciting and frustrating part of the project, the machine learning. Because we wanted the car to drive on its own we wanted the on board phone to accomplish both the seeing and the steering for the car. Both were indeed possible. We fully utilized the OpenCV Android library to obtain an image for every time the camera screen was updated as well as running a separate thread to control the Bluetooth chip on the car. We used this [android project](https://medium.com/android-news/a-beginners-guide-to-setting-up-opencv-android-library-on-android-studio-19794e220f3c) as an introduction to OpenCV and it got us to a point were we could obtain individual frames of the camera in real time. All that was left to do was to complete a forward pass on our network model with images supplied by the library’s onCameraFrame() function every time there was a new frame.

```java
public Mat onCameraFrame(CvCameraViewFrame inputFrame) {
  mGray = inputFrame.gray();
  Mat mEqualized = new Mat(mGray.rows(), mGray.cols(), mGray.type());
  
  //normalize the image
  Imgproc.equalizeHist(mGray, mEqualized);
  
  //convert the frame into a scaled bitmap
  Bitmap bitmap = Bitmap.createBitmap(mEqualized.cols(), mEqualized.rows(), Bitmap.Config.RGB_565);
  Utils.matToBitmap(mEqualized, bitmap);
  final Bitmap scaled_bitmap = Bitmap.createScaledBitmap(bitmap, 50, 50, false);

  //get output from the neural net model
  int[] shape = model.get_Interpreter().getInputTensor(0).shape();
  final ArrayList<String> output = inferencer.multiImageInference(model, scaled_bitmap, shape[shape.length-1]);
}
```

At this point we could either write our own native neural network , or we could use Google’s [Tensorflow Lite](https://ai.google.dev/edge/litert) library to load a python Keras model directly onto the phone. We went with Keras for the simplicity and existing collection of examples we could reference.

The only downside to this approach was that because the model file could no longer be changed on the Android phone, our car would not be able to use reinforcement learning to learn as it drove on its own. Fortunately this was a sacrifice we were willing to make.

With a basic Keras Sequential CNN model we pumped an input image of 2500 pixels into the series of Convolution and Max Pooling layers. We then converged the model into a dense layer at the end to give us 9 categories of output. For each output we would get a confidence value of how much the car was willing to follow any of the given directions. This was done because it’s not important for the car to make fine movements, the categories we specified above were enough.

### Neural Network Architecture

```python
model = Sequential()
model.add(layers.Conv2D(32, kernel_size=(3, 3),
                 activation='relu',
                 input_shape=(50,50,10), 
                 name='my_layer'))
convout1 = Activation('relu')
model.add(convout1)
model.add(layers.MaxPooling2D(pool_size=(2, 2)))
model.add(layers.Conv2D(64, (3, 3), activation='relu'))
convout2 = Activation('relu')
model.add(convout2)
model.add(layers.MaxPooling2D(pool_size=(2, 2)))
model.add(layers.Dropout(0.25))
model.add(layers.Flatten())
model.add(layers.Dense(128, activation='relu'))
model.add(layers.Dropout(0.5))
model.add(layers.Dense(numBins, activation='softmax'))
```

Above is a Keras model we used for our car. It is relatively small and the gist of it is that it converts a 50x50 array of an input image into an array of 9 confidence outputs for each of the joystick colored sectors.

After a few weeks of tweaking we settled on this model that worked fairly well, giving us a 95% success rate with a sizable test set of 30% of our entire training database. The laststep was to save the Keras library as a tflite file and feed it to the Interpreter on the phone.

Tensorflow Lite has the amazing functionality of exporting the python written model into a tflite file which can be used by a Tensorflow Lite interpreter on any other system.

```python
model_json = model.to_json()
with open("model.json", "w") as json_file:
    json_file.write(model_json)

keras_file = "model.h5"
model.save(keras_file)

converter = lite.TFLiteConverter.from_keras_model_file(keras_file)
tflite_model = converter.convert()
open("model.tflite", "wb").write(tflite_model)
```

This model is simply loaded as a TFLite interpreter object which can then use the simple run() function on an input image to create a prediction.

```java
public Interpreter load_internal_model(String model_name) throws IOException {
        tfliteModel = loadModelFile(model_name);
        tflite_interpreter = new Interpreter(tfliteModel);
        return tflite_interpreter;
}

private ByteBuffer loadModelFile(String model_name) throws IOException {
        AssetFileDescriptor fileDescriptor = activity.getAssets().openFd(model_name);
        FileInputStream inputStream = new FileInputStream(fileDescriptor.getFileDescriptor());
        FileChannel fileChannel = inputStream.getChannel();
        long startOffset = fileDescriptor.getStartOffset();
        long declaredLength = fileDescriptor.getDeclaredLength();
        return fileChannel.map(FileChannel.MapMode.READ_ONLY, startOffset, declaredLength);
}
```

Now taking this model we can saved it into the memory of our phone and run it with the TensorFlow Interpreter to simply do a forward pass on the model.

```java
float[][][][] float_pixels = new float[1][50][50][num_saved];
float[][] outputVal = new float[1][9];

for(int i = 0; i < 50; i++){
    for(int j = 0; j < 50; j++){
        for(int b = 0; b < num_saved; b++){
            float_pixels[0][i][j][b] = (float) int_bitmaps.get(b)[i*50+j]/255;
        }
    }
}

try{
    tflite_interpreter.run(float_pixels,outputVal);
}catch (Exception e){
    e.printStackTrace();
}

//outputVal is now contains confidence values for all the sectors
```

The sector with the highest confidence was taken as the action to execute by the car and finally all the pieces were in place.

{{< youtube F036dy1oTcA >}}

### Conclusion

At this point we had the car built, data collection set up and a neural network dictating the controls. The car was driving with the expertise of a 6 year old with a controller. It can safely be said that we were not winning any Grand Prix any time soon but the car was able to drive around on its own without crashing itself, with surprising reliability.

In any case we were happy that something that we’ve built over a semester while taking our other classes could actually learn on its own and accomplish such a difficult task, with minimal input from us. As a first project in machine learning this was a tough one to start with but looking back at it, the approach we took was in line with any other standard machine learning task.

If you’re still reading, hopefully you’ve learned something new and if not at least enjoyed our amateur struggles. Again, all the code is available here https://github.com/RoboticsCourse, please consider starring it and checking out the contributors.
