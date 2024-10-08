document.addEventListener("DOMContentLoaded", function () {
    // Function to create a grid of divs for any column
    function createGrid(columnId, rows, cols, invisibleIndices = []) {
        const column = document.getElementById(columnId);
        for (let i = 0; i < rows * cols; i++) {
            const cell = document.createElement("div");

            // Check if the current cell should be invisible
            if (invisibleIndices.includes(i)) {
                cell.classList.add("invisible");
            }

            column.appendChild(cell);
        }
    }

    // Specify the indices of the cells you want to be invisible
    const leftColumnInvisible = []; // No invisible cells for the left column
    const middleColumnInvisible = [6, 13]; // Top right-most and the one below in a 7x8 grid
    const rightColumnInvisible = []; // No invisible cells for the right column

    // Create grids for each column
    createGrid("left-column", 10, 3, leftColumnInvisible);   // 10 rows, 3 columns
    createGrid("middle-column", 8, 7, middleColumnInvisible);  // 8 rows, 7 columns
    createGrid("right-column", 10, 3, rightColumnInvisible);  // 10 rows, 3 columns
});