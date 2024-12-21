class ContentColumns extends HTMLElement {
    constructor() {
      super();
  
      const shadow = this.attachShadow({ mode: 'open' });
  
      // Tag colors based on category
      const tagColors = {
        type: '#F9B588',    // Soft pink
        language: '#E6CBFB',// Light purple
        software: '#D4F7DC' // Soft green
      };
  
      // Wrapper
      const wrapper = document.createElement('div');
      wrapper.classList.add('content-columns');
  
      // Optional headline
      const headlineText = this.getAttribute('headline');
      if (headlineText) {
        const headline = document.createElement('h2');
        headline.textContent = headlineText;
        wrapper.appendChild(headline);
      }
  
      // Total columns
      const totalColumns = this.getAttribute('columns') || 4;
  
      // Content grid wrapper
      const contentWrapper = document.createElement('div');
      contentWrapper.classList.add('content-wrapper');
  
      // Data structures to hold block info
      const imageBlocks = {};
      const textBlocks = {};
      const spacerBlocks = {};
      const items = [];
  
      function ensureItem(type, n) {
        const exists = items.find(item => item.type === type && item.n === n);
        if (!exists) {
          items.push({ type, n });
        }
      }
  
      // Parse attributes
      for (let i = 0; i < this.attributes.length; i++) {
        const attr = this.attributes[i];
        const attrName = attr.name;
  
        let match = attrName.match(/^image-(\d+)-(src|alt|tags|caption|link|link-src|span)$/);
        if (match) {
          const n = parseInt(match[1], 10);
          if (!imageBlocks[n]) imageBlocks[n] = {};
          imageBlocks[n][match[2]] = attr.value;
          ensureItem('image', n);
          continue;
        }
  
        match = attrName.match(/^text-(\d+)(-span)?$/);
        if (match) {
          const n = parseInt(match[1], 10);
          if (!textBlocks[n]) textBlocks[n] = {};
          if (match[2] === '-span') {
            textBlocks[n].span = attr.value;
          } else {
            textBlocks[n].text = attr.value;
          }
          ensureItem('text', n);
          continue;
        }
  
        match = attrName.match(/^spacer-(\d+)(-span)?$/);
        if (match) {
          const n = parseInt(match[1], 10);
          if (!spacerBlocks[n]) spacerBlocks[n] = {};
          if (match[2] === '-span') {
            spacerBlocks[n].span = attr.value;
          } else {
            spacerBlocks[n].isSpacer = true; 
          }
          ensureItem('spacer', n);
          continue;
        }
      }


      const palettes = {
        yellow: ["#FF9506", "#F95808", "#FFEFE1", "#FFC00D"],
        blue: ["#4C9DF9", "#A2AAFF", "#D4E2FF"],
        purple: ["#A150E7", "#FD82F7", "#FADAFF"],
      };

  
      // Create items in order
      for (const item of items) {
        let blockContainer;
  
        if (item.type === 'image') {
          const ib = imageBlocks[item.n] || {};
          blockContainer = document.createElement('div');
          blockContainer.classList.add('image-container');
          const span = parseInt(ib.span || '1', 10);
          blockContainer.style.gridColumn = `span ${span}`;

            // Determine the palette
            const paletteAttrName = `image-${item.n}-palette`;
            const paletteName = this.getAttribute(paletteAttrName) || 'yellow';
            const chosenPalette = palettes[paletteName] || palettes.yellow;

  
      // Create the canvas with the chosen palette
      const canvasWidth = 300;
      const canvasHeight = 200;
      const animatedCanvas = this.createAnimatedCanvas(canvasWidth, canvasHeight, chosenPalette);
      animatedCanvas.classList.add('content-image');
      blockContainer.appendChild(animatedCanvas);
  
          // If tags are present
          if (ib.tags) {
            const tags = ib.tags.split(',').map(t => t.trim()).filter(Boolean);
            if (tags.length > 0) {
              const tagContainer = document.createElement('div');
              tagContainer.classList.add('tag-container');
  
              const primaryTag = tags[0];
              const otherTags = tags.slice(1);
  
              if (primaryTag) {
                const primaryTagEl = this._createTag(primaryTag, this._getTagColor(primaryTag, tagColors));
                tagContainer.appendChild(primaryTagEl);
              }
  
              otherTags.forEach(tag => {
                const tagEl = this._createTag(tag, this._getTagColor(tag, tagColors));
                tagEl.classList.add('hidden');
                tagContainer.appendChild(tagEl);
              });
  
              if (otherTags.length > 0) {
                const expandButton = document.createElement('button');
                expandButton.classList.add('expand-button');
                expandButton.textContent = "+";
                expandButton.addEventListener('click', () => {
                  const expanded = tagContainer.classList.toggle('expanded');
                  expandButton.classList.toggle('rotated', expanded);
                  expandButton.textContent = expanded ? "–" : "+";
                });
                tagContainer.appendChild(expandButton);
              }
              blockContainer.appendChild(tagContainer);
            }
          }
  
          // If caption is present
          if (ib.caption) {
            const caption = document.createElement('p');
            caption.textContent = ib.caption;
            caption.classList.add('image-caption');
            blockContainer.appendChild(caption);
  
            // If link is also present
            if (ib.link && ib['link-src']) {
              const linkWrapper = document.createElement('p');
              linkWrapper.classList.add('image-link');
  
              const link = document.createElement('a');
              link.href = ib['link-src'];
              link.textContent = ib.link;
              link.target = '_blank';
              link.rel = 'noopener noreferrer';
  
              linkWrapper.appendChild(link);
              blockContainer.appendChild(linkWrapper);
            }
          }
  
          contentWrapper.appendChild(blockContainer);
        }
  
        else if (item.type === 'text') {
          const tb = textBlocks[item.n] || {};
          if (tb.text) {
            blockContainer = document.createElement('div');
            blockContainer.classList.add('text-container');
            const span = parseInt(tb.span || '1', 10);
            blockContainer.style.gridColumn = `span ${span}`;
  
            const p = document.createElement('p');
            p.textContent = tb.text;
            blockContainer.appendChild(p);
            contentWrapper.appendChild(blockContainer);
          }
        }
  
        else if (item.type === 'spacer') {
          const sb = spacerBlocks[item.n] || {};
          blockContainer = document.createElement('div');
          blockContainer.classList.add('spacer-container');
          const span = parseInt(sb.span || '1', 10);
          blockContainer.style.gridColumn = `span ${span}`;
          contentWrapper.appendChild(blockContainer);
        }
      }
  
      wrapper.appendChild(contentWrapper);
  
      // Styles
      const style = document.createElement('style');
      style.textContent = `
        .content-columns {
          display: flex;
          flex-direction: column;
          gap: 24px;
          background-color: ${this.getAttribute('background-color') || 'transparent'};
          color: ${this.getAttribute('text-color') || '#2A2A2B'};
        }
  
        h2 {
          font-size: 1.5em;
          line-height: 1.4em;
          margin: 0;
          margin-bottom: 16px;
          max-width: 33%;
        }
  
        @media (max-width: 1024px) {
          h2 {
            font-size: 1.5em;
            line-height: 1.4em;
            margin: 0;
            margin-bottom: 16px;
            max-width: 100%;
          }
        }
  
        .content-wrapper {
          display: grid;
          grid-template-columns: repeat(${totalColumns}, 1fr);
          gap: 24px;
        }
  
        @media (max-width: 1024px) {
          .content-wrapper {
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
          }
        }
  
        @media (max-width: 768px) {
          .content-wrapper {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
        }
  
        .image-container {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 16px;
        }
  
        .content-image {
          width: 100%;
          border-radius: 8px;
          display: block;
          background-color: #FFEFE1;
        }
  
        .image-caption {
          font-size: 1em;
          color: inherit;
          margin: 0;
        }
  
        .image-link {
          margin: 0;
          font-size: 0.95em;
        }
  
        .image-link a {
          color: #0073E6;
          text-decoration: none;
          font-weight: 500;
        }
  
        .image-link a:hover {
          text-decoration: underline;
        }
  
        .tag-container {
          width: auto; 
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          transition: width 0.3s ease-in-out; 
          position: relative;
        }
  
        .tag {
          background-color: #E6EDFF; 
          color: #333;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 1rem;
          white-space: nowrap;
          text-align: center;
          opacity: 1;
          transform: scale(1);
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
  
        .tag.hidden {
          display: none;
        }
  
        .tag-container:hover .tag.hidden {
          display: inline-flex; 
          opacity: 0;
          transform: scale(0.8);
          animation: fadeIn 0.3s forwards;
        }
  
        @keyframes fadeIn {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
  
        .expand-button {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.2rem;
          color: #555;
          transform: rotate(-90deg);
          transition: transform 0.3s ease-in-out;
        }
  
        .expand-button.rotated {
          transform: rotate(0deg);
        }
  
        .tag-container:hover .expand-button {
          display: none;
        }
  
        .text-container p {
          margin: 0;
          font-size: 1em;
          line-height: 1.4em;
        }
  
        .spacer-container {
        }
      `;
  
      shadow.appendChild(style);
      shadow.appendChild(wrapper);
    }
  
    // Helper to create a tag element
    _createTag(label, color) {
      const tag = document.createElement('span');
      tag.classList.add('tag');
      tag.style.backgroundColor = color;
      tag.textContent = label;
      return tag;
    }
  
    // Helper to determine tag color
    _getTagColor(tag, colors) {
      if (['Data Simulation', 'Generation Modeling', 'Data Analysis'].includes(tag)) return colors.type;
      if (['Python', 'Perl', 'R', 'Fortran90', 'C++', 'Javascript'].includes(tag)) return colors.language;
      if (['ArcGIS', 'Postman', 'Flask'].includes(tag)) return colors.software;
      return '#DDD'; // Default gray for unknown tags
    }
  
    createAnimatedCanvas(width, height, colorPalette) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
      
        const ctx = canvas.getContext('2d');
      
        let cols = 5; 
        let minRegionSize = 1;
        let maxRegionSize = 1;
        let animationDelay = 300;
        let fadeSpeed = 0.01;
        let radius = 0;
        let unitHeight, cellWidth, grid = [], regions = [], rowCount = 12;
      
        function generateInitialGrid(rows) {
          return Array.from({ length: rows }, () =>
            Array.from({ length: cols }, () => Math.random() > 0.5 ? 1 : 0)
          );
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
          const size = Math.floor(Math.random() * ((max - min) / 2 + 1)) * 2 + min;
          return size;
        }
      
        function markOccupied(occupied, x, y, w, h) {
          for (let i = y; i < y + h && i < occupied.length; i++) {
            for (let j = x; j < x + w && j < occupied[i].length; j++) {
              occupied[i][j] = true;
            }
          }
        }
      
        function createRandomGradient(x, y, w, h) {
          const gradientDirections = [
            [x, y, x+w, y+h],
            [x+w, y, x, y+h],
            [x, y+h, x+w, y],
            [x+w, y+h, x, y]
          ];
          const [x0,y0,x1,y1] = gradientDirections[Math.floor(Math.random() * gradientDirections.length)];
          const gradient = ctx.createLinearGradient(x0,y0,x1,y1);
          const color1 = colorPalette[Math.floor(Math.random()*colorPalette.length)];
          const color2 = colorPalette[Math.floor(Math.random()*colorPalette.length)];
          gradient.addColorStop(0, color1);
          gradient.addColorStop(1, color2);
          return gradient;
        }
      
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
                  const w = size * cellWidth;
                  const h = size * unitHeight;
                  const gradient = createRandomGradient(startX, startY, w, h);
      
                  regions.push({
                    x: startX,
                    y: startY,
                    width: w,
                    height: h,
                    gridX: x,
                    gridY: y,
                    gridWidth: size,
                    gridHeight: size,
                    opacity: 0,
                    targetOpacity: 0,
                    gradient: gradient
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
      
        function updateGameOfLife() {
          const nextGrid = grid.map((row,y)=>
            row.map((cell,x)=>{
              const neighbors = countNeighbors(x,y);
              if (cell===1) return (neighbors<2||neighbors>3)?2:1;
              if (cell===2) return 0;
              return neighbors===3?1:0;
            })
          );
          grid = nextGrid;
        }
      
        function updateRegions() {
          regions.forEach(region => {
            let aliveCount = 0;
            for (let yy = region.gridY; yy < region.gridY + region.gridHeight; yy++) {
              for (let xx = region.gridX; xx < region.gridX + region.gridWidth; xx++) {
                if (grid[yy] && grid[yy][xx]) aliveCount++;
              }
            }
            const totalCells = region.gridWidth * region.gridHeight;
            region.targetOpacity = Math.min(1, (aliveCount / totalCells) * 0.8);
          });
        }
      
        function drawRoundedRect(x, y, w, h, r) {
          ctx.beginPath();
          ctx.moveTo(x+r,y);
          ctx.lineTo(x+w-r,y);
          ctx.arc(x+w-r,y+r,r,-Math.PI/2,0,false);
          ctx.lineTo(x+w,y+h-r);
          ctx.arc(x+w-r,y+h-r,r,0,Math.PI/2,false);
          ctx.lineTo(x+r,y+h);
          ctx.arc(x+r,y+h-r,r,Math.PI/2,Math.PI,false);
          ctx.lineTo(x,y+r);
          ctx.arc(x+r,y+r,r,Math.PI,-Math.PI/2,false);
          ctx.closePath();
          ctx.fill();
        }
      
        function draw() {
          ctx.clearRect(0,0,canvas.width,canvas.height);
          regions.forEach(r=>{
            ctx.globalAlpha = r.opacity;
            ctx.fillStyle = r.gradient;
            drawRoundedRect(r.x, r.y, r.width, r.height, radius);
          });
          ctx.globalAlpha = 1;
        }
      
        function animate() {
          regions.forEach(region => {
            region.opacity += (region.targetOpacity - region.opacity)*fadeSpeed;
          });
          draw();
          requestAnimationFrame(animate);
        }
      
        function init() {
          cellWidth = canvas.width / cols; 
          unitHeight = cellWidth;
          grid = generateInitialGrid(rowCount);
          regions = [];
          generateRegions();
          animate();
        }
      
        init();
      
        setInterval(() => {
          updateGameOfLife();
          updateRegions();
        }, animationDelay);
      
        // --- Hover Interaction Logic ---
        let previousCell = null; 
        let throttleTimeout = null;
      
        canvas.addEventListener("mousemove", handleMouseMove);
      
        function handleMouseMove(event) {
          if (throttleTimeout) return;
          throttleTimeout = setTimeout(() => {
            const rect = canvas.getBoundingClientRect();
            const cursorX = event.clientX - rect.left;
            const cursorY = event.clientY - rect.top;
        
            const gridX = Math.floor(cursorX / cellWidth);
            const gridY = Math.floor(cursorY / unitHeight);
        
            if (gridY >= 0 && gridY < grid.length && gridX >= 0 && gridX < grid[0].length) {
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
          if (grid[y] && grid[y][x] !== undefined) {
            grid[y][x] = grid[y][x] === 0 ? 1 : 0; // Toggle cell state
          }
        }
        // --- End Hover Interaction ---
      
        return canvas;
      }
      
  }
  
  customElements.define('content-columns', ContentColumns);
  