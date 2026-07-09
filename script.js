const loader = document.getElementById('loader');
const page = document.querySelector('.page-content');

window.addEventListener('load', () => {
  const minimumLoaderTime = 3600;

  window.setTimeout(() => {
    loader.classList.add('loaded');
    page.classList.add('show');
    document.body.style.overflow = 'auto';
    window.setTimeout(() => loader.remove(), 950);
  }, minimumLoaderTime);
});
