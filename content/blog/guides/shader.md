---
title: Shaders in GLSL Canvas
date: 2025-06-01
categories:
    - graphics
tags:
draft: false
image: /img/banner/simple_shader.png
layout: blog-post
toc: true
---

{{< shader_library >}}

### GLSL Library

GLSL Canvas is a library that allows you to run GLSL shaders in a web environment. It makes it easy to create interactive graphics and visualizations using shader language inside a canvas element with WebGL.

https://github.com/patriciogonzalezvivo/glslCanvas

```javascript
<script type="text/javascript" src="https://rawgit.com/patriciogonzalezvivo/glslCanvas/master/dist/GlslCanvas.js"></script>
```


### ShaderToy -> GLSL Canvas
The original shader we'll be using was written for ShaderToy, which uses a specific set of uniforms and functions. In GLSL Canvas, we need to adapt the code to use the `u_time` and `u_resolution` uniforms provided by the library. The main function will also be adjusted to fit the GLSL Canvas structure.

```glsl
#define iTime u_time
#define iResolution vec3(u_resolution, 1.0)
uniform float u_time;
uniform vec2 u_resolution;

//Shadertoy fragment shader main function
void mainImage( out vec4 fragColor, in vec2 fragCoord );

//GLSL Canvas main function
void main() {
    vec4 color = vec4(0.0);
    mainImage(color, gl_FragCoord.xy);
    gl_FragColor = color;
}
```

### HTML Setup
To use GLSL Canvas, you need to include the library in your HTML file and create a canvas element where the shader will be rendered. Here's a simple setup:

```html
<script type="text/javascript" src="https://rawgit.com/patriciogonzalezvivo/glslCanvas/master/dist/GlslCanvas.js"></script>

<textarea id="shaderEditor">
    {{ GLSL shader code here }}
</textarea>

<canvas id="shaderCanvas" style="display:block; width:100%; height:500px;"></canvas>

<script>
const canvas = document.getElementById("shaderCanvas");
const sandbox = new GlslCanvas(canvas);
const editor = document.getElementById("shaderEditor");

function resizeCanvasToCSSSize() {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    // Only update if size changed
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }
  }

// Resize initially and on window resize
resizeCanvasToCSSSize();
sandbox.load(editor.value);
editor.addEventListener("input", () => {
    sandbox.load(editor.value);
});
</script>
```

### Shader: Spiral
You can edit the values in the textarea below to see how they affect the shader in real-time. The shader creates a colorful spiral effect that changes over time.

I recomend focusing on the `width`, `dis`, `blur`, `rep`, `mul`, and `ex` variables to see how they affect the spiral's appearance.

The `points` variable controls the number of points in the spiral.

{{< canvas >}}
#ifdef GL_ES
precision mediump float;
#endif

#define iTime u_time
#define iResolution vec3(u_resolution, 1.0)
#define pallet(d) mix(vec3(0.2,0.7,0.9),vec3(1.,0.,1.),d)

uniform float u_time;
uniform vec2 u_resolution;

float width = 0.1;
float dis = 0.5;
float blur = 0.7;
float rep = 1.0;
float mul = 0.15;
float ex = 1.0;
float points = 5.0;

#define PI 3.14159
#define e  2.71828

// Radial UV from https://www.shadertoy.com/view/XdXXzf
vec2 radialUV(in vec2 uv)
{
    vec2 rUV = vec2(0.0);
    rUV.x = atan(uv.x, uv.y) * 0.159 + 0.5;
    rUV.y = length(uv) * 0.6;
    
    return rUV * 2.0;
}

vec2 rotUV(in vec2 uv, in float angle) {
    float ru = uv.x*cos(angle) - uv.y*sin(angle);
    float rv = uv.x*sin(angle) + uv.y*cos(angle);
    return vec2(ru, rv);
}

float timeCycle(float a, float m) {
    return sin((iTime + a)*m);
}

float timeCycle01(float a, float m, float s) {
    return max((sin((iTime + a)*m) + 1.0)*0.5, s);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv  = (fragCoord-0.5*iResolution.xy)/iResolution.y;
    uv = rotUV(uv, -0.5*iTime);
    vec2 ruv = radialUV(uv);
    
    mul += timeCycle(0.0, 0.5) * 0.1;
    rep += timeCycle(1.5, 0.3) * 0.03;
    ex += timeCycle(0.3, 0.2) * 0.4; 
    width -= timeCycle01(0.5, 0.33, 0.0) * 0.05;

    float l = length(uv);
    float distIncrease = pow(distance(ruv.y, 0.0), ex) * mul;
    l += sin(ruv.x*(PI+0.003)*points) * distIncrease;
   
    
    // Spiral based on https://www.shadertoy.com/view/WtjSWt
    float angle = atan(uv.y, uv.x);
    float offset = (log(l) / log(e*PI*rep) + (angle / (2.0*PI)) * dis);
    float spiral = mod(offset - 0.5*iTime, dis);
    
    width *= pow(1.33-distance(ruv.y, 0.0), 4.0);
    float spiralR = smoothstep(spiral - blur*0.3, spiral, width) + 
                    smoothstep(1.0-spiral - blur, 1.0-spiral, width);
             
    float spiralG = smoothstep(spiral - blur*timeCycle01(0.0, 0.33, 0.5), spiral, width) + 
                    smoothstep(1.0-spiral - blur*timeCycle01(PI, 0.2, 0.5), 1.0-spiral, width);
             
    float spiralB = smoothstep(spiral - blur, spiral, width) + 
                    smoothstep(1.0-spiral - blur*0.3, 1.0-spiral, width);
    
    vec3 col = vec3(spiralR, spiralG, spiralB);
    fragColor = vec4(col, 1.0);
}

void main() {
    vec4 color = vec4(0.0);
    mainImage(color, gl_FragCoord.xy);
    gl_FragColor = color;
}
{{< /canvas>}}


### Original Shader
https://www.shadertoy.com/view/Wct3zX