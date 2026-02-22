---
title: The Fastest Way to Board an Airplane
slug: airlines-hate-this-trick
date: 2026-02-21T10:29:50+05:30
draft: false
toc:
  show: false
ShowRelatedContent: false
description: An interactive exploration to find the mathematically perfect way to board an airplane.
summary: Exploring different airplane boarding strategies with interactive animations and mathematics. Airlines hate this trick.
tags:
  - interactive
  - mathematics
  - visual
categories:
  - Mathematics
series: []
aliases: []
cover:
  image: /images/the-fastest-way-to-board-an-airplane/airplane-banner.jpg
  alt: People boarding an airplane.
  caption: Airlines hate this trick.
  relative: false
fmContentType: Post (default)
---

_There must be a better way to do this, surely._

I'm hardly the first person to think this while stuck behind a seemingly endless line of people waiting to board an airplane. If this question hasn't crossed your mind yet, wait till the next time you are cut off from the world as you enter the narrow metal tube between the boarding gate and the airplane—unless yours has glass windows, in which case, _enjoy the view!_

When you finally board the plane, you and seven others ahead of you in the aisle remain stuck waiting for the guy in 16A—who took “you can bring personal items” too liberally—to finish stowing his luggage. i.e., one person blocks the _entire_ aisle, inside _and_ outside the plane.

There _surely_ must be a better way. After all, throwing the gates open and making it a free-for-all wouldn't work (?), and the _back-to-front_ boarding-group strategy airlines use doesn't seem much better either.

{{< rawhtml >}}
<style>
.boarding-sketch-container {
  width: 100%;
  margin: 0 auto 20px auto;
  padding: 14px;
  border: 1px solid var(--border);
  background-color: var(--hljs-bg);
  display: flex;
  justify-content: center;
  align-items: center;
}

.bsim-button-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.bsim-stats {
  font-size: 13px;
  color: var(--secondary);
  margin-left: auto;
  font-variant-numeric: tabular-nums;
  line-height: 24px;
}

.bsim-stats strong {
  color: var(--primary);
  display: inline-block;
  min-width: 3ch;
  text-align: right;
}

.boarding-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: var(--radius);
  background: var(--code-bg);
  border: 1px solid var(--border);
  padding: 6px 12px;
  color: var(--secondary);
  font-size: 12px;
  cursor: pointer;
}

.boarding-btn svg {
  width: 10px;
  height: 10px;
  fill: currentColor;
}

.boarding-btn:hover {
  background: var(--border);
}

.boarding-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.boarding-btn.primary {
  background: var(--primary);
  color: var(--code-bg);
}

.boarding-btn.primary:hover {
  background: var(--secondary);
}

.bsim-wrapper {
  width: 100%;
  margin: 20px auto;
}

.bsim-controls {
  width: 100%;
  margin: 0 auto 20px auto;
  padding: 14px;
  border: 1px solid var(--border);
  background-color: var(--hljs-bg);
}

.bsim-slider-container {
  margin-bottom: 15px;
}

.bsim-slider-container label {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--secondary);
  justify-content: space-between;
}

.bsim-slider-row input[type="range"] {
  width: 100%;
  -webkit-appearance: none;
  height: 8px;
  background: var(--code-bg);
  border-radius: 0;
  border: none;
}

.bsim-slider-row input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--secondary);
  cursor: pointer;
}

.bsim-slider-row input[type="range"]::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--secondary);
  cursor: pointer;
  border: none;
}

.bsim-slider-row input[type="range"]:focus {
  outline: none;
}

.bsim-slider-value {
  min-width: 80px;
  text-align: right;
  font-size: 14px;
}

.legend-circle {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  margin-right: 5px;
  display: inline-block;
}

.blue-circle {
  background-color: rgb(65, 105, 225);
}

.yellow-circle {
  background-color: rgb(255, 193, 7);
}

.green-circle {
  background-color: rgb(75, 192, 112);
}

.chart-container {
  width: 100%;
  margin: 0 auto 20px auto;
  padding: 14px;
  border: 1px solid var(--border);
  background-color: var(--hljs-bg);
}

.bar-row {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  font-size: 14px;
}

.bar-label {
  width: 130px;
  text-align: right;
  margin-right: 10px;
  color: var(--secondary);
  line-height: 20px;
  white-space: nowrap;
}

.bar-track {
  flex: 1;
  height: 20px;
  background: var(--code-bg);
  border-radius: var(--radius);
  overflow: hidden;
}

.bar-fill {
  height: 100%;
}

.bar-value {
  width: 35px;
  text-align: right;
  margin-left: 10px;
  color: var(--secondary);
  font-size: 14px;
  line-height: 20px;
  white-space: nowrap;
}

@media (max-width: 600px) {
  .bar-label {
    width: 100px;
    font-size: 13px;
    margin-right: 8px;
  }
  .bar-value {
    width: 30px;
    font-size: 13px;
    margin-left: 8px;
  }
}
</style>

<script src="https://cdn.jsdelivr.net/npm/p5@1.11.3/lib/p5.min.js"></script>
<script src="./boarding-sim.js"></script>
{{< /rawhtml >}}

> [!NOTE]
> In each of the simulations below, passengers {{< rawhtml >}}<span class="legend-circle blue-circle"></span><strong style="color: rgb(65, 105, 225);">walk</strong>{{< /rawhtml >}} down the aisle to their row, {{< rawhtml >}}<span class="legend-circle yellow-circle"></span><strong style="color: rgb(255, 193, 7);">stow</strong>{{< /rawhtml >}} their bag in the overhead bin, and take their {{< rawhtml >}}<span class="legend-circle green-circle"></span><strong style="color: rgb(75, 192, 112);">seat</strong>{{< /rawhtml >}}.
>
> This _imaginary_ airplane has 20 rows of 6 seats; 3-3 configuration, single aisle.
>
> Hit {{< rawhtml >}}<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style="width: 0.6em; height: 0.6em; fill: currentColor; vertical-align: baseline;"><path d="M91.2 36.9c-12.4-6.8-27.4-6.5-39.6 .7S32 57.9 32 72l0 368c0 14.1 7.5 27.2 19.6 34.4s27.2 7.5 39.6 .7l336-184c12.8-7 20.8-20.5 20.8-35.1s-8-28.1-20.8-35.1l-336-184z"/></svg>{{< /rawhtml >}}&nbsp;**Play** and watch.

Airlines typically group rows into _zones_. Boarding the zones _**back-to-front**_ seems like a perfectly sensible and intuitive way to prevent people from blocking anyone behind them. _Doesn't it?_

Let's see this in action. _Watch the aisle_.

{{< rawhtml >}}
<div id="sim-btf" class="bsim-wrapper">
  <div class="bsim-canvas boarding-sketch-container"></div>
  <div class="bsim-controls">
    <div class="bsim-slider-container">
      <label>Simulation Speed <span class="bsim-slider-value bsim-speed-value">15 steps/sec</span></label>
      <div class="bsim-slider-row"><input type="range" class="bsim-speed-slider" min="1" max="30" value="15" step="1"></div>
    </div>
    <div class="bsim-button-row">
      <button class="boarding-btn primary bsim-play"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M91.2 36.9c-12.4-6.8-27.4-6.5-39.6 .7S32 57.9 32 72l0 368c0 14.1 7.5 27.2 19.6 34.4s27.2 7.5 39.6 .7l336-184c12.8-7 20.8-20.5 20.8-35.1s-8-28.1-20.8-35.1l-336-184z"/></svg>Play</button>
      <button class="boarding-btn bsim-reset"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M65.9 228.5c13.3-93 93.4-164.5 190.1-164.5 53 0 101 21.5 135.8 56.2 .2 .2 .4 .4 .6 .6l7.6 7.2-47.9 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l128 0c17.7 0 32-14.3 32-32l0-128c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 53.4-11.3-10.7C390.5 28.6 326.5 0 256 0 127 0 20.3 95.4 2.6 219.5 .1 237 12.2 253.2 29.7 255.7s33.7-9.7 36.2-27.1zm443.5 64c2.5-17.5-9.7-33.7-27.1-36.2s-33.7 9.7-36.2 27.1c-13.3 93-93.4 164.5-190.1 164.5-53 0-101-21.5-135.8-56.2-.2-.2-.4-.4-.6-.6l-7.6-7.2 47.9 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 320c-8.5 0-16.7 3.4-22.7 9.5S-.1 343.7 0 352.3l1 127c.1 17.7 14.6 31.9 32.3 31.7S65.2 496.4 65 478.7l-.4-51.5 10.7 10.1c46.3 46.1 110.2 74.7 180.7 74.7 129 0 235.7-95.4 253.4-219.5z"/></svg>Reset</button>
      <button class="boarding-btn bsim-skip"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M19.8 477.6c12 5 25.7 2.2 34.9-6.9L224 301.3 224 448c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9L448 301.3 448 448c0 17.7 14.3 32 32 32s32-14.3 32-32l0-384c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 146.7-169.4-169.4c-9.2-9.2-22.9-11.9-34.9-6.9S224 51.1 224 64L224 210.7 54.6 41.4c-9.2-9.2-22.9-11.9-34.9-6.9S0 51.1 0 64L0 448c0 12.9 7.8 24.6 19.8 29.6z"/></svg>Skip</button>
      <span class="bsim-stats"><strong class="bsim-seated">0</strong>/120 seated &nbsp;&nbsp; <strong class="bsim-steps">0</strong> steps</span>
    </div>
  </div>
</div>
{{< /rawhtml >}}

Boarding is slow when queues form behind a single person. When the first (out of four) zone boards, **everyone clusters in the same few rows and blocks the same section of the aisle**. The back of the plane becomes crowded while the front remains empty.

This feels inevitable. If you group people by adjacent rows, you _guarantee_ congestion. Everyone needs to stow their bags and sit roughly in the same rows. When they cannot pass each other or stow in parallel, they just wait.

Boarding back-to-front is so inefficient that having people board at **_random_** whenever they arrive at the gate is faster.

{{< rawhtml >}}
<div id="sim-random" class="bsim-wrapper">
  <div class="bsim-canvas boarding-sketch-container"></div>
  <div class="bsim-controls">
    <div class="bsim-slider-container">
      <label>Simulation Speed <span class="bsim-slider-value bsim-speed-value">15 steps/sec</span></label>
      <div class="bsim-slider-row"><input type="range" class="bsim-speed-slider" min="1" max="30" value="15" step="1"></div>
    </div>
    <div class="bsim-button-row">
      <button class="boarding-btn primary bsim-play"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M91.2 36.9c-12.4-6.8-27.4-6.5-39.6 .7S32 57.9 32 72l0 368c0 14.1 7.5 27.2 19.6 34.4s27.2 7.5 39.6 .7l336-184c12.8-7 20.8-20.5 20.8-35.1s-8-28.1-20.8-35.1l-336-184z"/></svg>Play</button>
      <button class="boarding-btn bsim-reset"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M65.9 228.5c13.3-93 93.4-164.5 190.1-164.5 53 0 101 21.5 135.8 56.2 .2 .2 .4 .4 .6 .6l7.6 7.2-47.9 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l128 0c17.7 0 32-14.3 32-32l0-128c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 53.4-11.3-10.7C390.5 28.6 326.5 0 256 0 127 0 20.3 95.4 2.6 219.5 .1 237 12.2 253.2 29.7 255.7s33.7-9.7 36.2-27.1zm443.5 64c2.5-17.5-9.7-33.7-27.1-36.2s-33.7 9.7-36.2 27.1c-13.3 93-93.4 164.5-190.1 164.5-53 0-101-21.5-135.8-56.2-.2-.2-.4-.4-.6-.6l-7.6-7.2 47.9 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 320c-8.5 0-16.7 3.4-22.7 9.5S-.1 343.7 0 352.3l1 127c.1 17.7 14.6 31.9 32.3 31.7S65.2 496.4 65 478.7l-.4-51.5 10.7 10.1c46.3 46.1 110.2 74.7 180.7 74.7 129 0 235.7-95.4 253.4-219.5z"/></svg>Reset</button>
      <button class="boarding-btn bsim-skip"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M19.8 477.6c12 5 25.7 2.2 34.9-6.9L224 301.3 224 448c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9L448 301.3 448 448c0 17.7 14.3 32 32 32s32-14.3 32-32l0-384c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 146.7-169.4-169.4c-9.2-9.2-22.9-11.9-34.9-6.9S224 51.1 224 64L224 210.7 54.6 41.4c-9.2-9.2-22.9-11.9-34.9-6.9S0 51.1 0 64L0 448c0 12.9 7.8 24.6 19.8 29.6z"/></svg>Skip</button>
      <span class="bsim-stats"><strong class="bsim-seated">0</strong>/120 seated &nbsp;&nbsp; <strong class="bsim-steps">0</strong> steps</span>
    </div>
  </div>
</div>
{{< /rawhtml >}}

Try running both simulations a few times and compare the step counts. Boarding at random is unintuitively but _consistently_ faster than back-to-front.

_Why?_

When passengers are scattered across the plane, multiple people can stow bags at the same time because they are naturally spaced apart. One person stowing in row 3 while another stows in row 17 is much faster than five people queueing behind one person in row 18.

_But we can do better._

Three groups: window, middle, aisle. In that order. The **_window-middle-aisle (WilMA)_** method is essentially the same idea as random, but applied three times, once for each column of seats.

{{< rawhtml >}}
<div id="sim-wilma" class="bsim-wrapper">
  <div class="bsim-canvas boarding-sketch-container"></div>
  <div class="bsim-controls">
    <div class="bsim-slider-container">
      <label>Simulation Speed <span class="bsim-slider-value bsim-speed-value">15 steps/sec</span></label>
      <div class="bsim-slider-row"><input type="range" class="bsim-speed-slider" min="1" max="30" value="15" step="1"></div>
    </div>
    <div class="bsim-button-row">
      <button class="boarding-btn primary bsim-play"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M91.2 36.9c-12.4-6.8-27.4-6.5-39.6 .7S32 57.9 32 72l0 368c0 14.1 7.5 27.2 19.6 34.4s27.2 7.5 39.6 .7l336-184c12.8-7 20.8-20.5 20.8-35.1s-8-28.1-20.8-35.1l-336-184z"/></svg>Play</button>
      <button class="boarding-btn bsim-reset"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M65.9 228.5c13.3-93 93.4-164.5 190.1-164.5 53 0 101 21.5 135.8 56.2 .2 .2 .4 .4 .6 .6l7.6 7.2-47.9 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l128 0c17.7 0 32-14.3 32-32l0-128c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 53.4-11.3-10.7C390.5 28.6 326.5 0 256 0 127 0 20.3 95.4 2.6 219.5 .1 237 12.2 253.2 29.7 255.7s33.7-9.7 36.2-27.1zm443.5 64c2.5-17.5-9.7-33.7-27.1-36.2s-33.7 9.7-36.2 27.1c-13.3 93-93.4 164.5-190.1 164.5-53 0-101-21.5-135.8-56.2-.2-.2-.4-.4-.6-.6l-7.6-7.2 47.9 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 320c-8.5 0-16.7 3.4-22.7 9.5S-.1 343.7 0 352.3l1 127c.1 17.7 14.6 31.9 32.3 31.7S65.2 496.4 65 478.7l-.4-51.5 10.7 10.1c46.3 46.1 110.2 74.7 180.7 74.7 129 0 235.7-95.4 253.4-219.5z"/></svg>Reset</button>
      <button class="boarding-btn bsim-skip"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M19.8 477.6c12 5 25.7 2.2 34.9-6.9L224 301.3 224 448c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9L448 301.3 448 448c0 17.7 14.3 32 32 32s32-14.3 32-32l0-384c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 146.7-169.4-169.4c-9.2-9.2-22.9-11.9-34.9-6.9S224 51.1 224 64L224 210.7 54.6 41.4c-9.2-9.2-22.9-11.9-34.9-6.9S0 51.1 0 64L0 448c0 12.9 7.8 24.6 19.8 29.6z"/></svg>Skip</button>
      <span class="bsim-stats"><strong class="bsim-seated">0</strong>/120 seated &nbsp;&nbsp; <strong class="bsim-steps">0</strong> steps</span>
    </div>
  </div>
</div>
{{< /rawhtml >}}

In reality, this is _slightly_ faster than random, as it eliminates seat shuffles (you know, the awkward choreography where a seated passenger has to stand up and squeeze into the crowded aisle so you can reach your window seat). This isn't modeled in the simulation, but it contributes less to boarding frustrations than bag stowage anyway.

I was surprised to learn that some airlines use this over back-to-front boarding, although I've never witnessed it in the wild. _I will believe it when I see it._

Now, _ladies and gentlemen_, if you could leave your mortal souls for a moment and ascend to the realm of theory, where passengers are perfectly obedient biological automata, executing instructions without hesitation or complaint.

In Jason **_Steffen's_** method, there are no boarding groups. Every passenger stands in an exact order: back-to-front, alternating rows, alternating sides, windows first.

When two consecutive passengers enter the aisle, they are going to rows that are at least two apart. They will _never_ block each other. They stow bags at the exact same time. The entire aisle becomes a neat, parallel-processing pipeline.

{{< rawhtml >}}
<div id="sim-steffen" class="bsim-wrapper">
  <div class="bsim-canvas boarding-sketch-container"></div>
  <div class="bsim-controls">
    <div class="bsim-slider-container">
      <label>Simulation Speed <span class="bsim-slider-value bsim-speed-value">15 steps/sec</span></label>
      <div class="bsim-slider-row"><input type="range" class="bsim-speed-slider" min="1" max="30" value="15" step="1"></div>
    </div>
    <div class="bsim-button-row">
      <button class="boarding-btn primary bsim-play"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M91.2 36.9c-12.4-6.8-27.4-6.5-39.6 .7S32 57.9 32 72l0 368c0 14.1 7.5 27.2 19.6 34.4s27.2 7.5 39.6 .7l336-184c12.8-7 20.8-20.5 20.8-35.1s-8-28.1-20.8-35.1l-336-184z"/></svg>Play</button>
      <button class="boarding-btn bsim-reset"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M65.9 228.5c13.3-93 93.4-164.5 190.1-164.5 53 0 101 21.5 135.8 56.2 .2 .2 .4 .4 .6 .6l7.6 7.2-47.9 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l128 0c17.7 0 32-14.3 32-32l0-128c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 53.4-11.3-10.7C390.5 28.6 326.5 0 256 0 127 0 20.3 95.4 2.6 219.5 .1 237 12.2 253.2 29.7 255.7s33.7-9.7 36.2-27.1zm443.5 64c2.5-17.5-9.7-33.7-27.1-36.2s-33.7 9.7-36.2 27.1c-13.3 93-93.4 164.5-190.1 164.5-53 0-101-21.5-135.8-56.2-.2-.2-.4-.4-.6-.6l-7.6-7.2 47.9 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 320c-8.5 0-16.7 3.4-22.7 9.5S-.1 343.7 0 352.3l1 127c.1 17.7 14.6 31.9 32.3 31.7S65.2 496.4 65 478.7l-.4-51.5 10.7 10.1c46.3 46.1 110.2 74.7 180.7 74.7 129 0 235.7-95.4 253.4-219.5z"/></svg>Reset</button>
      <button class="boarding-btn bsim-skip"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M19.8 477.6c12 5 25.7 2.2 34.9-6.9L224 301.3 224 448c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9L448 301.3 448 448c0 17.7 14.3 32 32 32s32-14.3 32-32l0-384c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 146.7-169.4-169.4c-9.2-9.2-22.9-11.9-34.9-6.9S224 51.1 224 64L224 210.7 54.6 41.4c-9.2-9.2-22.9-11.9-34.9-6.9S0 51.1 0 64L0 448c0 12.9 7.8 24.6 19.8 29.6z"/></svg>Skip</button>
      <span class="bsim-stats"><strong class="bsim-seated">0</strong>/120 seated &nbsp;&nbsp; <strong class="bsim-steps">0</strong> steps</span>
    </div>
  </div>
</div>
{{< /rawhtml >}}

Look at all those simultaneous yellow dots. _Beautiful._

Of course, this version exists only in theory. Any time saved in the aisle would inevitably be lost trying to herd people into that exact order at the gate.

So let's descend back to Earth. _Fasten your seatbelts._

A practical variant uses four boarding groups instead of individual seat numbers: one side of the plane in every other row, then the other side, then back again. Within each group, the windows board first, then middle, then aisle. This isn't the logically perfect version, but at least parents can board with their kids now.

I ran each simulation 200 times and averaged the results.

{{< rawhtml >}}
<div class="chart-container">
  <div id="comparison-bars"></div>
</div>
{{< /rawhtml >}}

Clearly, there are faster ways to board an airplane.

But if you did make it this far, you probably already knew that efficiency isn't the only variable in the real world. Boarding groups aren't designed purely for throughput. There are ticket classes and loyalty programmes, infants and senior citizens, and a myriad of other _human_ factors that dictate priority.

_We aren't neat little yellow dots._

{{< hr-icon plane >}}

If you'd like to explore this further, I highly recommend the original works that inspired this article:

1. CGP Grey's video - [The Airplane Boarding Method That's Too Perfect To Use](https://www.youtube.com/watch?v=oAHbLRjF0vo) (This article borrows heavily from CGP Grey’s excellent explanation—sometimes paraphrased, occasionally quoted—because it’s that good)
2. Jason Steffen's original paper - [Optimal boarding method for airline passengers](https://arxiv.org/abs/0802.0733)
3. His follow up study - [Experimental test of airplane boarding methods](https://arxiv.org/abs/1108.5211)

See discussions on [{{< icon reddit >}} Reddit](https://www.reddit.com/r/webdev/comments/1raq9iv/the_fastest_way_to_board_an_airplane_interactive/) and [{{< icon lobsters >}} Lobsters](https://lobste.rs/s/l0gv3h/fastest_way_board_airplane).

{{< rawhtml >}}
<script>
const BOARDING_COLORS = {
  walking: [65, 105, 225],
  stowing: [255, 193, 7],
  seated: [75, 192, 112],
};

const bsimPlayIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M91.2 36.9c-12.4-6.8-27.4-6.5-39.6 .7S32 57.9 32 72l0 368c0 14.1 7.5 27.2 19.6 34.4s27.2 7.5 39.6 .7l336-184c12.8-7 20.8-20.5 20.8-35.1s-8-28.1-20.8-35.1l-336-184z"/></svg>';
const bsimPauseIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M48 64C21.5 64 0 85.5 0 112L0 400c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48L48 64zm192 0c-26.5 0-48 21.5-48 48l0 288c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48l-32 0z"/></svg>';

function boardingSketchFactory(state) {
  return (p) => {
    let canvasW, canvasH;
    let cellW, cellH, seatW, seatH, aisleH;
    let gridStartX, gridStartY;
    let secondaryColor;
    let seatBackCol, seatCushionCol, fuselageStrokeCol, aisleFloorCol;

    const updateTheme = () => {
      const root = getComputedStyle(document.documentElement);
      secondaryColor = root.getPropertyValue('--secondary').trim();
      seatBackCol = p.color(secondaryColor); seatBackCol.setAlpha(55);
      seatCushionCol = p.color(secondaryColor); seatCushionCol.setAlpha(25);
      fuselageStrokeCol = p.color(secondaryColor); fuselageStrokeCol.setAlpha(110);
      aisleFloorCol = p.color(secondaryColor); aisleFloorCol.setAlpha(12);
    };

    const calculateLayout = () => {
      canvasW = state.container.offsetWidth - 28;
      const marginX = 14;
      const usableW = canvasW - 2 * marginX;
      const rowGap = usableW * 0.012;
      const seatGap = usableW * 0.004;
      seatW = (usableW - (ROWS - 1) * rowGap) / ROWS;
      seatH = seatW;
      cellW = seatW + rowGap;
      cellH = seatH + seatGap;
      aisleH = seatH * 0.85;
      gridStartX = marginX;
      const cabinH = 3 * cellH + aisleH + 3 * cellH;
      const wingExtend = cabinH * 0.32;
      gridStartY = 8 + wingExtend;
      canvasH = gridStartY + cabinH + 8 + wingExtend;
    };

    const getRowX = (row) => gridStartX + row * cellW;
    const getSeatY = (col) => col < 3 ? gridStartY + col * cellH : gridStartY + 3 * cellH + aisleH + (col - 3) * cellH;
    const getAisleY = () => gridStartY + 3 * cellH + aisleH / 2;

    const drawFuselage = () => {
      const cabinH = 3 * cellH + aisleH + 3 * cellH;
      const topEdge = gridStartY - 6;
      const bottomEdge = gridStartY + cabinH + 6;
      const wingExtend = cabinH * 0.38;
      const wingCol = p.color(secondaryColor); wingCol.setAlpha(18);
      p.fill(wingCol); p.noStroke();
      // Swept-back wing: leading edge sweeps back, trailing edge stays roughly straight
      const rootLeadX = getRowX(4), rootTrailX = getRowX(14) + seatW;
      const tipLeadX = getRowX(9), tipTrailX = getRowX(14) + seatW;
      // Top wing
      p.beginShape();
      p.vertex(rootLeadX, topEdge); p.vertex(rootTrailX, topEdge);
      p.vertex(tipTrailX, topEdge - wingExtend); p.vertex(tipLeadX, topEdge - wingExtend);
      p.endShape(p.CLOSE);
      // Bottom wing
      p.beginShape();
      p.vertex(rootLeadX, bottomEdge); p.vertex(rootTrailX, bottomEdge);
      p.vertex(tipTrailX, bottomEdge + wingExtend); p.vertex(tipLeadX, bottomEdge + wingExtend);
      p.endShape(p.CLOSE);
      p.stroke(fuselageStrokeCol); p.strokeWeight(1);
      p.line(gridStartX, topEdge, gridStartX + ROWS * cellW, topEdge);
      p.line(gridStartX, bottomEdge, gridStartX + ROWS * cellW, bottomEdge);
      p.noStroke();
    };

    const drawSeat = (x, y, w, h) => {
      const pad = Math.max(1, w * 0.04);
      const backW = Math.max(3, w * 0.20);
      const sw = w - 2 * pad, sh = h - 2 * pad;
      p.noStroke();
      p.fill(seatBackCol); p.rect(x + pad, y + pad, sw, sh, 3);
      p.fill(seatCushionCol); p.rect(x + pad, y + pad, sw - backW, sh, 3, 0, 0, 3);
    };

    p.setup = function () {
      calculateLayout(); updateTheme();
      p.createCanvas(canvasW, canvasH); p.noLoop();
      const observer = new MutationObserver(() => { updateTheme(); p.redraw(); });
      observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    };

    p.draw = function () {
      p.clear();
      const sim = state.sim;
      if (!sim) return;
      drawFuselage();
      p.fill(aisleFloorCol); p.noStroke();
      p.rect(gridStartX, gridStartY + 3 * cellH, ROWS * cellW, aisleH);
      // Entry arrow in aisle (shaft + arrowhead), left of seat grid
      const arrowY = getAisleY();
      const arrowH = aisleH * 0.25;
      const headLen = arrowH * 1.2;
      const shaftLen = headLen * 1.0;
      const totalLen = headLen + shaftLen;
      const arrowTip = gridStartX - 2;
      const shaftStart = arrowTip - totalLen;
      const shaftThick = arrowH * 0.45;
      const arrowCol = p.color(p.red(seatCushionCol), p.green(seatCushionCol), p.blue(seatCushionCol));
      p.fill(arrowCol); p.noStroke();
      const jx = arrowTip - headLen;
      p.beginShape();
      p.vertex(shaftStart, arrowY - shaftThick / 2);
      p.vertex(jx, arrowY - shaftThick / 2);
      p.vertex(jx, arrowY - arrowH);
      p.vertex(arrowTip, arrowY);
      p.vertex(jx, arrowY + arrowH);
      p.vertex(jx, arrowY + shaftThick / 2);
      p.vertex(shaftStart, arrowY + shaftThick / 2);
      p.endShape(p.CLOSE);
      p.textAlign(p.RIGHT, p.CENTER); p.textSize(10); p.textFont('Georgia');
      p.fill(secondaryColor); p.noStroke();
      const labels = ['A','B','C','D','E','F'];
      for (let c = 0; c < 6; c++) p.text(labels[c], gridStartX - 5, getSeatY(c) + seatH / 2);
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) drawSeat(getRowX(r), getSeatY(c), seatW, seatH);
      const dotD = seatH * 0.54;
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        if (!sim.seats[r][c]) continue;
        p.fill(BOARDING_COLORS.seated[0], BOARDING_COLORS.seated[1], BOARDING_COLORS.seated[2]);
        p.noStroke(); p.ellipse(getRowX(r) + seatW / 2, getSeatY(c) + seatH / 2, dotD, dotD);
      }
      const aisleY = getAisleY();
      const aisleDotD = Math.min(seatW, aisleH) * 0.58;
      for (let pos = 0; pos < ROWS; pos++) {
        const pax = sim.aisleOccupant[pos];
        if (!pax) continue;
        const px = getRowX(pos) + seatW / 2;
        if (pax.state === STATE.STOWING) p.fill(BOARDING_COLORS.stowing[0], BOARDING_COLORS.stowing[1], BOARDING_COLORS.stowing[2]);
        else p.fill(BOARDING_COLORS.walking[0], BOARDING_COLORS.walking[1], BOARDING_COLORS.walking[2]);
        p.noStroke(); p.ellipse(px, aisleY, aisleDotD, aisleDotD);
      }
    };

    p.windowResized = function () { calculateLayout(); p.resizeCanvas(canvasW, canvasH); p.redraw(); };
  };
}

function createBoardingViz(containerId, method) {
  const wrapper = document.getElementById(containerId);
  const canvasDiv = wrapper.querySelector('.bsim-canvas');
  const playBtn = wrapper.querySelector('.bsim-play');
  const resetBtn = wrapper.querySelector('.bsim-reset');
  const skipBtn = wrapper.querySelector('.bsim-skip');
  const seatedEl = wrapper.querySelector('.bsim-seated');
  const stepsEl = wrapper.querySelector('.bsim-steps');
  const speedSlider = wrapper.querySelector('.bsim-speed-slider');
  const speedValue = wrapper.querySelector('.bsim-speed-value');

  const state = {
    sim: new BoardingSimulation(),
    container: canvasDiv,
    running: false,
    speed: 15,
    animId: null,
    lastStepTime: 0,
    p5: null,
  };
  state.sim.init(method);

  state.p5 = new p5(boardingSketchFactory(state), canvasDiv);

  function updateStats() {
    seatedEl.textContent = state.sim.seatedCount;
    stepsEl.textContent = state.sim.ticks;
  }

  function animLoop(timestamp) {
    if (!state.running) return;
    const interval = 1000 / state.speed;
    if (timestamp - state.lastStepTime >= interval) {
      state.lastStepTime = timestamp;
      const stillRunning = state.sim.tick();
      updateStats();
      if (state.p5) state.p5.redraw();
      if (!stillRunning) {
        state.running = false;
        playBtn.innerHTML = bsimPlayIcon + 'Play';
        return;
      }
    }
    state.animId = requestAnimationFrame(animLoop);
  }

  function reset() {
    state.running = false;
    if (state.animId) { cancelAnimationFrame(state.animId); state.animId = null; }
    state.sim = new BoardingSimulation();
    state.sim.init(method);
    updateStats();
    if (state.p5) state.p5.redraw();
    playBtn.innerHTML = bsimPlayIcon + 'Play';
  }

  playBtn.addEventListener('click', () => {
    if (state.sim.done) reset();
    state.running = !state.running;
    playBtn.innerHTML = state.running ? bsimPauseIcon + 'Pause' : bsimPlayIcon + 'Play';
    if (state.running) {
      state.lastStepTime = performance.now();
      state.animId = requestAnimationFrame(animLoop);
    } else {
      if (state.animId) { cancelAnimationFrame(state.animId); state.animId = null; }
    }
  });

  resetBtn.addEventListener('click', reset);

  skipBtn.addEventListener('click', () => {
    state.running = false;
    if (state.animId) { cancelAnimationFrame(state.animId); state.animId = null; }
    if (state.sim.done) { state.sim = new BoardingSimulation(); state.sim.init(method); }
    while (state.sim.tick()) {}
    updateStats();
    if (state.p5) state.p5.redraw();
    playBtn.innerHTML = bsimPlayIcon + 'Play';
  });

  speedSlider.addEventListener('input', function () {
    state.speed = parseInt(this.value);
    speedValue.textContent = state.speed + ' steps/sec';
  });

  updateStats();
}

// --- Comparison chart ---
function renderComparisonChart() {
  const methods = [
    { id: 'front-to-back', label: 'Front-to-Back' },
    { id: 'back-to-front', label: 'Back-to-Front' },
    { id: 'random', label: 'Random' },
    { id: 'wilma', label: 'WilMA' },
    { id: 'steffen-modified', label: 'Steffen Modified' },
    { id: 'steffen', label: 'Steffen Perfect' },
  ];
  const runs = 200;
  const results = [];

  methods.forEach(m => {
    let totalTicks = 0;
    for (let i = 0; i < runs; i++) {
      const sim = new BoardingSimulation();
      sim.init(m.id);
      while (sim.tick()) {}
      totalTicks += sim.ticks;
    }
    results.push({ label: m.label, avg: Math.round(totalTicks / runs) });
  });

  results.sort((a, b) => b.avg - a.avg);
  const maxAvg = results[0].avg;

  const barColors = {
    'Front-to-Back': 'rgb(220, 53, 69)',
    'Back-to-Front': 'rgb(220, 53, 69)',
    'Random': 'rgb(65, 105, 225)',
    'WilMA': 'rgb(255, 193, 7)',
    'Steffen Modified': 'rgb(75, 192, 112)',
    'Steffen Perfect': 'rgb(75, 192, 112)',
  };

  const container = document.getElementById('comparison-bars');
  container.innerHTML = results.map(r => {
    const pct = (r.avg / maxAvg * 100).toFixed(1);
    const color = barColors[r.label] || 'var(--secondary)';
    return '<div class="bar-row">' +
      '<span class="bar-label">' + r.label + '</span>' +
      '<div class="bar-track"><div class="bar-fill" style="width:' + pct + '%;background:' + color + ';"></div></div>' +
      '<span class="bar-value">' + r.avg + '</span>' +
      '</div>';
  }).join('');
}

document.addEventListener('DOMContentLoaded', function () {
  createBoardingViz('sim-btf', 'back-to-front');
  createBoardingViz('sim-random', 'random');
  createBoardingViz('sim-wilma', 'wilma');
  createBoardingViz('sim-steffen', 'steffen');
  renderComparisonChart();
});
</script>
{{< /rawhtml >}}
