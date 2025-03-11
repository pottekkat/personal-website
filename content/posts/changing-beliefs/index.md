---
title: The Idea of Changing Beliefs
slug: changing-beliefs
date: 2025-03-13T09:28:09+05:30
readingTime: 5
draft: true
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

Every once in a while some variation of the following question shows up on social media, sparking a debate between confused normal people until someone shows up in the comments with the idea of changing beliefs, more popularly known as the Bayes Theorem.

This time, this was along another debate around the activities or the competency of the United States Department of Health and Human Services, The HHS.

This is the introduction.

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
