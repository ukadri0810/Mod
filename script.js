const loader = document.getElementById('loader');
const page = document.getElementById('page');
const shine = document.getElementById('shine');

let start = null;
let done = false;
const duration = 3200;

function easeOutQuint(t){ return 1 - Math.pow(1 - t, 5); }
function easeInOutCubic(t){ return t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3)/2; }

function tick(now){
  if(!start) start = now;
  const elapsed = now - start;
  const p = Math.min(elapsed / duration, 1);

  const revealStart = Math.max(0, (p - .08) / .56);
  const reveal = easeInOutCubic(Math.min(revealStart, 1)) * 100;
  const progress = easeOutQuint(p) * 100;

  document.documentElement.style.setProperty('--reveal-x', reveal + '%');
  document.documentElement.style.setProperty('--progress', progress + '%');

  if(p > .55 && !shine.classList.contains('run')) shine.classList.add('run');

  if(p < 1){
    requestAnimationFrame(tick);
    return;
  }

  if(!done){
    done = true;
    page.classList.add('show');
    setTimeout(() => {
      loader.classList.add('hide');
      document.body.style.overflow = 'auto';
    }, 520);
  }
}

window.addEventListener('load', () => requestAnimationFrame(tick));
