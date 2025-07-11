+++
title = "I Recreated Apple's Liquid Glass in Godot"
date = 2025-07-01T23:16:00-04:00
draft = true
+++


> If you want to play with an in-browser demo [click here](https://nostabyte.itch.io/godot-liquid-glass-demo)

Back in June, Apple unveiled their [new UI design language](https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/) that includes a new material they call [Liquid Glass](https://developer.apple.com/documentation/technologyoverviews/liquid-glass). I downloaded the macOS Tahoe beta that includes this new redesign and, after playing with it for a bit, wanted to see if I could recreate in a Godot shader.

I mainly wanted to focus on the blur and refraction of the background through the edges of the shape. So after playing around with some of the windows in macOS, I'm going to break it down into 3 main parts I noticed:

Center
Edge
Rim

- make a visual

# The Blur

The center part seems to be a simple blur of the background. It should be easy to recreate so let's start there.

Godot has this really easy way of blurring the screen in a shader. It's basically built-in.

{{< code lang=glsl filename=liquidglass.gdshader id=step_1 >}}
shader_type canvas_item;

uniform sampler2D screen_texture : hint_screen_texture, repeat_disable, filter_linear_mipmap;
uniform float blur = 2.0;

void fragment() {
	COLOR = textureLod(SCREEN_TEXTURE, SCREEN_UV, blur);
}
{{< /code >}}

{{< code lang=glsl filename=liquidglass.gdshader diff=step_1 >}}
shader_type canvas_item;
uniform sampler2D screen_texture : hint_screen_texture, repeat_disable, filter_linear_mipmap;

void fragment() {
	COLOR = textureLod(SCREEN_TEXTURE, SCREEN_UV, blur);
	different line added here
}
{{< /code >}}

![alt text](blur0.png){width=33.3%}
![alt text](blur2.png)
![alt text](blur8.png)

The key here is `filter_linear_mipmap` and the third parameter of `textureLod()`. It is telling Godot to generate multiple smaller resolution versions of the screen texture so when you pass anything greater than 0.0 into `textureLod()` it will blend between those LOD levels when sampling the texture.

- show the screen at different lod levels

But now we have a problem. Our whole screen is blurred when we only want part of it to be blurred behind our liquid glass. To do this we are going to use Signed Distance Functions or SDFs for short. These functions will give us the basic shapes we need so we don't have to pass any geometry data to the shader in the form of a mesh. There's another big feature that I'll reveal later.

# Shaping The Blur

SDFs are pretty simple in concept. You give them a point in space (in our case, 2D space) and some parameters about the shape and it will return you the distance from the edge of that shape. If the value returned is negative, then the point is inside the shape, if the value is 0, you are on the edge of the shape, and positive is outside the shape. If you want to learn more about SDFs, I recommend [Inigo Quilez's site](https://iquilezles.org/articles/distfunctions2d/).

-- give code example of basic sdf cirle

-- show red circle

We can add some of the code Inigo Quilez likes to use to visualize the signed distance being returned by the function.
```glsl
vec3 col = (d>0.0) ? vec3(0.9,0.6,0.3) : vec3(0.65,0.85,1.0);
col *= 1.0 - exp(-6.0*abs(d));
col *= 0.8 + 0.2*cos(150.0*d);
col = mix( col, vec3(1.0), 1.0-smoothstep(0.0,0.01,abs(d)) );
```

Now just blur the parts inside the shape and don't blur the parts outside the shape

-- code

-- screenshot

# The Rim

Now it's hard to tell where the shape starts and ends. Let's add a highlight around the rim. We're going to do this by translating the screen color into the OKLab color space, increasing the luminance component, then translating it back to RGB. Also, we're going to blur the rim more than the rest of the shape so it collects more of the color surrounding it.

-- code

-- screenshot

# Refractions

The main characteristic of Liquid Glass is the way it bends the light around it in interesting ways. We are going to pretty much fake this effect with displacement. We just have to displace the UV coordinate that is sampling the screen texture along the edges but that is easier said than done. 

So we need no displacement in the center of the glass then we want to increase the displacement the closer we get to the edge. If only we knew how close we are to the edge...


With our SDF we know how much we want to displace the screen but we don't know the direction. It sounds like we need something like a normal or displacement map to tell us which direction and by how much to displace the screen UV.

> I actually struggled with this part in my first go. I tried reconstructing the normal by sampling the SDF multiple times around the current UV and using the difference

If you looked at the next article on Inigo's website you would already know where i'm going with this. There is a modified version of his SDFs we can use that will give us the signed distance and an x and y direction he calls the gradient.

https://iquilezles.org/articles/distgradfunctions2d/

After some modifications, We now have something resembling a normal map for our liquid glass.

-- screenshot of the normal map

--

Now we can use these normals for our displacement and now we have refraction!

-- screenshot


# Multiple shapes

Let's hard-code more than one shape and make them move around. 

-- write the code so it doesn't blend

We can actually blend between our SDF shapes to smooth out the intersections with some more code from Inigo

-- min func

Now we have completed the bloby fluid look we were going for.

# Draw the rest of the Owl

I'm not going to cover the rest of the implementation. That is for you to look at the source code and figure out for yourself but I'll give you a list of the features I added after this point to make the demo.

- Chromatic Aberration.

- A bunch of uniforms to customize it.

- A settings window for editing those uniforms.

- Multiple shapes at the same time passed through an array uniform.

- Linking the shapes to the bounds or visibility of an actual control.

- Noise

You can play with it now in your browser here






