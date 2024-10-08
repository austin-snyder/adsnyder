document.addEventListener("DOMContentLoaded", function () {
    // Function to create a grid of divs for any column
    function createGrid(columnId, rows, cols) {
        const column = document.getElementById(columnId);
        for (let i = 0; i < rows * cols; i++) {
            const cell = document.createElement("div");
            column.appendChild(cell);
        }
    }

    // Create grids for each column
    createGrid("left-column", 10, 3);   // 10 rows, 3 columns
    createGrid("middle-column", 8, 7);  // 8 rows, 7 columns
    createGrid("right-column", 10, 3);  // 10 rows, 3 columns
});