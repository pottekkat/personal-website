---
title: The Ladybug Clock Puzzle
slug: ladybug-clock-puzzle
date: 2026-01-18T12:52:59+05:30
draft: false
math: true
toc:
  show: false
ShowRelatedContent: false
description: An interactive exploration of a deceptively simple probability puzzle.
summary: A ladybug walks randomly around a clock. What's the probability that 6 is the last number she visits?
tags:
  - interactive
  - mathematics
  - visual
categories:
  - Mathematics
series: []
aliases: []
cover:
  image: /images/the-ladybug-clock-puzzle/ladybug-banner.jpg
  alt: A ladybug on a flower.
  caption: When it comes to matters of probability I always trust my intuition (to be wrong).
  relative: false
fmContentType: Post (default)
---

{{< blockquote author="3Blue1Brown" link="https://www.youtube.com/shorts/t3jZ2xGOvYg" title="The Ladybug Clock Puzzle" >}}
A ladybug lands **on the 12** of a clock, and every second she moves **randomly to a neighbouring number**, either one step clockwise or one step counterclockwise. Each time she touches a number, we are colouring it red. _What is the probability that the **very last number to get coloured is the 6?**_
{{< /blockquote >}}

At first glance, it _seemed_ like $6$, being the farthest point from $12$, should have a special probability. It also _seemed_ like my intuition was wrong.

The simplest solution is to run the experiment twenty thousand times and see what happens.

> [!IMPORTANT]
> No ladybugs were harmed during the making of this post.

{{< rawhtml >}}
<style>
.sketch-container {
    width: 100%;
    margin: 0 auto 20px auto;
    padding: 14px;
    border: 1px solid var(--border);
    background-color: var(--hljs-bg);
    display: flex;
    justify-content: center;
    align-items: center;
}

.controls-container {
  width: 100%;
  margin: 0 auto 20px auto;
  padding: 14px;
  border: 1px solid var(--border);
  background-color: var(--hljs-bg);
}

.slider-container {
  margin-bottom: 15px;
}

.slider-container label {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--secondary);
  justify-content: space-between;
}

.slider-row input[type="range"] {
  width: 100%;
  -webkit-appearance: none;
  height: 8px;
  background: var(--code-bg);
  border-radius: 0;
  border: none;
}

.slider-row input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--secondary);
  cursor: pointer;
}

.slider-row input[type="range"]::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--secondary);
  cursor: pointer;
  border: none;
}

.slider-row input[type="range"]:focus {
  outline: none;
}

.slider-value {
  min-width: 80px;
  text-align: right;
  font-size: 14px;
}

.button-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.sim-button {
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

.sim-button svg {
  width: 10px;
  height: 10px;
  fill: currentColor;
}

.sim-button:hover {
  background: var(--border);
}

.sim-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sim-button.primary {
  background: var(--primary);
  color: var(--code-bg);
}

.sim-button.primary:hover {
  background: var(--secondary);
}

.stats-container {
  width: 100%;
  margin: 0 auto 20px auto;
  padding: 14px;
  border: 1px solid var(--border);
  background-color: var(--hljs-bg);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  text-align: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: var(--primary);
}

.stat-label {
  font-size: 14px;
  color: var(--secondary);
  margin-top: 4px;
}

.chart-container {
  display: none;
  width: 100%;
  margin: 0 auto 20px auto;
  padding: 14px;
  border: 1px solid var(--border);
  background-color: var(--hljs-bg);
}

.chart-container.visible {
  display: block;
}

.chart-header {
  font-size: 14px;
  color: var(--secondary);
  margin-bottom: 12px;
}

.bar-row {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  font-size: 14px;
}

.bar-label {
  width: 20px;
  text-align: left;
  margin-right: 10px;
  color: var(--secondary);
  line-height: 20px;
}

.bar-label.bar-highlight,
.bar-value.bar-highlight {
  color: var(--primary);
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
  width: 60px;
  text-align: right;
  margin-left: 10px;
  color: var(--secondary);
  font-size: 14px;
  line-height: 20px;
  white-space: nowrap;
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .stat-value {
    font-size: 18px;
  }
  .bar-label {
    width: 18px;
  }
  .bar-value {
    width: 55px;
    font-size: 13px;
  }
}
</style>

<script src="https://cdn.jsdelivr.net/npm/p5@1.11.3/lib/p5.min.js"></script>

<div class="controls-container">
  <div class="slider-container">
    <label for="speed-slider">
      Simulation Speed
      <span class="slider-value" id="speed-value">5 steps/sec</span>
    </label>
    <div class="slider-row">
      <input type="range" id="speed-slider" min="1" max="30" value="5" step="1">
    </div>
  </div>

  <div class="button-row">
    <button id="start-btn" class="sim-button primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M91.2 36.9c-12.4-6.8-27.4-6.5-39.6 .7S32 57.9 32 72l0 368c0 14.1 7.5 27.2 19.6 34.4s27.2 7.5 39.6 .7l336-184c12.8-7 20.8-20.5 20.8-35.1s-8-28.1-20.8-35.1l-336-184z"/></svg>Start</button>
    <button id="reset-btn" class="sim-button"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M65.9 228.5c13.3-93 93.4-164.5 190.1-164.5 53 0 101 21.5 135.8 56.2 .2 .2 .4 .4 .6 .6l7.6 7.2-47.9 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l128 0c17.7 0 32-14.3 32-32l0-128c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 53.4-11.3-10.7C390.5 28.6 326.5 0 256 0 127 0 20.3 95.4 2.6 219.5 .1 237 12.2 253.2 29.7 255.7s33.7-9.7 36.2-27.1zm443.5 64c2.5-17.5-9.7-33.7-27.1-36.2s-33.7 9.7-36.2 27.1c-13.3 93-93.4 164.5-190.1 164.5-53 0-101-21.5-135.8-56.2-.2-.2-.4-.4-.6-.6l-7.6-7.2 47.9 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 320c-8.5 0-16.7 3.4-22.7 9.5S-.1 343.7 0 352.3l1 127c.1 17.7 14.6 31.9 32.3 31.7S65.2 496.4 65 478.7l-.4-51.5 10.7 10.1c46.3 46.1 110.2 74.7 180.7 74.7 129 0 235.7-95.4 253.4-219.5z"/></svg>Reset</button>
    <button id="batch-btn" class="sim-button"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M19.8 477.6c12 5 25.7 2.2 34.9-6.9L224 301.3 224 448c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9L448 301.3 448 448c0 17.7 14.3 32 32 32s32-14.3 32-32l0-384c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 146.7-169.4-169.4c-9.2-9.2-22.9-11.9-34.9-6.9S224 51.1 224 64L224 210.7 54.6 41.4c-9.2-9.2-22.9-11.9-34.9-6.9S0 51.1 0 64L0 448c0 12.9 7.8 24.6 19.8 29.6z"/></svg>Run 10000x</button>
  </div>
</div>

<div id="clock-container" class="sketch-container"></div>

<div class="stats-container">
  <div class="stats-grid">
    <div class="stat-item">
      <span class="stat-value" id="current-pos">12</span>
      <span class="stat-label">Current Position</span>
    </div>
    <div class="stat-item">
      <span class="stat-value" id="steps-count">0</span>
      <span class="stat-label">Steps Taken</span>
    </div>
    <div class="stat-item">
      <span class="stat-value" id="visited-count">1</span>
      <span class="stat-label">Numbers Visited</span>
    </div>
    <div class="stat-item">
      <span class="stat-value" id="runs-count">0</span>
      <span class="stat-label">Total Runs</span>
    </div>
  </div>
</div>

<div id="probability-chart" class="chart-container">
  <div class="chart-header">Ending position distribution</div>
  <div id="chart-bars"></div>
</div>

<script>

const playIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M91.2 36.9c-12.4-6.8-27.4-6.5-39.6 .7S32 57.9 32 72l0 368c0 14.1 7.5 27.2 19.6 34.4s27.2 7.5 39.6 .7l336-184c12.8-7 20.8-20.5 20.8-35.1s-8-28.1-20.8-35.1l-336-184z"/></svg>';
const pauseIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M48 64C21.5 64 0 85.5 0 112L0 400c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48L48 64zm192 0c-26.5 0-48 21.5-48 48l0 288c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48l-32 0z"/></svg>';

// Shared state - using bitmask for visited
const simState = {
  position: 0,
  visitedMask: 1,       // Bitmask: bit i = 1 means position i visited
  steps: 0,
  running: false,
  speed: 5,
  totalRuns: 0,
  lastCounts: new Array(12).fill(0),
  currentRun: null,
  animationId: null,
  lastStepTime: 0,
};

// Helper: count bits set in mask
const popcount = (n) => {
  let count = 0;
  while (n) { count += n & 1; n >>= 1; }
  return count;
};

// Helper: check if bit is set
const isVisited = (mask, pos) => (mask & (1 << pos)) !== 0;

let clockP5 = null;

const clockSketch = (p) => {
  let clockRadius, centerX, centerY;
  let secondaryColor, clockBgColor;
  const redColor = 'rgb(220, 53, 69)';
  const greenColor = 'rgb(75, 192, 112)';

  const angles = [];
  for (let i = 0; i < 12; i++) {
    angles[i] = (i * 30 - 90) * (Math.PI / 180);
  }

  const getClockCoords = (num, radius) => ({
    x: centerX + radius * Math.cos(angles[num]),
    y: centerY + radius * Math.sin(angles[num])
  });

  const updateColors = () => {
    const root = getComputedStyle(document.documentElement);
    secondaryColor = root.getPropertyValue('--secondary').trim();
    clockBgColor = root.getPropertyValue('--tertiary').trim();
  };

  p.setup = function() {
    const container = document.getElementById('clock-container');
    const width = container.offsetWidth - 28;
    const height = Math.min(width, 400);
    p.createCanvas(width, height);

    updateColors();

    clockRadius = Math.min(width, height) * 0.38;
    centerX = width / 2;
    centerY = height / 2;

    p.noLoop();

    const observer = new MutationObserver(() => {
      updateColors();
      p.redraw();
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  };

  p.draw = function() {
    p.clear();

    p.fill(clockBgColor);
    p.noStroke();
    p.ellipse(centerX, centerY, clockRadius * 2.5, clockRadius * 2.5);

    p.noFill();
    p.stroke(secondaryColor);
    p.strokeWeight(2);
    p.ellipse(centerX, centerY, clockRadius * 2.6, clockRadius * 2.6);

    p.noStroke();
    p.fill(secondaryColor);
    p.textAlign(p.CENTER, p.CENTER);
    p.textFont('Georgia');
    p.textSize(10);
    p.text('BEETLING', centerX, centerY - clockRadius * 0.35);

    p.textSize(18);

    const visitedCount = popcount(simState.visitedMask);

    for (let i = 0; i < 12; i++) {
      const coords = getClockCoords(i, clockRadius);
      const visited = isVisited(simState.visitedMask, i);
      const isLast = visitedCount === 12 && !simState.running && simState.currentRun === i;

      if (visited) {
        p.fill(isLast ? greenColor : redColor);
        p.noStroke();
        p.ellipse(coords.x, coords.y, 40, 40);
        p.fill(255);
      } else {
        p.noFill();
        p.stroke(secondaryColor);
        p.strokeWeight(1);
        p.ellipse(coords.x, coords.y, 40, 40);
        p.fill(secondaryColor);
        p.noStroke();
      }
      p.text(i === 0 ? 12 : i, coords.x, coords.y);
    }

    const bugCoords = getClockCoords(simState.position, clockRadius * 0.65);
    p.fill(redColor);
    p.noStroke();
    p.ellipse(bugCoords.x, bugCoords.y, 28, 28);
    p.stroke(30);
    p.strokeWeight(2);
    p.line(bugCoords.x, bugCoords.y - 10, bugCoords.x, bugCoords.y + 10);
    p.fill(30);
    p.noStroke();
    p.ellipse(bugCoords.x - 6, bugCoords.y - 4, 5, 5);
    p.ellipse(bugCoords.x - 5, bugCoords.y + 5, 5, 5);
    p.ellipse(bugCoords.x + 6, bugCoords.y - 4, 5, 5);
    p.ellipse(bugCoords.x + 5, bugCoords.y + 5, 5, 5);
    p.ellipse(bugCoords.x, bugCoords.y - 12, 10, 8);
  };

  p.windowResized = function() {
    const container = document.getElementById('clock-container');
    const width = container.offsetWidth - 28;
    const height = Math.min(width, 400);
    p.resizeCanvas(width, height);
    clockRadius = Math.min(width, height) * 0.38;
    centerX = width / 2;
    centerY = height / 2;
    p.redraw();
  };
};

function initChart() {
  const chartBars = document.getElementById('chart-bars');
  let html = '';
  for (let i = 1; i <= 11; i++) {
    const barColor = i === 6 ? 'rgb(75, 192, 112)' : 'rgb(220, 53, 69)';
    const highlightClass = i === 6 ? ' bar-highlight' : '';
    html += '<div class="bar-row">' +
      '<span class="bar-label' + highlightClass + '">' + i + '</span>' +
      '<div class="bar-track">' +
      '<div class="bar-fill" id="bar-' + i + '" style="width: 0%; background: ' + barColor + ';"></div>' +
      '</div>' +
      '<span class="bar-value' + highlightClass + '" id="value-' + i + '">0.0%</span>' +
      '</div>';
  }
  chartBars.innerHTML = html;
}

function updateChart() {
  const chartContainer = document.getElementById('probability-chart');

  // Show chart only when there are runs
  if (simState.totalRuns > 0) {
    chartContainer.classList.add('visible');
  } else {
    chartContainer.classList.remove('visible');
    return;
  }

  const total = simState.totalRuns;
  let maxPercent = 0;

  for (let i = 1; i <= 11; i++) {
    const percent = (simState.lastCounts[i] / total) * 100;
    if (percent > maxPercent) maxPercent = percent;
  }

  const scale = maxPercent > 0 ? 100 / maxPercent : 1;
  for (let i = 1; i <= 11; i++) {
    const percent = (simState.lastCounts[i] / total) * 100;
    const barWidth = percent * scale;
    document.getElementById(`bar-${i}`).style.width = barWidth + '%';
    document.getElementById(`value-${i}`).textContent = percent.toFixed(1) + '%';
  }
}

function animationLoop(timestamp) {
  if (!simState.running) return;

  const interval = 1000 / simState.speed;
  if (timestamp - simState.lastStepTime >= interval) {
    simState.lastStepTime = timestamp;
    takeStep();
  }

  simState.animationId = requestAnimationFrame(animationLoop);
}

function takeStep() {
  const direction = Math.random() < 0.5 ? 1 : -1;
  simState.position = (simState.position + direction + 12) % 12;
  simState.steps++;
  simState.visitedMask |= (1 << simState.position);

  updateStats();
  if (clockP5) clockP5.redraw();

  if (popcount(simState.visitedMask) === 12) {
    simState.running = false;
    simState.currentRun = simState.position;
    simState.totalRuns++;
    simState.lastCounts[simState.position]++;
    updateStats();
    if (clockP5) clockP5.redraw();
    updateChart();
    document.getElementById('start-btn').innerHTML = playIcon + 'Start';
    document.getElementById('start-btn').disabled = false;
    document.getElementById('batch-btn').disabled = false;
  }
}

function resetSimulation() {
  simState.position = 0;
  simState.visitedMask = 1;
  simState.steps = 0;
  simState.running = false;
  simState.currentRun = null;
  if (simState.animationId) {
    cancelAnimationFrame(simState.animationId);
    simState.animationId = null;
  }
  updateStats();
  if (clockP5) clockP5.redraw();
  document.getElementById('start-btn').innerHTML = playIcon + 'Start';
  document.getElementById('start-btn').disabled = false;
}

function runBatch(count) {
  for (let i = 0; i < count; i++) {
    let pos = 0;
    let mask = 1;

    while (mask !== 0xFFF) {
      pos = (pos + (Math.random() < 0.5 ? 1 : -1) + 12) % 12;
      mask |= (1 << pos);
    }

    simState.totalRuns++;
    simState.lastCounts[pos]++;
  }

  updateStats();
  updateChart();
}

function updateStats() {
  document.getElementById('current-pos').textContent = simState.position === 0 ? 12 : simState.position;
  document.getElementById('steps-count').textContent = simState.steps;
  document.getElementById('visited-count').textContent = popcount(simState.visitedMask);
  document.getElementById('runs-count').textContent = simState.totalRuns;
}

document.addEventListener('DOMContentLoaded', function() {
  clockP5 = new p5(clockSketch, document.getElementById('clock-container'));
  initChart();

  document.getElementById('speed-slider').addEventListener('input', function() {
    simState.speed = parseInt(this.value);
    document.getElementById('speed-value').textContent = simState.speed + ' steps/sec';
  });

  document.getElementById('start-btn').addEventListener('click', function() {
    if (popcount(simState.visitedMask) === 12) {
      resetSimulation();
    }

    simState.running = !simState.running;
    this.innerHTML = simState.running ? pauseIcon + 'Pause' : playIcon + 'Start';

    if (simState.running) {
      simState.lastStepTime = performance.now();
      document.getElementById('batch-btn').disabled = true;
      simState.animationId = requestAnimationFrame(animationLoop);
    } else {
      if (simState.animationId) {
        cancelAnimationFrame(simState.animationId);
        simState.animationId = null;
      }
      document.getElementById('batch-btn').disabled = false;
    }
  });

  document.getElementById('reset-btn').addEventListener('click', function() {
    resetSimulation();
    simState.totalRuns = 0;
    simState.lastCounts = new Array(12).fill(0);
    updateStats();
    updateChart();
  });

  document.getElementById('batch-btn').addEventListener('click', function() {
    this.disabled = true;
    document.getElementById('start-btn').disabled = true;

    setTimeout(() => {
      runBatch(10000);
      this.disabled = false;
      document.getElementById('start-btn').disabled = false;
    }, 10);
  });
});
</script>
{{< /rawhtml >}}

Run the simulation a few times and see how she reaches the last number. It looks a bit random at first. Once you are tired of playing around, click **Run 10000x** to see the probability distribution emerge.

> [!TIP]
> Spam the **Run 10000x** button.

The probability that $6$ is the last number colored is converging to **$\sim 9.09\\%$** or **$1/11$**. So is the probability for _every_ number!

_Why?_

To understand that, let's look at _what must happen_ for any number to be the last one visited.

Think of the clock as a cycle of $12$ nodes. The ladybug starts at $12$ (position $0$) and at each step moves to a neighboring number with equal probability.

For any number $k$ to be the **last** visited, the ladybug must:

1. First reach one of its neighbors (either $k-1$ or $k+1$)
2. Then travel **all the way around** the clock to reach the other neighbor
3. Only then, finally, step onto $k$

This maps to the [Gambler's Ruin problem](https://en.wikipedia.org/wiki/Gambler%27s_ruin).

Picture a gambler who starts with $x$ dollars. Each round, she flips a fair coin: heads, she wins a dollar; tails, she loses one. She keeps playing until she either goes bankrupt ($0$ dollars) or hits her target ($n$ dollars).

The probability of reaching $n$ before $0$ is:

$$
P(\text{reach } n \text{ before } 0 \mid \text{start at } x) = \frac{x}{n}
$$

Start with $1$ dollar and try to reach $11$? Your odds are $1/11$. _Not great._

Our ladybug is doing the exact same thing: moving randomly with equal probability in either direction. Let's apply this to position $6$.

**Step 1**: The ladybug must first reach either $5$ or $7$ (without visiting $6$).

By symmetry (the clock is symmetric around the $12$-$6$ axis), there's a $50\\%$ chance she reaches $5$ first and a $50\\%$ chance she reaches $7$ first.

**Step 2**: Say she reaches $5$ first (having visited $12, 1, 2, 3, 4$ along the way). For $6$ to be last, she must now go _all the way around_ the clock ($5 \to 4 \to 3 \to 2 \to 1 \to 12 \to 11 \to 10 \to 9 \to 8 \to 7$), before stepping onto $6$.

From position $5$, she's $1$ step away from $6$ and $10$ steps away from $7$ (going the long way). Sound familiar? She's our gambler, starting with $1$ dollar and trying to reach $11$ before going broke. Using the formula:

$$
P(\text{reach 7 before 6} \mid \text{start at 5}) = \frac{1}{11}
$$

**Step 3**: Combining both cases:

$$
\begin{aligned}
P(6 \text{ is last}) &= P(\text{reach 5 first}) \cdot P(\text{reach 7 before 6} \mid \text{at 5}) \\\\[3ex]
&\quad + P(\text{reach 7 first}) \cdot P(\text{reach 5 before 6} \mid \text{at 7}) \\\\[3ex]
&= \frac{1}{2} \cdot \frac{1}{11} + \frac{1}{2} \cdot \frac{1}{11} \\\\[3ex]
&= \boxed{\frac{1}{11}}
\end{aligned}
$$

The same argument works for _every_ number (except $12$, of course, which is already visited at the start).

For any number $k$ to be last, you must reach one of its neighbors first, then go the long way around ($10$ steps) before taking the short way ($1$ step) to $k$. The "long way" is always $10$ steps, and the "short way" is always $1$ step, regardless of which number you're considering.

Once you've visited one neighbor of a number, you've necessarily visited all the other numbers on that side of the clock. The structure is the same for every position.

$$
P(k \text{ is last}) = \frac{1}{11} \quad \text{for all } k \in \{1, 2, 3, ..., 11\}
$$

The positions aren't symmetric in terms of _distance_ from $12$ but they are symmetric in terms of the _structure_ of the random walk reaching them last.

Thanks to the smart people on the YouTube comment section, without whom I would not have been able to piece this together.

As I was exploring solutions to this problem, I came across [Austin Z. Henley's blog post](https://austinhenley.com/blog/ladybugclock.html) where he also made a simulation!
