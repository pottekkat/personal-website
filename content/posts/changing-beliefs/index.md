---
title: The Idea of Changing Beliefs
slug: changing-beliefs
date: 2025-03-13T09:28:09+05:30
draft: true
math: true
toc:
    show: false
ShowRelatedContent: false
description: An interactive guide for updating beliefs based on evidence.
summary: A visual and interactive guide to understanding Bayes' Theorem, a fundamental tool for updating probabilities with new evidence.
tags:
    - interactive
    - mathematics
    - visual
categories:
    - Mathematics
series: []
aliases: []
cover:
    image: /images/changing-beliefs/testing-banner.jpg
    alt: Photo of test tubes used for conducting medical tests.
    caption: The virtue of a doer itself does not guarantee good outcomes - The Nitopadesha
    relative: true
fmContentType: Post (default)
---

{{< blockquote author="Christopher Martyn" link="https://doi.org/10.1136/bmj.g5619" title="Risky business: doctors' understanding of statistics" >}}
If a test to detect a disease whose prevalence is 1/1000 has a false positive rate of 5%, what is the chance that a person found to have a positive result actually has the disease, assuming that you know nothing else about the person's symptoms or signs?
{{< /blockquote >}}

Every once in a while, some variation of this question goes viral on social media, flooding the comments section with intuitive but incorrect answers until someone shows up and solves the problem mathematically (or `@AskPerplexity` it these days). This time, the question appeared in a [reply to a tweet](https://x.com/jeremykauffman/status/1898011686558196194) dunking on the new leadership of the U.S. Department of Health and Human Services (HHS).

When this question was originally proposed, an overwhelming majority of people, including doctors and medical students from Harvard teaching hospitals, thought the patient in the question had a **95% chance** of actually having the disease when the correct answer is closer to **just 2%**.

While this question is phrased awkwardly and has some missing data, the reason why people make guesses closer to 95% instead of 2% is because of the counterintuitive nature of probability. After all, if the test only has a 5% false positive rate, i.e., incorrectly detecting a person has the disease while they don't, it *feels* reasonable to guess that 95% of the time, the test would correctly detect the person has the disease.

But even if we assume the test could correctly detect a person has the disease when they actually have the disease with complete certainty, i.e., a 100% true positive rate, the answer is still 2%. Let's break down the mathematics to see why.

Here's what we know:

$$
\text{Prevalence of the disease: } P(D) = \frac{1}{1000}
$$

$$
\text{False positive rate: } P(+ \mid \neg D) = 5\\% = \frac{5}{100}
$$

> **Note**: $P(D)$ is the probability of having the disease before knowing the test result.

What we need to find is the probability that a person actually has the disease given that they tested positive, i.e., $P(D \mid +)$.

If we consider a sample of 1000 people where exactly 1 person has the disease (because $P(D) = \frac{1}{1000}$) and assume the test is perfectly accurate when detecting the disease, i.e., a 100% true positive rate ($P(+ \mid D)$), this is what the test results would look like:

{{< rawhtml >}}

<style>
.sketch-container {
    width: 100%;
    max-width: 720px;
    margin: 0 auto;
    margin-bottom: 20px;
    padding: 14px;
    border: 1px solid var(--code-bg);
    overflow: hidden;
    background-color: var(--content-background);
    display: flex;
    justify-content: center;
    align-items: center;
}
.legend-circle {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  margin-right: 5px;
  display: inline-block;
}
.red-circle {
  background-color: rgb(220, 53, 69);
}
.yellow-circle {
  background-color: rgb(255, 193, 7);
}
.green-circle {
  background-color: rgb(75, 192, 112);
}
</style>

<!-- Load p5.js libraries once per page -->
<script src="https://cdn.jsdelivr.net/npm/p5@1.11.3/lib/p5.min.js"></script>

<!-- Common utility functions for sketches -->
<script>
// Colors for all sketches
const COLORS = {
  red: [220, 53, 69],      // Danger red
  yellow: [255, 193, 7],   // Amber yellow
  green: [75, 192, 112],   // Softer green
  // Not needed now because no text is being rendered inside the canvas
  // primary: null,           // Will be set from CSS variable
  // secondary: null          // Will be set from CSS variable
};

// Makes a color lighter or darker
function createHoverColor(p, baseColor, factor) {
  const r = p.red(baseColor);
  const g = p.green(baseColor);
  const b = p.blue(baseColor);
  
  return p.color(
    p.constrain(r * factor, 0, 255),
    p.constrain(g * factor, 0, 255),
    p.constrain(b * factor, 0, 255)
  );
}

// Not needed now
/* function getCssVariables() {
  const root = getComputedStyle(document.documentElement);
  COLORS.primary = root.getPropertyValue('--primary').trim();
  COLORS.secondary = root.getPropertyValue('--secondary').trim();
} */

// Base class for circle elements
class Circle {
  constructor(p, row, col, colorType, circleSize, paddingX, paddingY, startY) {
    this.p = p;
    this.row = row;
    this.col = col;
    this.x = 0;      // Will be calculated in update()
    this.y = 0;      // Will be calculated in update()
    this.colorType = colorType;
    this.circleSize = circleSize;
    this.paddingX = paddingX;
    this.paddingY = paddingY;
    this.startY = startY;
    this.hovered = false;
  }
  
  // Update circle position and check for mouse hover
  update(mouseX, mouseY) {
    // Calculate position based on grid layout
    this.x = this.paddingX + (this.col * (this.circleSize + this.paddingX)) + (this.circleSize / 2);
    this.y = this.startY + (this.row * (this.circleSize + this.paddingY)) + (this.circleSize / 2);
    
    // Check if mouse is over this circle
    const distance = this.p.dist(mouseX, mouseY, this.x, this.y);
    this.hovered = distance < this.circleSize / 2;
  }
}

// Calculate layout dimensions based on container size
function calculateLayout(containerId, gridSize, minPadding, maxPadding, paddingRatio) {
  // Get container dimensions
  const container = document.getElementById(containerId);
  const containerWidth = container.offsetWidth - 28; // Account for padding
  
  // A consistent padding that will be used throughout the grid
  const padding = Math.min(Math.max(containerWidth * paddingRatio, minPadding), maxPadding);
  
  // Calculate available space for elements after accounting for all padding
  const availableWidth = containerWidth - (padding * (gridSize.cols + 1));
  const elementWidth = availableWidth / gridSize.cols;
  
  // Calculate the total height needed for the grid with consistent padding
  const gridHeight = (elementWidth * gridSize.rows) + (padding * (gridSize.rows + 1));
  
  return { 
    width: containerWidth, 
    height: gridHeight,
    elementWidth: elementWidth,
    padding: padding
  };
}

// Shuffle the grid randomly
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
</script>
{{< /rawhtml >}}

{{< rawhtml >}}
<!-- Create a container for this specific sketch -->
<div id="sketch-container-1" class="sketch-container"></div>

<script>
/**
 * Grid of 1000 circles showing disease test results:
 * - 1 red: person with disease (true positive)
 * - 49 yellow: people without disease who tested positive (false positives)
 * - 950 green: people without disease who tested negative (true negatives)
 */
const sketch1 = (p) => {
  // Grid configuration
  const gridSize = { rows: 25, cols: 40 };
  const circles = [];
  
  // Layout variables
  let circleSize, paddingX, paddingY, startY;
  
  // Colors
  let greenColor, yellowColor, redColor;
  let greenHoverColor, yellowHoverColor, redHoverColor;
  
  // Circle implementation for this sketch
  class GridCircle extends Circle {
    draw() {
      // Determine fill color based on type and hover state
      if (this.hovered) {
        switch (this.colorType) {
          case 'red': this.p.fill(redHoverColor); break;
          case 'yellow': this.p.fill(yellowHoverColor); break;
          default: this.p.fill(greenHoverColor); // green is default
        }
      } else {
        switch (this.colorType) {
          case 'red': this.p.fill(redColor); break;
          case 'yellow': this.p.fill(yellowColor); break;
          default: this.p.fill(greenColor);
        }
      }
      
      this.p.noStroke();
      this.p.ellipse(this.x, this.y, this.circleSize);
    }
  }
  
  // Create lighter/darker versions of colors for hover states
  const createHoverColors = () => {
    // Create hover colors
    greenHoverColor = createHoverColor(p, greenColor, 1.2);
    yellowHoverColor = createHoverColor(p, yellowColor, 1.1);
    redHoverColor = createHoverColor(p, redColor, 1.2);
  };
  
  // Create all circles with their colors
  const createCircles = () => {
    circles.length = 0; // Clear any existing circles
    
    // Create and shuffle positions
    const positions = [];
    for (let i = 0; i < gridSize.rows * gridSize.cols; i++) {
      positions.push(i);
    }
    
    shuffleArray(positions);
    
    // Create circles with appropriate colors
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      const row = Math.floor(pos / gridSize.cols);
      const col = pos % gridSize.cols;
      
      let colorType;
      if (i === 0) {
        colorType = 'red'; // 1 red circle
      } else if (i < 50) {
        colorType = 'yellow'; // 49 yellow circles
      } else {
        colorType = 'green'; // 950 green circles
      }
      
      circles.push(new GridCircle(p, row, col, colorType, circleSize, paddingX, paddingY, startY));
    }
  };
  
  p.setup = function() {
    // Initialize colors
    greenColor = p.color(COLORS.green);
    yellowColor = p.color(COLORS.yellow);
    redColor = p.color(COLORS.red);
    
    createHoverColors();
    
    // Calculate dimensions and create canvas
    const dimensions = calculateLayout('sketch-container-1', gridSize, 2, 10, 0.01);
    p.createCanvas(dimensions.width, dimensions.height);
    
    // Set layout values
    circleSize = dimensions.elementWidth;
    paddingX = dimensions.padding;
    paddingY = dimensions.padding;
    startY = dimensions.padding;
    
    // Create the circles
    createCircles();
  };

  p.draw = function() {
    p.clear();
    
    circles.forEach(circle => {
      circle.update(p.mouseX, p.mouseY);
      circle.draw();
    });
  };

  p.windowResized = function() {
    const dimensions = calculateLayout('sketch-container-1', gridSize, 2, 10, 0.01);
    p.resizeCanvas(dimensions.width, dimensions.height);
    
    // Update circle size and padding values
    circleSize = dimensions.elementWidth;
    paddingX = dimensions.padding;
    paddingY = dimensions.padding;
    startY = dimensions.padding;
    
    // Recreate all circles with new dimensions
    createCircles();
  };
};

new p5(sketch1, document.getElementById('sketch-container-1'));
</script>
{{< /rawhtml >}}

{{< rawhtml >}}
<p style="margin-bottom: 5px !important;">
  <span class="legend-circle red-circle"></span>
  <strong style="color: rgb(220, 53, 69);">1</strong> person <strong style="color: rgb(220, 53, 69);">has the disease</strong> and <strong style="color: rgb(220, 53, 69);">tested positive</strong> (because $P(D) = \frac{1}{1000}$ and $P(+ \mid D) = 1$).
</p>
<p style="margin-bottom: 5px !important;">
  <span class="legend-circle yellow-circle"></span>
  <strong style="color: rgb(255, 193, 7);">49</strong> people <strong style="color: rgb(255, 193, 7);">don't have the disease</strong> but <strong style="color: rgb(255, 193, 7);">tested positive</strong> (because $P(+ \mid \neg D) = 5\% = \frac{5}{100} \approx \frac{49}{999}$, for easier calculation).
</p>
<p>
  <span class="legend-circle green-circle"></span>
  <strong style="color: rgb(75, 192, 112);">950</strong> people <strong style="color: rgb(75, 192, 112);">don't have the disease</strong> and <strong style="color: rgb(75, 192, 112);">tested negative</strong>.
</p>
<p>
From our sample of 1000 people, 50 tested positive for the disease (<span class="legend-circle red-circle" style="margin: 0 3px !important;"></span> and <span class="legend-circle yellow-circle" style="margin: 0 3px !important;"></span>). So, if a person tests positive, we know they are either the <span class="legend-circle red-circle" style="margin: 0 3px !important;"></span> 1 true positive or somewhere in the <span class="legend-circle yellow-circle" style="margin: 0 3px !important;"></span> 49 false positives. Hence, the <strong>probability of having the disease, given a person tested positive</strong>, can be written as:
<p>
{{< /rawhtml >}}

$$
\begin{aligned}
P(D \mid +) &= \frac{Number \ of \ true \ positives}{Total \ number \ of \ positives} \\\\[3ex]
&= \frac{\color{#DC3545} Number \ of \ true \ positives}{\color{#DC3545} Number \ of \ true \ positives \color{normalcolor} + \color{#FFC107} Number \ of \ false \ positives} \\\\[3ex]
&= \frac{\color{#DC3545} 1}{\color{#DC3545} 1 \color{normalcolor} + \color{#FFC107} 49} \\\\[3ex]
&= \boxed{2\\%}
\end{aligned}
$$

We can arrive at the same result through [Bayes\' theorem](https://en.wikipedia.org/wiki/Bayes%27_theorem):

$$
\begin{aligned}
P(D \mid +) &= \frac{P(D \cap +)}{P(+)} \\\\[3ex]
&= \frac{P(D \cap +)}{P(D \cap +) + P(\neg D \cap +)} \\\\[3ex]
&= \frac{\frac{1}{1000}}{\frac{1}{1000} + \frac{49}{1000}} \\\\[3ex]
&= \frac{1}{50} \\\\[3ex]
&= \boxed{2\\%}
\end{aligned}
$$

When we imagine a sample like this and apply the probabilities, arriving at 2% feels clear and intuitive. Then why do so many people get it wrong? When presented with a question like this, they often focus only on the test's false positive rate (5%) and assume it means a 95% chance of being correct, ignoring the disease's rarity.

**Bayes' theorem teaches us to update our prior beliefs**—here, the 1 in 1000 prevalence of the disease—**with new evidence, like the test result.**

To make this idea stick, try the interactive example below and watch how the probability shifts. You can adjust the disease prevalence, the test's sensitivity to detect the disease, and its specificity to accurately rule out the disease in healthy people.

<!-- Hey Cursor ONLY EDIT THINGS BELOW THIS COMMENT AND DON'T REMOVE THIS COMMENT -->

{{< rawhtml >}}
<style>
.controls-container {
  width: 100%;
  max-width: 720px;
  margin: 0 auto 20px auto;
  padding: 14px;
  border: 1px solid var(--code-bg);
  background-color: var(--content-background);
}

.slider-container:not(:last-of-type) {
  margin-bottom: 15px;
}

.slider-container label {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  font-size: 14px;
  color: var(--secondary);
  justify-content: space-between;
}

.slider-row {
  display: flex;
  align-items: center;
}

.slider-row input[type="range"] {
  flex-grow: 1;
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

.slider-row input[type="range"]::-ms-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--secondary);
  cursor: pointer;
}

.slider-row input[type="range"]:focus {
  outline: none;
}

.slider-value {
  min-width: 40px;
  text-align: right;
}
</style>

<div class="controls-container">
  <div class="slider-container">
    <label for="prevalence-slider">
      Disease Prevalence (per 1000 people)
      <span class="slider-value" id="prevalence-value">10</span>
    </label>
    <div class="slider-row">
      <input type="range" id="prevalence-slider" min="1" max="100" value="10" step="1">
    </div>
  </div>
  
  <div class="slider-container">
    <label for="sensitivity-slider">
      Test Sensitivity (True Positive Rate)
      <span class="slider-value" id="sensitivity-value">90%</span>
    </label>
    <div class="slider-row">
      <input type="range" id="sensitivity-slider" min="50" max="100" value="90" step="1">
    </div>
  </div>
  
  <div class="slider-container">
    <label for="specificity-slider">
      Test Specificity (True Negative Rate)
      <span class="slider-value" id="specificity-value">91%</span>
    </label>
    <div class="slider-row">
      <input type="range" id="specificity-slider" min="50" max="100" value="91" step="1">
    </div>
  </div>
</div>

<!-- Create a container for the interactive sketch -->
<div id="sketch-container-2" class="sketch-container"></div>

<div id="legend-container">
  <!-- True positives -->
  <p style="margin-bottom: 5px !important;">
    <span class="legend-circle red-circle"></span>
    <strong style="color: rgb(220, 53, 69);"><span id="tp-count">1</span></strong> 
    <span id="tp-people-text">person</span> 
    <strong style="color: rgb(220, 53, 69);">have the disease</strong> and 
    <strong style="color: rgb(220, 53, 69);">tested positive</strong> 
    (<span id="tp-math-1"></span> and <span id="tp-math-2"></span>).
  </p>
  
  <!-- False negatives -->
  <p style="margin-bottom: 5px !important;">
    <span class="legend-circle" style="background-color: rgb(65, 105, 225);"></span>
    <strong style="color: rgb(65, 105, 225);"><span id="fn-count">0</span></strong> 
    <span id="fn-people-text">people</span> 
    <strong style="color: rgb(65, 105, 225);">have the disease</strong> but 
    <strong style="color: rgb(65, 105, 225);">tested negative</strong> 
    (<span id="fn-math"></span>).
  </p>
  
  <!-- False positives -->
  <p style="margin-bottom: 5px !important;">
    <span class="legend-circle yellow-circle"></span>
    <strong style="color: rgb(255, 193, 7);"><span id="fp-count">49</span></strong> 
    <span id="fp-people-text">people</span> 
    <strong style="color: rgb(255, 193, 7);">don't have the disease</strong> but 
    <strong style="color: rgb(255, 193, 7);">tested positive</strong> 
    (<span id="fp-math-1"></span>).
  </p>
  
  <!-- True negatives -->
  <p>
    <span class="legend-circle green-circle"></span>
    <strong style="color: rgb(75, 192, 112);"><span id="tn-count">950</span></strong> 
    <span id="tn-people-text">people</span> 
    <strong style="color: rgb(75, 192, 112);">don't have the disease</strong> and 
    <strong style="color: rgb(75, 192, 112);">tested negative</strong> 
    (<span id="tn-math"></span>).
  </p>
</div>

<div class="results-container">
  <p>The probability of having the disease given a positive test result is around <span class="probability-result" id="bayes-result">9.09%</span>, which is calculated as shown below:</p>
  
  <div class="equation-container" id="equation-display">
    <!-- KaTeX will render here -->
  </div>
</div>

<p>Let's take this a step further and see what happens to the probability when a person with a positive test result takes another test like you usually do for confirmation.</p><p>We can use Bayes' Theorem again, but this time, the prior probability ($P(D)$) is <span class="probability-result" id="bayes-result-copy">9.09%</span>, i.e., the probability of having the disease before taking the second test. Assuming that we take the same test, the probability of having the disease given the person tested positive twice can be written as:</p>

{{< rawhtml >}}
<div class="equation-container" id="second-test-equation-display">
  <!-- KaTeX will render here -->
</div>
{{< /rawhtml >}}

<script>
/**
 * Dynamic grid of circles showing disease test results with configurable parameters:
 * - Prevalence: How many people per 1000 have the disease
 * - Sensitivity: How often the test correctly identifies people with the disease
 * - Specificity: How often the test correctly identifies people without the disease
 */
const sketch2 = (p) => {
  // Grid configuration
  const gridSize = { rows: 25, cols: 40 };
  const circles = [];
  
  // Layout variables
  let circleSize, paddingX, paddingY, startY;
  
  // Colors
  let greenColor, yellowColor, redColor, blueColor;
  let greenHoverColor, yellowHoverColor, redHoverColor, blueHoverColor;
  
  // Probability parameters
  let prevalence = 10;       // Per 1000 people
  let sensitivity = 90;    // True positive rate (%)
  let specificity = 91;     // True negative rate (%)
  
  // Calculated values
  let truePositives = 0;
  let falsePositives = 0;
  let trueNegatives = 0;
  let falseNegatives = 0;
  
  // Circle implementation for this sketch
  class GridCircle extends Circle {
    draw() {
      this.p.noStroke();
      
      if (this.hovered) {
        switch (this.colorType) {
          case 'red': this.p.fill(redHoverColor); break;
          case 'yellow': this.p.fill(yellowHoverColor); break;
          case 'blue': this.p.fill(blueHoverColor); break;
          default: this.p.fill(greenHoverColor);
        }
      } else {
        switch (this.colorType) {
          case 'red': this.p.fill(redColor); break;
          case 'yellow': this.p.fill(yellowColor); break;
          case 'blue': this.p.fill(blueColor); break;
          default: this.p.fill(greenColor);
        }
      }
      
      this.p.ellipse(this.x, this.y, this.circleSize);
    }
  }
  
  // Setup colors
  const setupColors = () => {
    greenColor = p.color(COLORS.green);
    yellowColor = p.color(COLORS.yellow);
    redColor = p.color(COLORS.red);
    blueColor = p.color(65, 105, 225);
    
    // Create hover colors
    greenHoverColor = createHoverColor(p, greenColor, 1.2);
    yellowHoverColor = createHoverColor(p, yellowColor, 1.1);
    redHoverColor = createHoverColor(p, redColor, 1.2);
    blueHoverColor = createHoverColor(p, blueColor, 1.2);
  };
  
  // Calculate the number of circles in each category based on current parameters
  const calculateDistribution = () => {
    const totalCircles = gridSize.rows * gridSize.cols;
    
    // Calculate how many people have the disease
    const diseaseCount = Math.round((prevalence / 1000) * totalCircles);
    const healthyCount = totalCircles - diseaseCount;
    
    // Calculate test results
    truePositives = Math.round(diseaseCount * (sensitivity / 100));
    falseNegatives = diseaseCount - truePositives;
    
    trueNegatives = Math.round(healthyCount * (specificity / 100));
    falsePositives = healthyCount - trueNegatives;
    
    // Update the result display
    updateResultDisplay();
  };
  
  // Update the probability result and equation display
  const updateResultDisplay = () => {
    const totalPositives = truePositives + falsePositives;
    
    // Calculate Bayes probability
    let probability = 0;
    if (totalPositives > 0) {
      probability = (truePositives / totalPositives) * 100;
    }
    
    // Update the result display in both places - always use 2 decimal places
    const probabilityText = probability.toFixed(2) + '%';
    const resultElement = document.getElementById('bayes-result');
    const resultCopyElement = document.getElementById('bayes-result-copy');
    
    if (resultElement) {
      resultElement.textContent = probabilityText;
    }
    
    if (resultCopyElement) {
      resultCopyElement.textContent = probabilityText;
    }
    
    // Update the legend counts and text
    updateLegendCounts();
    
    // Update the legend math expressions
    updateLegendMath(prevalence, sensitivity, specificity);
    
    // Generate the Bayes equation with current values
    updateBayesEquation(truePositives, totalPositives, probability, prevalence, sensitivity, specificity);
  };
  
  // Update legend counts and singular/plural text
  const updateLegendCounts = () => {
    const counts = {
      'tp': truePositives,
      'fn': falseNegatives,
      'fp': falsePositives,
      'tn': trueNegatives
    };
    
    // Update all counts and people/person text
    Object.keys(counts).forEach(key => {
      const count = counts[key];
      document.getElementById(`${key}-count`).textContent = count;
      document.getElementById(`${key}-people-text`).textContent = count === 1 ? 'person' : 'people';
    });
  };
  
  // Create all circles with their colors
  const createCircles = () => {
    circles.length = 0; // Clear any existing circles
    
    // Calculate distribution based on current parameters
    calculateDistribution();
    
    // Create and shuffle positions
    const positions = [];
    for (let i = 0; i < gridSize.rows * gridSize.cols; i++) {
      positions.push(i);
    }
    
    shuffleArray(positions);
    
    // Create circles with appropriate colors
    let circleIndex = 0;
    
    // Helper function to add circles of a specific type
    const addCircles = (count, colorType) => {
      for (let i = 0; i < count; i++) {
        const pos = positions[circleIndex++];
        const row = Math.floor(pos / gridSize.cols);
        const col = pos % gridSize.cols;
        circles.push(new GridCircle(p, row, col, colorType, circleSize, paddingX, paddingY, startY));
      }
    };
    
    // Add all circle types
    addCircles(truePositives, 'red');     // True positives
    addCircles(falseNegatives, 'blue');   // False negatives
    addCircles(falsePositives, 'yellow'); // False positives
    addCircles(trueNegatives, 'green');   // True negatives
  };
  
  // Setup event listeners for sliders
  const setupSliders = () => {
    // Helper function to set up each slider
    const setupSlider = (id, valueId, suffix, updateFn) => {
      const slider = document.getElementById(id);
      const valueElement = document.getElementById(valueId);
      
      if (slider && valueElement) {
        slider.addEventListener('input', function() {
          const value = parseInt(this.value);
          updateFn(value);
          valueElement.textContent = suffix ? value + suffix : value;
          createCircles();
        });
      }
    };
    
    // Set up all sliders
    setupSlider('prevalence-slider', 'prevalence-value', '', value => prevalence = value);
    setupSlider('sensitivity-slider', 'sensitivity-value', '%', value => sensitivity = value);
    setupSlider('specificity-slider', 'specificity-value', '%', value => specificity = value);
  };
  
  p.setup = function() {
    // Initialize colors
    setupColors();
    
    // Calculate dimensions and create canvas
    const dimensions = calculateLayout('sketch-container-2', gridSize, 2, 10, 0.01);
    p.createCanvas(dimensions.width, dimensions.height);
    
    // Set layout values
    circleSize = dimensions.elementWidth;
    paddingX = dimensions.padding;
    paddingY = dimensions.padding;
    startY = dimensions.padding;
    
    // Setup slider event listeners
    setupSliders();
    
    // Create the circles
    createCircles();
  };

  p.draw = function() {
    p.clear();
    
    circles.forEach(circle => {
      circle.update(p.mouseX, p.mouseY);
      circle.draw();
    });
  };

  p.windowResized = function() {
    const dimensions = calculateLayout('sketch-container-2', gridSize, 2, 10, 0.01);
    p.resizeCanvas(dimensions.width, dimensions.height);
    
    // Update layout values
    circleSize = dimensions.elementWidth;
    paddingX = dimensions.padding;
    paddingY = dimensions.padding;
    startY = dimensions.padding;
    
    // Recreate all circles with new dimensions
    createCircles();
  };
};

// Helper function to format numbers with natural precision up to max 5 decimal places
const formatNumber = (num) => {
  // Convert to string with up to 5 decimal places
  const str = num.toString();
  // If it's an integer or has fewer than 5 decimal places, return as is
  if (!str.includes('.') || str.split('.')[1].length <= 5) {
    return str;
  }
  // Otherwise limit to 5 decimal places without trailing zeros
  return parseFloat(num.toFixed(5)).toString();
};

// Function to update the Bayes equation with current values
function updateBayesEquation(truePositives, totalPositives, probability, prevalence, sensitivity, specificity) {
  const equationElement = document.getElementById('equation-display');
  if (!equationElement) return;
  
  // Calculate values for the expanded equation
  const prevalenceDecimal = prevalence / 1000;
  const sensitivityDecimal = sensitivity / 100;
  const falsePositiveRate = (100 - specificity) / 100;
  const truePositiveNumerator = sensitivityDecimal * prevalenceDecimal;
  const falsePositiveDenominator = falsePositiveRate * (1 - prevalenceDecimal);
  const denominator = truePositiveNumerator + falsePositiveDenominator;
  
  // Format the equation with proper KaTeX delimiters and more detailed steps
  equationElement.innerHTML = `
    <p class="katex-block">
      $$
      \\begin{aligned}
      P(D \\mid +) &= \\frac{P(D \\cap +)}{P(+)} \\\\[3ex]
      &= \\frac{P(+ \\mid D) \\cdot P(D)}{P(+ \\mid D) \\cdot P(D) + P(+ \\mid \\neg D) \\cdot P(\\neg D)} \\\\[3ex]
      &= \\frac{${formatNumber(sensitivityDecimal)} \\cdot ${formatNumber(prevalenceDecimal)}}{${formatNumber(sensitivityDecimal)} \\cdot ${formatNumber(prevalenceDecimal)} + ${formatNumber(falsePositiveRate)} \\cdot ${formatNumber(1-prevalenceDecimal)}} \\\\[3ex]
      &= \\frac{${formatNumber(truePositiveNumerator)}}{${formatNumber(truePositiveNumerator)} + ${formatNumber(falsePositiveDenominator)}} \\\\[3ex]
      &= \\frac{${formatNumber(truePositiveNumerator)}}{${formatNumber(denominator)}} \\\\[3ex]
      &\\approx \\frac{${truePositives}}{${totalPositives}} \\\\[3ex]
      &= \\boxed{${formatNumber(probability)}\\%}
      \\end{aligned}
      $$
    </p>
  `;
  
  // Also update the second test equation
  updateSecondTestEquation(probability, sensitivity, specificity);
  
  // If the site has auto-rendering for KaTeX, trigger it
  if (typeof window.renderMathInElement === 'function') {
    try {
      window.renderMathInElement(equationElement);
    } catch (e) {
      console.error('Math rendering error:', e);
    }
  }
}

// Function to update the second test equation
function updateSecondTestEquation(firstTestProbability, sensitivity, specificity) {
  const equationElement = document.getElementById('second-test-equation-display');
  if (!equationElement) return;
  
  // Convert percentages to decimals
  const firstProbabilityDecimal = firstTestProbability / 100;
  const sensitivityDecimal = sensitivity / 100;
  const specificityDecimal = specificity / 100;
  
  // Calculate the probability of a positive second test
  // P(+2|+1) = P(+2|D)P(D|+1) + P(+2|¬D)P(¬D|+1)
  const pDGivenPlus1 = firstProbabilityDecimal;
  const pNotDGivenPlus1 = 1 - pDGivenPlus1;
  const pPlus2GivenD = sensitivityDecimal;
  const pPlus2GivenNotD = 1 - specificityDecimal;
  
  const pPlus2GivenPlus1 = (pPlus2GivenD * pDGivenPlus1) + (pPlus2GivenNotD * pNotDGivenPlus1);
  
  // Calculate the final probability using Bayes' theorem
  // P(D|+1,+2) = P(+2|D)⋅P(D|+1) / P(+2|+1)
  const numerator = pPlus2GivenD * pDGivenPlus1;
  const finalProbability = (numerator / pPlus2GivenPlus1) * 100;
  
  // Calculate approximate whole number fraction based on a population of 100
  // This creates a more intuitive representation similar to the first equation
  const population = 100;
  const secondTestPositives = Math.round(pPlus2GivenPlus1 * population);
  const truePositivesAfterTwoTests = Math.round(numerator * population);
  
  // Format the equation with proper KaTeX delimiters and detailed steps
  equationElement.innerHTML = `
    <p class="katex-block">
      $$
      \\begin{aligned}
      P(D \\mid +_1, +_2) &= \\frac{P(+_2 \\mid D) \\cdot P(D \\mid +_1)}{P(+_2 \\mid +_1)} \\\\[3ex]
      &= \\frac{P(+_2 \\mid D) \\cdot P(D \\mid +_1)}{P(+_2 \\mid D) \\cdot P(D \\mid +_1) + P(+_2 \\mid \\neg D) \\cdot P(\\neg D \\mid +_1)} \\\\[3ex]
      &= \\frac{${formatNumber(sensitivityDecimal)} \\cdot ${formatNumber(firstProbabilityDecimal)}}{${formatNumber(sensitivityDecimal)} \\cdot ${formatNumber(firstProbabilityDecimal)} + ${formatNumber(pPlus2GivenNotD)} \\cdot ${formatNumber(pNotDGivenPlus1)}} \\\\[3ex]
      &= \\frac{${formatNumber(numerator)}}{${formatNumber(pPlus2GivenPlus1)}} \\\\[3ex]
      &\\approx \\frac{${truePositivesAfterTwoTests}}{${secondTestPositives}} \\\\[3ex]
      &= \\boxed{${formatNumber(finalProbability)}\\%}
      \\end{aligned}
      $$
    </p>
  `;
  
  // If the site has auto-rendering for KaTeX, trigger it
  if (typeof window.renderMathInElement === 'function') {
    try {
      window.renderMathInElement(equationElement);
    } catch (e) {
      console.error('Math rendering error:', e);
    }
  }
}

// Function to update the legend math expressions
function updateLegendMath(prevalence, sensitivity, specificity) {
  // Only proceed if KaTeX is available
  if (!window.katex) return;
  
  try {
    // Define all math expressions
    const mathExpressions = {
      'tp-math-1': `P(D) = \\frac{${prevalence}}{1000}`,
      'tp-math-2': `P(+ \\mid D) = ${sensitivity}\\%`,
      'fn-math': `P(- \\mid D) = ${100 - sensitivity}\\%`,
      'fp-math-1': `P(+ \\mid \\neg D) = ${100 - specificity}\\%`,
      'tn-math': `P(- \\mid \\neg D) = ${specificity}\\%`
    };
    
    // Render all expressions
    Object.entries(mathExpressions).forEach(([elementId, expression]) => {
      const element = document.getElementById(elementId);
      if (element) {
        katex.render(expression, element, { throwOnError: false });
      }
    });
  } catch (e) {
    console.error('KaTeX rendering error:', e);
  }
}

// Add event listener to render KaTeX after the page loads
document.addEventListener('DOMContentLoaded', function() {
  // Initial render of the equation and legend math
  updateBayesEquation(9, 99, 9.09, 10, 90, 91);
  updateLegendMath(10, 90, 91);
  
  // Check if KaTeX is available
  if (!window.katex && typeof window.renderMathInElement === 'function') {
    // If direct KaTeX API is not available but auto-render is, use that
    window.renderMathInElement(document.getElementById('legend-container'));
    window.renderMathInElement(document.getElementById('second-test-equation-display'));
  }
});

new p5(sketch2, document.getElementById('sketch-container-2'));
</script>
{{< /rawhtml >}}
