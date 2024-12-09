document.querySelectorAll('.project-tags-more-icon').forEach(icon => {
  icon.addEventListener('click', function() {
    const projectTagsContainer = this.closest('.project-tags-container');
    if (!projectTagsContainer) {
      console.error('Project tags container not found');
      return;
    }

    const additionalTagsWrapper = projectTagsContainer.querySelector('.additional-project-tags-wrapper');
    if (!additionalTagsWrapper) {
      console.error('Additional project tags wrapper not found');
      return;
    }

    if (additionalTagsWrapper.style.display === 'none' || additionalTagsWrapper.style.display === '') {
      additionalTagsWrapper.style.display = 'flex';
    } else {
      additionalTagsWrapper.style.display = 'none';
    }
  });
});