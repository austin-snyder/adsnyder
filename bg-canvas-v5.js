/** PALETTES **/
const palettes = {
    yellow: ["#FFEFE1", "#FFC00D", "#FF9506", "#F95808"],
    blue: ["#D4E2FF", "#A2AAFF", "#4C9DF9", "#4CE0F5"],
    purple: ["#FADAFF", "#FD82F7", "#D77CEE", "#CB2C85"],
  };
  
  /** DOM Elements **/
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const paletteSwitcher = document.querySelector(".palette-switcher");
  
  /** Game-of-Life + Gradient Parameters **/
  let colorPalette = palettes.blue; // default
  let fadeSpeed = 0.05;
  let animationDelay = 150;
  let cols = 24;
  let rowCount = 12;
  let cellWidth, cellHeight;
  let grid = [];     // The 2D array that stores the "state" (0,1,2)
  let cells = [];    // A parallel 2D array that stores the gradient & opacity
  let radius = 0.0;  // Circle radius (will set based on cell size)
  
  /** Switch Palettes */
  paletteSwitcher?.addEventListener("click", (event) => {
    const paletteKey = event.target.dataset.palette;
    if (paletteKey && palettes[paletteKey]) {
      colorPalette = palettes[paletteKey];
      // update CSS variables with palette
      document.documentElement.style.setProperty('--color-palette-light', colorPalette[0]);
      document.documentElement.style.setProperty('--color-palette-full', colorPalette[2]);
      // Re-generate gradients for each cell
      generateCellGradients();
      // Force a draw
      draw();
    }
  });
  
  /** Initialize Canvas + Game of Life */
  function init() {
    // Adjust columns & rowCount based on width
    if (window.innerWidth < 768) {
      cols = 12; 
      rowCount = 12;
    } else if (window.innerWidth < 1200) {
      cols = 24; 
      rowCount = 12;
    } else {
      cols = 40;
      rowCount = 16;
    }
  
    canvas.width = window.innerWidth;
    // We fix the height to rowCount squares
    cellWidth = canvas.width / cols;
    cellHeight = cellWidth; // squares
    canvas.height = cellHeight * rowCount;
  
    // Initialize the grid states
    grid = Array.from({ length: rowCount }, () =>
      Array.from({ length: cols }, () => (Math.random() > 0.5 ? 1 : 0))
    );
    
    // Initialize the "cells" structure, storing gradient & opacity
    cells = Array.from({ length: rowCount }, () =>
      Array.from({ length: cols }, () => ({
        gradient: null,
        opacity: 0,
        targetOpacity: 0,
      }))
    );
  
    // Generate a gradient for each cell
    generateCellGradients();
  
    // Pre-calc circle radius
    radius = cellWidth / 2;
  }
  
  /** Generate random gradient for each cell */
  function generateCellGradients() {
    for (let y = 0; y < rowCount; y++) {
      for (let x = 0; x < cols; x++) {
        // cell bounding box in canvas coords
        const x0 = x * cellWidth;
        const y0 = y * cellHeight;
        const grad = createRandomGradient(x0, y0, cellWidth, cellHeight);
        cells[y][x].gradient = grad;
      }
    }
  }
  
  /** Create a random linear gradient using the current palette */
  function createRandomGradient(x, y, w, h) {
    const gradientDirections = [
      [x, y, x+w, y+h],
      [x+w, y, x, y+h],
      [x, y+h, x+w, y],
      [x+w, y+h, x, y]
    ];
    const [x0, y0, x1, y1] = gradientDirections[Math.floor(Math.random() * gradientDirections.length)];
    const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
  
    const color1 = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    const color2 = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
  
    return gradient;
  }

  /** Count Alive Cells */
  function countAlive() {
    let aliveCount = 0;
    for (let row of grid) {
      for (let cell of row) {
        if (cell === 1) aliveCount++;
      }
    }
    return aliveCount;
  }
  
  /** Update the game of life logic */
  function updateGameOfLife() {
    
    const nextGrid = grid.map((row, y) =>
      row.map((cell, x) => {
        const neighbors = countNeighbors(x, y);
        if (cell === 1) {
          // alive cell => becomes decay (2) if neighbors <2 or >2
          return (neighbors < 2 || neighbors > 2) ? 2 : 1;          
        }
        if (cell === 2) {
          // decay => becomes 0
          return 0;
        }
        // dead => become alive if exactly 3 neighbors
        return neighbors === 3 ? 1 : 0;
      })
    );
    grid = nextGrid;
  }
  
  /** Count neighbors with wrap-around */
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
  
  /** Update targetOpacity for each cell based on whether it's alive */
  function updateCells() {
    for (let y = 0; y < rowCount; y++) {
      for (let x = 0; x < cols; x++) {
        const isAlive = (grid[y][x] === 1 || grid[y][x] === 2);
        cells[y][x].targetOpacity = isAlive ? 1 : 0;
      }
    }
  }
  
  /** Drawing: each cell is a circle with its gradient and fade-based opacity */
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    // Apply fade
    for (let y = 0; y < rowCount; y++) {
      for (let x = 0; x < cols; x++) {
        let c = cells[y][x];
        // approach target
        c.opacity += (c.targetOpacity - c.opacity) * fadeSpeed;
        if (c.opacity < 0.001) c.opacity = 0; // clamp
  
        // Only draw if there's some opacity
        if (c.opacity > 0) {
          // compute center
          const centerX = x * cellWidth + cellWidth/2;
          const centerY = y * cellHeight + cellHeight/2;
          ctx.save();
          ctx.globalAlpha = c.opacity;
          ctx.fillStyle = c.gradient;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI*2);
          ctx.fill();
          ctx.restore();
        }
      }
    }
  }
  
  /** Continuous animation for the fade/draw */
  function animate() {
    draw();
    requestAnimationFrame(animate);
  }
  
  /** Periodic game-of-life logic updates */
  // This interval determines how often the game updates
  setInterval(() => {
    updateGameOfLife();
    updateCells(); 
  }, animationDelay);
  
  /** Handle resizing */
  window.addEventListener('resize', () => {
    init();
    // Immediately update nextCells so we see changes
    updateCells();
  });
  
  /** Initialize + Start */
  init();
  updateCells();
  animate();


  // Make these global so interaction-v2.js can see them
window.grid = grid;
window.cellWidth = cellWidth;
window.unitHeight = cellHeight;  // The interaction script calls it unitHeight
window.updateCells = updateCells; // So we can call updateCells() from interaction script if needed
