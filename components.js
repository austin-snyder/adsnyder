class ContentColumns extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });

    // Tag colors based on category
    const tagColors = {
      type: '#D4E2FF',    // Soft pink
      language: '#FADAFF',// Light purple
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

    // We'll keep an ordered list of items as we encounter them in the attributes
    // Each item is {type: 'image'|'text'|'spacer', n: number}
    const items = [];

    // Helper function to record an item if we haven't seen that n/type yet
    function ensureItem(type, n) {
      // Check if we already have an item of this type and n
      // For image blocks, multiple attributes define one block, so add only once
      // For text and spacer, it's a single attribute anyway
      const exists = items.find(item => item.type === type && item.n === n);
      if (!exists) {
        items.push({ type, n });
      }
    }

    // Parse all attributes in the order they appear
    for (let i = 0; i < this.attributes.length; i++) {
      const attr = this.attributes[i];
      const attrName = attr.name;

      // Match patterns: image-n-*, text-n, spacer-n
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
          spacerBlocks[n].isSpacer = true; // Just a flag
        }
        ensureItem('spacer', n);
        continue;
      }
    }

    // Now we have an ordered list of items in the order attributes appeared.
    // Let's create elements for each item:
    for (const [index, item] of items.entries()) {
      let blockContainer;
    
      if (item.type === 'image') {
        const ib = imageBlocks[item.n] || {};
        blockContainer = document.createElement('div');
        blockContainer.classList.add('image-container', 'fade-slide-in');
        const span = parseInt(ib.span || '1', 10);
        blockContainer.style.gridColumn = `span ${span}`;
    
        // Add staggered transition delay
        const transitionDelay = `${index * 1000}ms`; // 100ms delay per item
        blockContainer.style.transitionDelay = transitionDelay;

            // Log the delay for debugging
    console.log(`Image block ${index}: transition-delay set to ${transitionDelay}`);


        // If image src is present
        if (ib.src) {
          const image = document.createElement('img');
          image.src = ib.src;
          image.alt = ib.alt || `Image ${item.n}`;
          image.classList.add('content-image');
          blockContainer.appendChild(image);
        }

        // If tags are present
        if (ib.tags) {
          const tags = ib.tags.split(',').map(t => t.trim()).filter(Boolean);
          if (tags.length > 0) {
            const tagContainer = document.createElement('div');
            tagContainer.classList.add('tag-container');

            const primaryTag = tags[0];
            const otherTags = tags.slice(1);

            // Add primary tag
            if (primaryTag) {
              const primaryTagEl = this._createTag(primaryTag, this._getTagColor(primaryTag, tagColors));
              tagContainer.appendChild(primaryTagEl);
            }

            // Add hidden tags
            otherTags.forEach(tag => {
              const tagEl = this._createTag(tag, this._getTagColor(tag, tagColors));
              tagEl.classList.add('hidden');
              tagContainer.appendChild(tagEl);
            });

            // Expand Button if needed
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
            const captionContainer = document.createElement('div');
            captionContainer.classList.add('caption-container');

            // Split caption into paragraphs based on double newlines
            const paragraphs = ib.caption.split('\n\n').map(paragraph => paragraph.trim());

            paragraphs.forEach(paragraph => {
              const p = document.createElement('p');
              // Replace single newlines with <br> for within-paragraph line breaks
              p.innerHTML = paragraph.replace(/\n/g, '<br>');
              captionContainer.appendChild(p);
            });

            blockContainer.appendChild(captionContainer);

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
              captionContainer.appendChild(linkWrapper);
            }
          }


        contentWrapper.appendChild(blockContainer);
      }

      else if (item.type === 'text') {
        const tb = textBlocks[item.n] || {};
        if (tb.text) {
          blockContainer = document.createElement('div');
          blockContainer.classList.add('text-container', 'fade-slide-in');
          const span = parseInt(tb.span || '1', 10);
          blockContainer.style.gridColumn = `span ${span}`;
    
          // Add staggered transition delay
          const transitionDelay = `${index * 100}ms`; // 100ms delay per item
          blockContainer.style.transitionDelay = transitionDelay;
      
          // Split text into paragraphs based on double newlines
          const paragraphs = tb.text.split('\n\n').map(paragraph => paragraph.trim());
      
          paragraphs.forEach(paragraph => {
            const p = document.createElement('p');
            // Replace single newlines with <br> for within-paragraph line breaks
            p.innerHTML = paragraph.replace(/\n/g, '<br>');
            blockContainer.appendChild(p);
          });
      
          contentWrapper.appendChild(blockContainer);
        }
      }
      
      else if (item.type === 'spacer') {
        const sb = spacerBlocks[item.n] || {};
        blockContainer = document.createElement('div');
        blockContainer.classList.add('spacer-container', 'fade-slide-in');
        const span = parseInt(sb.span || '1', 10);
        blockContainer.style.gridColumn = `span ${span}`;
    
        // Add staggered transition delay
        const transitionDelay = `${index * 100}ms`; // 100ms delay per item
        blockContainer.style.transitionDelay = transitionDelay;

        // You can style the spacer in CSS or leave it empty
        contentWrapper.appendChild(blockContainer);
      }
    }

    wrapper.appendChild(contentWrapper);

    // Log the number of children
console.log(`Total children in contentWrapper: ${contentWrapper.children.length}`);

    // Trigger staggered animations
requestAnimationFrame(() => {
  const children = contentWrapper.querySelectorAll('.fade-slide-in');
  children.forEach(child => child.classList.add('show'));
});

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
        max-width: 50%;
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
        grid-template-columns: repeat(${totalColumns}, minmax(0, 1fr));
        grid-gap: 60px 24px;
        width: 100%;
      }

      


@media (max-width: 600px) {
  .content-wrapper {
  display: grid;
    grid-template-columns: 1fr; /* Single-column layout */
    gap: 16px;
    width: 100%; /* Ensure it spans the full viewport width */
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

      .text-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .text-container p {
        margin: 0;
        font-size: 1em;
        line-height: 1.4em;
      }

      .spacer-container {
        /* A spacer block is empty by default, can be styled or left empty */
      }


.caption-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.caption-container p {
  margin: 0;
  line-height: 1.6em;
}

.text-container,
.image-container {
  width: 100%; /* Allow grid to dictate the column width */
  max-width: unset; /* Prevent any max-width from interfering */
  flex: unset; /* Ensure no flexbox interference */
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
    if (['Data Simulation', 'Generation Modeling', 'Data Analysis', 'Data Analysis & Presentation'].includes(tag)) return colors.type;
    if (['Python', 'Perl', 'R', 'Fortran90', 'C++', 'Javascript'].includes(tag)) return colors.language;
    if (['ArcGIS', 'QGIS','Postman', 'Flask', 'PyTorch'].includes(tag)) return colors.software;
    return '#DDD'; // Default gray for unknown tags
  }
}

customElements.define('content-columns', ContentColumns);
