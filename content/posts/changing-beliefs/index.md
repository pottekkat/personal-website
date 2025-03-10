---
title: The Idea of Changing Beliefs
slug: changing-beliefs
date: 2025-03-13T09:28:09+05:30
readingTime: 5
draft: false
toc:
    show: false
ShowRelatedContent: false
description: An interactive guide to learning one of the foundational theories in probability.
summary: An interactive quiz to teach the importance of evaluating actions by their consequences and not their intentions.
tags:
    - government
    - public policy
    - interactive
categories:
    - Public Policy
series: []
aliases: []
cover:
    image: /images/intentions-and-consequences/red-sandalwood-banner.jpg
    alt: Red Sandalwood Tree.
    caption: The virtue of a doer itself does not guarantee good outcomes - The Nitopadesha
    relative: true
fmContentType: Post (default)
---

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
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.min.js"></script>
{{< /rawhtml >}}

{{< rawhtml >}}
<!-- Create a container for this specific sketch -->
<div id="sketch-container-1" class="sketch-container"></div>

<script>
// This creates an instance mode sketch that won't conflict with other sketches
const sketch1 = (p) => {
  // Grid configuration
  const gridSize = { rows: 5, cols: 10 }; // 5×10 grid = 50 squares
  const squares = [];
  let squareSize, paddingX, paddingY, startY;
  
  // Helper function to get CSS variable color
  const getCSSColor = (varName) => {
    const color = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    
    if (color.startsWith('#')) {
      // Convert hex to RGB
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return [r, g, b];
    } else if (color.startsWith('rgb')) {
      // Extract RGB values
      return color.match(/\d+/g)?.slice(0, 3).map(Number) || color;
    }
    
    return color;
  };
  
  // Square class
  class Square {
    constructor(row, col) {
      this.row = row;
      this.col = col;
      this.x = 0;
      this.y = 0;
      this.hovered = false;
      this.primaryColor = getCSSColor('--primary');
      this.secondaryColor = getCSSColor('--secondary');
    }
    
    update(mouseX, mouseY) {
      // Position
      this.x = paddingX + (this.col * (squareSize + paddingX));
      this.y = startY + (this.row * (squareSize + paddingY));
      
      // Hover detection - immediate change, no animation
      this.hovered = 
        mouseX > this.x && 
        mouseX < this.x + squareSize && 
        mouseY > this.y && 
        mouseY < this.y + squareSize;
    }
    
    draw() {
      // Draw square with sharp edges
      if (Array.isArray(this.primaryColor) && Array.isArray(this.secondaryColor)) {
        const color = this.hovered ? this.secondaryColor : this.primaryColor;
        p.fill(color[0], color[1], color[2]);
      } else {
        p.fill(this.hovered ? this.secondaryColor : this.primaryColor);
      }
      
      p.noStroke(); // No border
      p.rect(this.x, this.y, squareSize, squareSize); // Sharp corners (no radius)
    }
  }
  
  // Calculate layout dimensions
  const calculateLayout = () => {
    const container = document.getElementById('sketch-container-1');
    const containerWidth = container.offsetWidth - 28; // Account for padding
    const containerHeight = containerWidth * 0.6;
    
    // Resize canvas if it exists
    if (p.width > 0) {
      p.resizeCanvas(containerWidth, containerHeight);
    }
    
    // Calculate square size for even distribution
    const gapRatio = 0.2; // Gap is 20% of square size
    const maxSquareWidth = containerWidth / (gridSize.cols + ((gridSize.cols - 1) * gapRatio));
    const maxSquareHeight = containerHeight / (gridSize.rows + ((gridSize.rows - 1) * gapRatio));
    squareSize = Math.min(maxSquareWidth, maxSquareHeight);
    
    // Calculate padding
    paddingX = (containerWidth - (squareSize * gridSize.cols)) / (gridSize.cols + 1);
    paddingY = squareSize * gapRatio;
    
    // Center grid vertically
    const totalGridHeight = (squareSize * gridSize.rows) + (paddingY * (gridSize.rows - 1));
    startY = (containerHeight - totalGridHeight) / 2;
    
    return { width: containerWidth, height: containerHeight };
  };
  
  p.setup = function() {
    // Calculate dimensions
    const dimensions = calculateLayout();
    
    // Create canvas and properly append it to the container
    const canvas = p.createCanvas(dimensions.width, dimensions.height);
    
    // Fix for the appendChild error - use parent() instead of style()
    canvas.parent('sketch-container-1');
    
    // Create squares
    squares.length = 0; // Clear any existing squares
    for (let row = 0; row < gridSize.rows; row++) {
      for (let col = 0; col < gridSize.cols; col++) {
        squares.push(new Square(row, col));
      }
    }
  };

  p.draw = function() {
    p.clear(); // Transparent background
    
    // Update and draw squares
    squares.forEach(square => {
      square.update(p.mouseX, p.mouseY);
      square.draw();
    });
  };

  // Handle window resize
  p.windowResized = calculateLayout;
};

// Create the sketch in the specific container
new p5(sketch1, document.getElementById('sketch-container-1'));
</script>
{{< /rawhtml >}}

This is the conclusion.
