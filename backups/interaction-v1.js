(function () {
  const canvas = document.getElementById("gameCanvas");
  let previousCell = null; // Track the last toggled cell
  let throttleTimeout = null; // For controlling the update rate

  // Add mousemove event listener to the window
  window.addEventListener("mousemove", handleMouseMove);
  // Add click event listener to the canvas
  canvas.addEventListener("click", handleCanvasClick);

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

  function handleCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const centerX = Math.floor(clickX / cellWidth);
    const centerY = Math.floor(clickY / unitHeight);

    console.log(`Canvas clicked at grid coordinates: (${centerX}, ${centerY})`);

    // Add a 20-cell diameter ring pattern at the clicked position
    addDenseRingPattern(centerX, centerY);
  }

  function addDenseRingPattern(centerX, centerY) {
    const denseRingPattern = [];

    const radius = 4;
    const density = 2; // Adjust density (smaller values = more points)

    for (let angle = 0; angle < 360; angle += density) {
      const radians = (angle * Math.PI) / 180;
      const dx = Math.round(radius * Math.cos(radians));
      const dy = Math.round(radius * Math.sin(radians));
      denseRingPattern.push([dx, dy]);
    }

    // Fill the grid with the pattern
    denseRingPattern.forEach(([dx, dy]) => {
      const gridX = centerX + dx;
      const gridY = centerY + dy;
      if (grid[gridY] && grid[gridY][gridX] !== undefined) {
        grid[gridY][gridX] = 1; // Set the cell to alive
      }
    });
  }
})();
