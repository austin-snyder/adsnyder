const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let cols = 40; 
const animationDelay = 100; 
const aliveSize = 0.5;
const decaySize = 0.5;
const deadSize = 0.5;
let cellWidth, unitHeight, grid = [], rowCount;

const paletteSwitcher = document.querySelector('.palette-switcher');

const palettes = {
  yellow: ["#FF9506", "#F95808", "#FFEFE1", "#FFC00D"],
  blue: ["#4C9DF9", "#A2AAFF", "#D4E2FF"],
  purple: ["#A150E7", "#FD82F7", "#FADAFF"],
};

let colorPalette = palettes.yellow; // Default

// Optional palette switching
paletteSwitcher?.addEventListener("click", (event) => {
  const paletteKey = event.target.dataset.palette;
  if (paletteKey && palettes[paletteKey]) {
    colorPalette = palettes[paletteKey];
  }
});

// If you have a hover/mousemove logic, you'd do something like:
/*
canvas.addEventListener('mousemove', (event) => {
  // getBoundingClientRect to find correct offset
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  // Convert to cell coords
  const gridX = Math.floor(mouseX / cellWidth);
  const gridY = Math.floor(mouseY / unitHeight);

  // Validate within grid
  if (gridY >= 0 && gridY < grid.length && gridX >= 0 && gridX < grid[0].length) {
    // Do something with the hovered cell
    console.log(`Hovering cell ${gridX}, ${gridY}`);
  }
});
*/

function init() {
  // Decide how many columns based on width
  if (window.innerWidth < 768) {
    cols = 6;
  } else if (window.innerWidth < 1200) {
    cols = 12;
  } else {
    cols = 40;
  }

  // We want the canvas to fill the full window width and ~60% height:
  const desiredWidth = window.innerWidth;
  const desiredHeight = Math.floor(window.innerHeight * 0.6);

  // Set the canvas DOM size to match EXACTLY
  canvas.width = desiredWidth;
  canvas.height = desiredHeight;

  // Now each cell's width is total width / number of columns
  cellWidth = canvas.width / cols;
  unitHeight = cellWidth; // squares

  // Number of rows that fit exactly in the chosen height
  rowCount = Math.floor(canvas.height / unitHeight);

  // Generate initial random grid
  grid = Array.from({ length: rowCount }, () =>
    Array.from({ length: cols }, () => Math.random() > 0.5 ? 1 : 0)
  );
}

function updateGameOfLife() {
  const nextGrid = grid.map((row, y) =>
    row.map((cell, x) => {
      const neighbors = countNeighbors(x, y);
      if (cell === 1) {
        // Alive cell: Dies if neighbors < 2 or > 2
        return (neighbors < 2 || neighbors > 2) ? 2 : 1;
      }
      if (cell === 2) {
        // Decay cell -> becomes 0 next step
        return 0;
      }
      // Dead cell: becomes alive if exactly 3 neighbors
      return neighbors === 3 ? 1 : 0;
    })
  );
  grid = nextGrid;
}

function countNeighbors(x, y) {
  let sum = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const row = (y + i + rowCount) % rowCount;
      const col = (x + j + cols) % cols;
      sum += grid[row][col];
    }
  }
  return sum - grid[y][x];
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Decide colors from palette
  const aliveColor = colorPalette[0];
  const decayColor = colorPalette[1];
  const deadColor = colorPalette[2];

  // Draw cells
  grid.forEach((row, y) => {
    row.forEach((cell, x) => {
      const centerX = x * cellWidth + cellWidth / 2;
      const centerY = y * unitHeight + unitHeight / 2;

      let radius, opacity, fillColor;

      if (cell === 1) { 
        radius = cellWidth * aliveSize;
        opacity = 1;
        fillColor = aliveColor;
      } else if (cell === 2) {
        radius = cellWidth * decaySize;
        opacity = 0.3;
        fillColor = decayColor;
      } else {
        radius = cellWidth * deadSize;
        opacity = 0;       // 0 = invisible
        fillColor = deadColor;
      }

      ctx.globalAlpha = opacity;
      ctx.beginPath();
      ctx.fillStyle = fillColor;
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
    });
  });

  ctx.globalAlpha = 1; 
}

function animate() {
  draw();
  requestAnimationFrame(animate);
}

// Regularly update Game of Life logic
setInterval(updateGameOfLife, animationDelay);

// On resize, re-init
window.addEventListener("resize", () => {
  init();
  draw(); // Immediately redraw to see the effect
});

// Initial call
init();
animate();