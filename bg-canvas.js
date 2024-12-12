const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const cols = 24; // Fixed 12-column layout
const minRegionSize = 2;
const maxRegionSize = 6;
const animationDelay = 200;
const fadeSpeed = 0.02;

const paletteSwitcher = document.querySelector('.palette-switcher');

// Define the palettes
const palettes = {
  yellow: ["#F6B845", "#F9B588", "#ffffff"],
  blue: ["#4C9DF9", "#A2AAFF", "#D4E2FF"],
  purple: ["#A150E7", "#FD82F7", "#FADAFF"],
};


let colorPalette = palettes.yellow; // Default palette
let unitHeight, cellWidth, grid = [], regions = [], rowCount;

// Event listener for palette switching
paletteSwitcher.addEventListener("click", (event) => {
  const paletteKey = event.target.dataset.palette;
  if (paletteKey && palettes[paletteKey]) {
    colorPalette = palettes[paletteKey];
    updateRegionsColors();
  }
});

// Update regions' colors dynamically
function updateRegionsColors() {
  regions = []; // Clear the regions array
  generateRegions(); // Generate a new set of regions
  updateRegions(); // Recalculate target opacity
  draw(); // Redraw the canvas immediately
}

// Update getRandomColor to use the current colorPalette
function getRandomColor() {
  return colorPalette[Math.floor(Math.random() * colorPalette.length)];
}

// Initialize the canvas and start the animation
function init() {
  canvas.width = window.innerWidth; // Full width
  canvas.height = window.innerHeight; // Full viewport height

  cellWidth = canvas.width / cols; // Square width
  unitHeight = cellWidth; // Match height to maintain squares
  rowCount = Math.ceil(canvas.height / unitHeight);

  grid = generateInitialGrid(rowCount);
  regions = [];
  generateRegions();
  animate();
}

// Generate the initial grid for the Game of Life
function generateInitialGrid(rows) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => Math.random() > 0.5 ? 1 : 0)
  );
}

// Generate regions based on the grid
function generateRegions() {
  const occupied = Array.from({ length: rowCount }, () => Array(cols).fill(false));

  for (let y = 0; y < rowCount; y++) {
    for (let x = 0; x < cols;) {
      if (!occupied[y][x]) {
        const maxWidth = getMaxWidth(occupied, x, y);
        const maxHeight = getMaxHeight(occupied, x, y);

        if (maxWidth >= minRegionSize && maxHeight >= minRegionSize) {
          const size = getRandomEvenSize(minRegionSize, Math.min(maxRegionSize, Math.min(maxWidth, maxHeight)));
          markOccupied(occupied, x, y, size, size);

          const startX = x * cellWidth;
          const startY = y * unitHeight;
          const width = size * cellWidth;
          const height = size * unitHeight;

          // Generate a gradient ONCE for this region
          const gradient = createRandomGradient(startX, startY, width, height);

          regions.push({
            x: startX,
            y: startY,
            width: width,
            height: height,
            gridX: x,
            gridY: y,
            gridWidth: size,
            gridHeight: size,
            opacity: 0,
            targetOpacity: 0,
            gradient: gradient // Store the gradient
          });

          x += size;
        } else {
          markOccupied(occupied, x, y, 1, 1);
          x++;
        }
      } else {
        x++;
      }
    }
  }
}



// Function to create a random gradient for a region
function createRandomGradient(x, y, width, height) {
  const gradientDirections = [
    [x, y, x + width, y + height],       // Top-left to bottom-right
    [x + width, y, x, y + height],       // Top-right to bottom-left
    [x, y + height, x + width, y],       // Bottom-left to top-right
    [x + width, y + height, x, y],       // Bottom-right to top-left
  ];

  // Randomly select one direction
  const [x0, y0, x1, y1] = gradientDirections[Math.floor(Math.random() * gradientDirections.length)];

  // Create gradient with the random direction
  const gradient = ctx.createLinearGradient(x0, y0, x1, y1);

  // Random color from the palette and white
  const color1 = colorPalette[Math.floor(Math.random() * colorPalette.length)];
  const color2 = colorPalette[Math.floor(Math.random() * colorPalette.length)];

  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);

  return gradient;
}






// Get the maximum width available for a region
function getMaxWidth(occupied, startX, y) {
  let width = 0;
  while (startX + width < cols && !occupied[y][startX + width]) width++;
  return width;
}

// Get the maximum height available for a region
function getMaxHeight(occupied, x, startY) {
  let height = 0;
  while (startY + height < rowCount && !occupied[startY + height][x]) height++;
  return height;
}

// Get a random even size between min and max
function getRandomEvenSize(min, max) {
  const size = Math.floor(Math.random() * ((max - min) / 2 + 1)) * 2 + min; // Even size ≥ min
  return size;
}

// Mark a region as occupied in the grid
function markOccupied(occupied, x, y, width, height) {
  for (let i = y; i < y + height && i < occupied.length; i++) {
    for (let j = x; j < x + width && j < occupied[i].length; j++) {
      occupied[i][j] = true; // Only mark within bounds
    }
  }
}

// Update the Game of Life grid
function updateGameOfLife() {
  const nextGrid = grid.map((row, y) =>
    row.map((cell, x) => {
      const neighbors = countNeighbors(x, y);

      if (cell === 1) {
        // Alive cell: Transition to decay if dying conditions are met
        return (neighbors < 2 || neighbors > 3) ? 2 : 1;
      }
      if (cell === 2) {
        // Decay cell: Dies after one step
        return 0;
      }
      // Dead cell: Becomes alive if exactly 3 neighbors
      return neighbors === 3 ? 1 : 0;
    })
  );
  grid = nextGrid;
}

// Count the neighbors of a cell in the Game of Life grid
function countNeighbors(x, y) {
  let sum = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const row = (y + i + grid.length) % grid.length;
      const col = (x + j + cols) % cols;
      sum += grid[row][col];
    }
  }
  return sum - grid[y][x];
}

// Update the opacity of regions based on the Game of Life grid
function updateRegions() {
  regions.forEach(region => {
    let aliveCount = 0;
    for (let y = region.gridY; y < region.gridY + region.gridHeight; y++) {
      for (let x = region.gridX; x < region.gridX + region.gridWidth; x++) {
        if (grid[y] && grid[y][x]) aliveCount++;
      }
    }

    const totalCells = region.gridWidth * region.gridHeight;
    region.targetOpacity = Math.min(1, (aliveCount / totalCells) * 0.8);
  });
}

// Draw the regions and cells on the canvas
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw regions with gradient fill and opacity
  regions.forEach(region => {
    ctx.globalAlpha = region.opacity; // Opacity control
    ctx.fillStyle = region.gradient; // Use gradient for fill
    ctx.fillRect(region.x, region.y, region.width, region.height);
  });

  // Draw alive cells as circles
  const circleColor = colorPalette[colorPalette.length - 2]; // Penultimate color in palette
  grid.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === 1 || cell === 2) {
        const centerX = x * cellWidth + cellWidth / 2;
        const centerY = y * unitHeight + unitHeight / 2;
        const radius = Math.min(cellWidth, unitHeight) * 0.05;

        ctx.beginPath();
        ctx.fillStyle = cell === 1 ? circleColor : "rgba(0, 0, 0, 0.2)";
        ctx.globalAlpha = 0.7; // Slight transparency
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  });

  ctx.globalAlpha = 1; // Reset global alpha
}


// Animate the regions and cells
function animate() {
  regions.forEach(region => {
    region.opacity += (region.targetOpacity - region.opacity) * fadeSpeed;
  });
  draw();
  requestAnimationFrame(animate);
}

// Update the Game of Life and regions at regular intervals
setInterval(() => {
  updateGameOfLife();
  updateRegions();
}, animationDelay);

// Reinitialize the canvas on window resize
window.addEventListener("resize", init);
init();