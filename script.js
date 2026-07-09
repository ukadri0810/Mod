const loader = document.getElementById('loader');
const page = document.getElementById('page');

window.addEventListener('load', () => {
  setTimeout(() => page.classList.add('show'), 3150);
  setTimeout(() => {
    loader.classList.add('hide');
    document.body.style.overflow = 'auto';
  }, 4000);
});
