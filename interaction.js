(function () {
    const canvas = document.getElementById("gameCanvas");
    let previousCell = null; // Track the last toggled cell
    let throttleTimeout = null; // For controlling the update rate
  
    // Add mousemove event listener to the window
    window.addEventListener("mousemove", handleMouseMove);
  
    function handleMouseMove(event) {
      if (throttleTimeout) return; // Exit if a timeout is already running
  
      throttleTimeout = setTimeout(() => {
        const rect = canvas.getBoundingClientRect();
        const cursorX = event.clientX - rect.left;
        const cursorY = event.clientY - rect.top;
  
        // Map the cursor position to grid coordinates
        const gridX = Math.floor(cursorX / cellWidth);
        const gridY = Math.floor(cursorY / unitHeight);
  
        // Check if coordinates are within grid boundaries
        if (gridY >= 0 && gridY < grid.length && gridX >= 0 && gridX < grid[0].length) {
          const currentCell = `${gridX},${gridY}`; // Unique ID for the current cell
  
          if (currentCell !== previousCell) {
            toggleCell(gridX, gridY); // Toggle the cell state
            previousCell = currentCell; // Update the last toggled cell
          }
        } else {
          previousCell = null; // Reset if the cursor moves out of bounds
        }
  
        throttleTimeout = null; // Reset the timeout
      }, 100); // Throttle interval set to 100ms
    }
  
    function toggleCell(x, y) {
      if (grid[y] && grid[y][x] !== undefined) {
        grid[y][x] = grid[y][x] === 0 ? 1 : 0; // Toggle cell state
      }
    }
  })();
  