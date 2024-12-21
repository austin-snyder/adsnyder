(function () {
    const canvas = document.getElementById("gameCanvas");
    let previousCell = null; 
    let throttleTimeout = null;
  
    // If you really want the entire window to track mouse, keep this as "window.addEventListener"
    // but typically we'd do canvas.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousemove", handleMouseMove);
  
    canvas.addEventListener("click", handleCanvasClick);
  
    function handleMouseMove(event) {
      if (throttleTimeout) return;
  
      throttleTimeout = setTimeout(() => {
        const rect = canvas.getBoundingClientRect();
        const cursorX = event.clientX - rect.left;
        const cursorY = event.clientY - rect.top;
  
        // We assume these global variables are now set by bg-canvas-v4.js:
        //   window.grid
        //   window.cellWidth
        //   window.unitHeight
  
        // Make sure unitHeight is not zero
        if (cellWidth <= 0 || unitHeight <= 0) {
          console.warn("Cell dimension is zero. Possibly init() hasn't run yet?");
          throttleTimeout = null;
          return;
        }
  
        const gridX = Math.floor(cursorX / cellWidth);
        const gridY = Math.floor(cursorY / unitHeight);
  
        if (
          gridY >= 0 && gridY < grid.length &&
          gridX >= 0 && gridX < grid[0].length
        ) {
          const currentCell = `${gridX},${gridY}`;
          if (currentCell !== previousCell) {
            toggleCell(gridX, gridY);
            previousCell = currentCell;
          }
        } else {
          previousCell = null;
        }
  
        throttleTimeout = null;
      }, 100);
    }
  
    function toggleCell(x, y) {
      // Flip the cell state
      if (grid[y] && grid[y][x] !== undefined) {
        grid[y][x] = (grid[y][x] === 0) ? 1 : 0;
        // IMPORTANT: to see the fade effect immediately
        updateCells();
      }
    }
  
    function handleCanvasClick(event) {
      const rect = canvas.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;
  
      if (cellWidth <= 0 || unitHeight <= 0) {
        console.warn("Cell dimension is zero. Possibly init() hasn't run yet?");
        return;
      }
  
      const centerX = Math.floor(clickX / cellWidth);
      const centerY = Math.floor(clickY / unitHeight);
  
      console.log(`Canvas clicked at grid coordinates: (${centerX}, ${centerY})`);
      addDenseRingPattern(centerX, centerY);
  
      // Force fade update so newly alive cells fade in
      updateCells();
    }
  
    function addDenseRingPattern(centerX, centerY) {
      const denseRingPattern = [];
      const radius = 4;
      const density = 2; // angle step in degrees
  
      for (let angle = 0; angle < 360; angle += density) {
        const radians = (angle * Math.PI) / 180;
        const dx = Math.round(radius * Math.cos(radians));
        const dy = Math.round(radius * Math.sin(radians));
        denseRingPattern.push([dx, dy]);
      }
  
      // Make them alive
      denseRingPattern.forEach(([dx, dy]) => {
        const gx = centerX + dx;
        const gy = centerY + dy;
        if (grid[gy] && grid[gy][gx] !== undefined) {
          grid[gy][gx] = 1;
        }
      });
    }
  })();
  