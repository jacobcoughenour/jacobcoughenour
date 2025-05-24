+++
title = 'The blog'
date = 2025-05-24T08:01:26-04:00
+++

Inspired by [passivestar](https://passivestar.xyz/posts/hugo/), I decided to throw together a blog over the long weekend.

![todo]()

I've been wanting to update my website for a while now. Up until now it just had my social links and a redirect to a published notion page with some projects I made in college because I was trying to get a job. Well I got the job and let the website rot until now. There were a couple times I attempted to update the site in the past with a new design but I never finished the project.

# Technical details

This site is generated using [Hugo](https://gohugo.io/). It's a static site generator that takes a directory of markdown files and turns it into a full site. I only chose Hugo because I saw passivestar use it and wanted to try it out. I would have ended up making some SvelteKit contraption otherwise. 

I'm using [Cloudflare Pages](https://pages.cloudflare.com/) to actually host the site and [Cloudflare R2](https://www.cloudflare.com/developer-platform/products/r2/) to host any small video files I embed in the posts.

I started with [this template](https://github.com/odhyp/hugo-tailwindcss-starter) that configures TailwindCSS v4 with Hugo for me. It also came with some neat little devtools that I'm guessing [odhy](https://github.com/odhyp) made like this one that shows you all the Hugo variables the page was generated with.

{{< figure src="variables.png" alt="variables devtool" >}}

I'm also using [7.css](https://github.com/khang-nd/7.css) which is a bunch of css files that make the UI of this site look like it's from Windows 7. It's based on [XP.css](https://github.com/botoxparty/XP.css) which is a fork of [98.css](https://github.com/jdan/98.css). This window is not an image. It's just inline html.

{{< htmlexample show_code >}}
<div class="window active" style="max-width: 300px">
	<div class="title-bar">
		<div class="title-bar-text">MainWindow</div>
		<div class="title-bar-controls">
			<button aria-label="Minimize"></button>
			<button aria-label="Maximize"></button>
			<button aria-label="Close"></button>
		</div>
	</div>
	<div class="window-body has-space">
		<p>Hello world!</p>
		<section class="field-row justify-end">
			<button class="default">OK</button>
			<button>Cancel</button>
		</section>
	</div>
</div>
{{< /htmlexample >}}

todo bsky comments


# What this blog is for

It's my blog so I can really make it about anything but for now I will probably focus on Godot. I've been using Godot for 5+ years now and have a bunch of little tricks and devlogs I'd like to share. I'm also a fulltime Desktop App and Web developer during the day so I could post about that.

I already have the first real post queued up. I will post a link to it on Bluesky so [follow me there](https://bsky.app/profile/jacobcoughenour.com).