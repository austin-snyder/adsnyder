class ContentColumns extends HTMLElement {
  constructor() {
    super();

    // Attach shadow DOM
    const shadow = this.attachShadow({ mode: 'open' });

    // Tag colors based on category
    const tagColors = {
      type: '#FDD9D7', // Soft pink
      language: '#E6CBFB', // Light purple
      software: '#D4F7DC' // Soft green
    };

    // Wrapper container
    const wrapper = document.createElement('div');
    wrapper.classList.add('content-columns');

    // Total columns
    const totalColumns = this.getAttribute('columns') || 4;

    // Content grid wrapper
    const contentWrapper = document.createElement('div');
    contentWrapper.classList.add('content-wrapper');

    let imageCount = 1;

    // Loop through and add images with tags and captions
    while (this.getAttribute(`image-${imageCount}-src`)) {
      const imageContainer = document.createElement('div');
      imageContainer.classList.add('image-container');
      imageContainer.style.gridColumn = `span ${this.getAttribute(`image-${imageCount}-span`) || 1}`;

      // Image
      const image = document.createElement('img');
      image.src = this.getAttribute(`image-${imageCount}-src`);
      image.alt = this.getAttribute(`image-${imageCount}-alt`) || `Image ${imageCount}`;
      image.classList.add('content-image');

      // Caption
      const captionText = this.getAttribute(`caption-${imageCount}`);
      const caption = document.createElement('p');
      caption.textContent = captionText || '';
      caption.classList.add('image-caption');

      // Tags
      const tags = (this.getAttribute(`image-${imageCount}-tags`) || "").split(',').map(tag => tag.trim());
      const primaryTag = tags[0]; // Show the first tag initially
      const otherTags = tags.slice(1); // Hidden tags

      const tagContainer = document.createElement('div');
      tagContainer.classList.add('tags-container');

      if (primaryTag) {
        const tagEl = this._createTag(primaryTag, this._getTagColor(primaryTag, tagColors));
        tagContainer.appendChild(tagEl);
      }

      const hiddenTagsContainer = document.createElement('div');
      hiddenTagsContainer.classList.add('hidden-tags');
      hiddenTagsContainer.style.display = 'none';

      otherTags.forEach(tag => {
        const tagEl = this._createTag(tag, this._getTagColor(tag, tagColors));
        hiddenTagsContainer.appendChild(tagEl);
      });

      // Expand Button - Always at the end
      const expandButton = document.createElement('button');
      expandButton.classList.add('expand-button');
      expandButton.textContent = "+";
      expandButton.addEventListener('click', () => {
        const isHidden = hiddenTagsContainer.style.display === 'none';
        hiddenTagsContainer.style.display = isHidden ? 'flex' : 'none';
        expandButton.textContent = isHidden ? "-" : "+";
      });

      // Combine tags and expand button
      const tagsWrapper = document.createElement('div');
      tagsWrapper.classList.add('tags-wrapper');
      tagsWrapper.appendChild(tagContainer);
      tagsWrapper.appendChild(hiddenTagsContainer);
      tagsWrapper.appendChild(expandButton);

      // Append all elements
      imageContainer.appendChild(image);
      imageContainer.appendChild(tagsWrapper);
      imageContainer.appendChild(caption);
      contentWrapper.appendChild(imageContainer);

      imageCount++;
    }

    // Styles
    const style = document.createElement('style');
    style.textContent = `
      .content-columns {
        display: grid;
        gap: 24px;
        background-color: ${this.getAttribute('background-color') || 'transparent'};
        color: ${this.getAttribute('text-color') || '#2A2A2B'};
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
        gap: 8px;
      }

      .content-image {
        width: 100%;
        border-radius: 8px;
      }

      .image-caption {
        font-size: 0.9em;
        color: inherit;
      }

      .tags-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .tags-container {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .hidden-tags {
        display: none;
        gap: 8px;
        flex-wrap: wrap;
      }

      .tag {
        padding: 4px 8px;
        font-size: 0.8rem;
        border-radius: 4px;
        color: #333;
        text-align: center;
      }

      .expand-button {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1.6rem;
        line-height: 1.6rem;
         font-family: "Inter", serif;
         font-weight: 300;
        color: #333;
        margin-left: auto; /* Push to right */
      }
    `;

    shadow.appendChild(style);
    shadow.appendChild(wrapper);
    wrapper.appendChild(contentWrapper);
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
    if (['Python', 'perl', 'R', 'Fortran90', 'C++', 'javascript'].includes(tag)) return colors.language;
    if (['ArcGIS', 'Postman', 'Flask'].includes(tag)) return colors.software;
    return '#DDD'; // Default gray for unknown tags
  }
}

customElements.define('content-columns', ContentColumns);
