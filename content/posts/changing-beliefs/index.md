---
title: The Idea of Changing Beliefs
slug: changing-beliefs
date: 2025-03-13T09:28:09+05:30
readingTime: 5
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

While this question is phrased awkwardly and has some missing data, the reason why people make guesses closer to 95% instead of 2% is because of the counterintuitive nature of probability. After all, if the test only has a 5% false positive rate, i.e., incorrectly predicting a person has the disease while they don't, it *feels* reasonable to guess that 95% of the time, the test would correctly guess the person has the disease.

But even if we assume the test could correctly predict a person has the disease when they actually have the disease with complete certainty, i.e., a 100% true positive rate, the answer is still 2%. Let's break down the mathematics to see why.

Here's what we know:

$$
\text{Prevalence of the disease: } P(D) = \frac{1}{1000}
$$

$$
\text{False positive rate: } P(+ \mid \neg D) = 5\\% = \frac{5}{100}
$$

> **Note**: $P(D)$ is the probability of having the disease before knowing the test result.

What we need to find is the probability that a person actually has the disease given that they tested positive, i.e., $P(D \mid +)$.

If we consider a sample of 1000 people and assume the test is perfectly accurate when detecting the disease, i.e., a 100% true positive rate ($P(+ \mid D)$), this is what the test results would look like:

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
</style>

<!-- Load p5.js libraries once per page -->
<script src="https://cdn.jsdelivr.net/npm/p5@1.11.3/lib/p5.min.js"></script>
{{< /rawhtml >}}

{{< rawhtml >}}
<!-- Create a container for this specific sketch -->
<div id="sketch-container-1" class="sketch-container"></div>

<script>
/**
 * Interactive Grid of Squares
 * 
 * This sketch creates a responsive grid of squares that change color on hover.
 * It uses p5.js in "instance mode" to avoid conflicts with other scripts.
 * 
 * The code is structured in these main parts:
 * 1. Square class - Manages individual squares in the grid
 * 2. Layout calculation - Handles responsive sizing and positioning
 * 3. p5.js lifecycle methods (setup, draw) - Initialize and render the sketch
 * 4. Event handling - Responds to window resize and mouse interaction
 */
const sketch1 = (p) => {
  // Configuration for our grid
  const gridSize = { rows: 10, cols: 10 }; // Creates 50 squares (5×10)
  const squares = []; // Will hold all our square objects
  
  // Variables for layout calculations
  let squareSize;   // Size of each square
  let paddingX;     // Horizontal space between squares
  let paddingY;     // Vertical space between squares
  let startY;       // Starting Y position to center grid vertically
  
  // Colors from CSS variables (cached on setup)
  let primaryColor, secondaryColor;
  
  /**
   * Square class - Represents a single square in the grid
   * Each square knows its position and can detect mouse hover
   */
  class Square {
    constructor(row, col) {
      this.row = row;
      this.col = col;
      this.x = 0;      // Will be calculated in update()
      this.y = 0;      // Will be calculated in update()
      this.hovered = false;
    }
    
    // Update square position and check for mouse hover
    update(mouseX, mouseY) {
      // Calculate position based on grid layout
      this.x = paddingX + (this.col * (squareSize + paddingX));
      this.y = startY + (this.row * (squareSize + paddingY));
      
      // Check if mouse is over this square
      this.hovered = 
        mouseX > this.x && 
        mouseX < this.x + squareSize && 
        mouseY > this.y && 
        mouseY < this.y + squareSize;
    }
    
    // Draw the square with appropriate color
    draw() {
      // Use hover color or default color
      p.fill(this.hovered ? secondaryColor : primaryColor);
      p.noStroke(); // No border for clean look
      p.rect(this.x, this.y, squareSize, squareSize); // Draw square
    }
  }
  
  /**
   * Calculate layout dimensions based on container size
   * This ensures the grid is responsive and properly centered
   */
  const calculateLayout = () => {
    // Get container dimensions
    const container = document.getElementById('sketch-container-1');
    const containerWidth = container.offsetWidth - 28; // Account for padding
    
    // Define a consistent padding that will be used throughout the grid
    // Use a responsive padding that scales with container size but has minimum and maximum values
    const minPadding = 4; // Minimum padding in pixels
    const maxPadding = 20; // Maximum padding in pixels
    const paddingRatio = 0.02; // 2% of container width
    const padding = Math.min(Math.max(containerWidth * paddingRatio, minPadding), maxPadding);
    
    // Calculate the available space for squares after accounting for all padding
    const availableWidth = containerWidth - (padding * (gridSize.cols + 1));
    const squareWidth = availableWidth / gridSize.cols;
    
    // Calculate the total height needed for the grid with consistent padding
    const totalHeight = (squareWidth * gridSize.rows) + (padding * (gridSize.rows + 1));
    const containerHeight = totalHeight;
    
    // Resize canvas if it already exists
    if (p.width > 0) {
      p.resizeCanvas(containerWidth, containerHeight);
    }
    
    // Set square size and padding values
    squareSize = squareWidth;
    paddingX = padding;
    paddingY = padding;
    startY = padding; // Start from the top with consistent padding
    
    return { width: containerWidth, height: containerHeight };
  };
  
  /**
   * p5.js setup function - runs once at the beginning
   * Initializes the canvas and creates all square objects
   */
  p.setup = function() {
    // Get CSS variables for colors
    const root = getComputedStyle(document.documentElement);
    primaryColor = root.getPropertyValue('--primary').trim();
    secondaryColor = root.getPropertyValue('--secondary').trim();
    
    // Calculate dimensions and create canvas
    const dimensions = calculateLayout();
    p.createCanvas(dimensions.width, dimensions.height);
    
    // Create all squares in the grid
    squares.length = 0; // Clear any existing squares
    for (let row = 0; row < gridSize.rows; row++) {
      for (let col = 0; col < gridSize.cols; col++) {
        squares.push(new Square(row, col));
      }
    }
  };

  /**
   * p5.js draw function - runs continuously in a loop
   * Updates and renders all squares
   */
  p.draw = function() {
    p.clear(); // Transparent background
    
    // Update and draw each square
    squares.forEach(square => {
      square.update(p.mouseX, p.mouseY);
      square.draw();
    });
  };

  // Handle window resize events
  p.windowResized = function() {
    const dimensions = calculateLayout();
    p.resizeCanvas(dimensions.width, dimensions.height);
  };
};

// Create the sketch in the container
new p5(sketch1, document.getElementById('sketch-container-1'));
</script>
{{< /rawhtml >}}

This is the conclusion.
