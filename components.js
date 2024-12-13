class ContentColumns extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });

    // Tag colors based on category
    const tagColors = {
      type: '#FDD9D7',    // Soft pink
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

    // Content wrapper
    const contentWrapper = document.createElement('div');
    contentWrapper.classList.add('content-wrapper');

    // Process "blocks" that were previously only images
    let imageCount = 1;
    while (true) {
      // Check if any attribute for this count exists that would justify creating a block
      const hasImage = this.hasAttribute(`image-${imageCount}-src`);
      const hasTags = this.hasAttribute(`image-${imageCount}-tags`);
      const hasCaption = this.hasAttribute(`image-${imageCount}-caption`);
      const hasLink = this.hasAttribute(`image-${imageCount}-link`) && this.hasAttribute(`image-${imageCount}-link-src`);

      // If none of these attributes are present for this index, break out of the loop
      if (!hasImage && !hasTags && !hasCaption && !hasLink) {
        break;
      }

      // Create a generic block container (instead of imageContainer)
      const blockContainer = document.createElement('div');
      blockContainer.classList.add('image-container');
      blockContainer.style.gridColumn = `span ${this.getAttribute(`image-${imageCount}-span`) || 1}`;

      // If image is present, add it
      if (hasImage) {
        const image = document.createElement('img');
        image.src = this.getAttribute(`image-${imageCount}-src`);
        image.alt = this.getAttribute(`image-${imageCount}-alt`) || `Image ${imageCount}`;
        image.classList.add('content-image');
        blockContainer.appendChild(image);
      }

      // If tags are present, show them even if no image
      if (hasTags) {
        const tagsStr = this.getAttribute(`image-${imageCount}-tags`) || "";
        const tags = tagsStr.split(',').map(tag => tag.trim()).filter(Boolean);

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

          // Expand Button if we have other tags
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
      if (hasCaption) {
        const captionText = this.getAttribute(`image-${imageCount}-caption`) || '';
        const caption = document.createElement('p');
        caption.textContent = captionText;
        caption.classList.add('image-caption');
        blockContainer.appendChild(caption);

        // If link is also present
        if (hasLink) {
          const linkWrapper = document.createElement('p');
          linkWrapper.classList.add('image-link');

          const link = document.createElement('a');
          link.href = this.getAttribute(`image-${imageCount}-link-src`);
          link.textContent = this.getAttribute(`image-${imageCount}-link`);
          link.target = '_blank';
          link.rel = 'noopener noreferrer';

          linkWrapper.appendChild(link);
          blockContainer.appendChild(linkWrapper);
        }
      }

      // Append the block container if it has any content
      if (blockContainer.childNodes.length > 0) {
        contentWrapper.appendChild(blockContainer);
      }

      imageCount++;
    }

    // Process text blocks
    let textCount = 1;
    while (this.hasAttribute(`text-${textCount}`)) {
      const textValue = this.getAttribute(`text-${textCount}`);
      if (textValue) {
        const textContainer = document.createElement('div');
        textContainer.classList.add('text-container');
        const span = parseInt(this.getAttribute(`text-${textCount}-span`), 10) || 1;
        textContainer.style.gridColumn = `span ${span}`;

        const p = document.createElement('p');
        p.textContent = textValue;
        textContainer.appendChild(p);

        contentWrapper.appendChild(textContainer);
      }
      textCount++;
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

      .content-wrapper {
        display: grid;
        grid-template-columns: repeat(${totalColumns}, 1fr);
        gap: 24px;
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

        .tag-container:hover .expand-button {
        display: none;
        }

      .expand-button.rotated {
        transform: rotate(0deg);
      }

      /* Text Container Styles */
      .text-container {
        display: flex;
        flex-direction: column;
      }

      .text-container p {
        margin: 0;
        font-size: 1em;
        line-height: 1.4em;
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
}

customElements.define('content-columns', ContentColumns);
