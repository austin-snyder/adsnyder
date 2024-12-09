(function () {
    const canvas = document.getElementById("gameCanvas");
    let patternIndex = 0; // Tracks the spawn pattern index
    const spawnPatterns = [gliderPattern, smallExploderPattern, plusPattern];
  
    // Add click event listener
    canvas.addEventListener("click", handleCanvasClick);
  
    function handleCanvasClick(event) {
      const rect = canvas.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;
  
      // Map the click position to grid coordinates
      const gridX = Math.floor(clickX / cellWidth);
      const gridY = Math.floor(clickY / unitHeight);
  
      // Check if click is inside grid boundaries
      if (gridY >= 0 && gridY < grid.length && gridX >= 0 && gridX < grid[0].length) {
        spawnPatterns[patternIndex](gridX, gridY); // Use the current spawn pattern
        patternIndex = (patternIndex + 1) % spawnPatterns.length; // Cycle through patterns
      }
    }
  
    // Place a pattern into the grid
    function placePattern(x, y, offsets) {
      offsets.forEach(([dx, dy]) => {
        const newX = x + dx;
        const newY = y + dy;
        if (grid[newY] && grid[newY][newX] !== undefined) {
          grid[newY][newX] = 1; // Set cell as alive
        }
      });
    }
  
    // Glider Pattern
    function gliderPattern(x, y) {
      const offsets = [
        [0, 0], [1, 0], [-1, 1], [0, 1], [0, 2]
      ];
      placePattern(x, y, offsets);
    }
  
    // Small Exploder Pattern
    function smallExploderPattern(x, y) {
      const offsets = [
        [0, 0], [-1, 0], [1, 0],
        [0, -1], [0, 1]
      ];
      placePattern(x, y, offsets);
    }
  
    // Plus Shape Pattern
    function plusPattern(x, y) {
      const offsets = [
        [0, 0], [0, -1], [0, 1],
        [-1, 0], [1, 0]
      ];
      placePattern(x, y, offsets);
    }
  })();
  