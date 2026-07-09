const loader = document.getElementById('loader');
const page = document.getElementById('page');
const logoWrap = document.getElementById('logoWrap');

setTimeout(() => {
  page.classList.add('is-visible');
}, 3400);

setTimeout(() => {
  loader.classList.add('is-hidden');
  document.body.style.overflow = 'auto';
}, 4450);

let raf = null;
document.addEventListener('pointermove', (e) => {
  if (window.innerWidth < 780 || loader.classList.contains('is-hidden')) return;
  if (raf) cancelAnimationFrame(raf);
  raf = requestAnimationFrame(() => {
    const x = (e.clientX / window.innerWidth - 0.5) * 5;
    const y = (e.clientY / window.innerHeight - 0.5) * -5;
    logoWrap.style.transform = `translate3d(0,0,0) rotateX(${y}deg) rotateY(${x}deg)`;
  });
});
