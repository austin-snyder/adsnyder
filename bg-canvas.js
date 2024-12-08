const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    const cols = 12; // Fixed 12-column layout
    const minRegionSize = 2;
    const maxRegionSize = 8;
    const animationDelay = 300; 
    const fadeSpeed = 0.03;

    const paletteSwitcher = document.querySelector('.palette-switcher');

    // Define the palettes
    const palettes = {
      yellow: ["#F6B845", "#F9B588", "#FFEFE1"],
      blue: ["#4C9DF9", "#A2AAFF", "#D4E2FF"],
      purple: ["#A150E7", "#FD82F7", "#FADAFF"]
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
  
  


    function generateInitialGrid(rows) {
      return Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => Math.random() > 0.5 ? 1 : 0)
      );
    }

    function generateRegions() {
        const occupied = Array.from({ length: rowCount }, () => Array(cols).fill(false));
      
        for (let y = 0; y < rowCount; y++) {
          for (let x = 0; x < cols; ) {
            if (!occupied[y][x]) {
              // Calculate available space
              const maxWidth = getMaxWidth(occupied, x, y);
              const maxHeight = getMaxHeight(occupied, x, y);
      
              // Ensure the available space meets minimum size
              if (maxWidth >= minRegionSize && maxHeight >= minRegionSize) {
                // Choose a random width and height, constrained by minRegionSize and available space
                const width = getRandomEvenSize(minRegionSize, Math.min(maxRegionSize, maxWidth));
                const height = getRandomEvenSize(minRegionSize, Math.min(maxRegionSize, maxHeight));
      
                markOccupied(occupied, x, y, width, height);
      
                regions.push({
                  x: x * cellWidth,
                  y: y * unitHeight,
                  width: width * cellWidth,
                  height: height * unitHeight,
                  gridX: x,
                  gridY: y,
                  gridWidth: width,
                  gridHeight: height,
                  opacity: 0,
                  targetOpacity: 0,
                  color: getRandomColor(),
                });
      
                x += width; // Move right by the placed region's width
              } else {
                // If space is too small, mark it as unusable and move on
                markOccupied(occupied, x, y, 1, 1);
                x++;
              }
            } else {
              x++; // Move to the next column if space is already occupied
            }
          }
        }
      }
      
      function getMaxWidth(occupied, startX, y) {
        let width = 0;
        while (startX + width < cols && !occupied[y][startX + width]) width++;
        return width;
      }
      
      function getMaxHeight(occupied, x, startY) {
        let height = 0;
        while (startY + height < rowCount && !occupied[startY + height][x]) height++;
        return height;
      }
      
      function getRandomEvenSize(min, max) {
        const size = Math.floor(Math.random() * ((max - min) / 2 + 1)) * 2 + min; // Even size ≥ min
        return size;
      }
      
      function markOccupied(occupied, x, y, width, height) {
        for (let i = y; i < y + height && i < occupied.length; i++) {
          for (let j = x; j < x + width && j < occupied[i].length; j++) {
            occupied[i][j] = true; // Only mark within bounds
          }
        }
      }
      
      
      

    function getRandomColor() {
      return colorPalette[Math.floor(Math.random() * colorPalette.length)];
    }

    function updateGameOfLife() {
      const nextGrid = grid.map((row, y) =>
        row.map((cell, x) => {
          const neighbors = countNeighbors(x, y);
          if (cell === 1 && (neighbors < 2 || neighbors > 3)) return 0;
          if (cell === 0 && neighbors === 3) return 1;
          return cell;
        })
      );
      grid = nextGrid;
    }

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

    function updateRegions() {
      regions.forEach(region => {
        let aliveCount = 0;
        for (let y = region.gridY; y < region.gridY + region.gridHeight; y++) {
          for (let x = region.gridX; x < region.gridX + region.gridWidth; x++) {
            if (grid[y] && grid[y][x]) aliveCount++;
          }
        }

        const totalCells = region.gridWidth * region.gridHeight;
        region.targetOpacity = Math.min(1, (aliveCount / totalCells) * 1);
      });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      
        // Draw regions with fill color and opacity
        regions.forEach(region => {
          ctx.fillStyle = region.color;
          ctx.globalAlpha = region.opacity;
          ctx.fillRect(region.x, region.y, region.width, region.height);
        });
      
     
      
        // Alive cells as circles
        const circleColor = colorPalette[colorPalette.length - 2]; // Penultimate color in palette
        grid.forEach((row, y) => {
          row.forEach((cell, x) => {
            if (cell === 1) {
              const centerX = x * cellWidth + cellWidth / 2;
              const centerY = y * unitHeight + unitHeight / 2;
              const radius = Math.min(cellWidth, unitHeight) * 0.05;
      
              ctx.beginPath();
              ctx.fillStyle = circleColor;
              ctx.globalAlpha = 0.8;
              ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
              ctx.fill();
            }
          });
        });
      
        ctx.globalAlpha = 1; // Reset global alpha to default
      }
      


    function animate() {
      regions.forEach(region => {
        region.opacity += (region.targetOpacity - region.opacity) * fadeSpeed;
      });
      draw();
      requestAnimationFrame(animate);
    }

    setInterval(() => {
      updateGameOfLife();
      updateRegions();
    }, animationDelay);

    window.addEventListener("resize", init);
    init();