const loader = document.getElementById('loader');
const page = document.getElementById('page');
const canvas = document.getElementById('liquidCanvas');
const ctx = canvas.getContext('2d');
const fill = document.getElementById('progressFill');
const gloss = document.querySelector('.gloss');

let width = 0;
let height = 0;
let start = null;
let ended = false;
const duration = 3600;

function resizeCanvas(){
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function easeInOutCubic(t){
  return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function drawLiquid(time, progress){
  ctx.clearRect(0, 0, width, height);

  const reveal = easeInOutCubic(Math.min(progress * 1.18, 1));
  const baseY = height - (height * 0.78 * reveal);
  const amp = 9 + 5 * Math.sin(time * 0.0015);

  const grad = ctx.createLinearGradient(0, baseY - 120, 0, height);
  grad.addColorStop(0, 'rgba(90, 23, 111, 0.92)');
  grad.addColorStop(1, 'rgba(50, 16, 61, 0.98)');

  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(0, baseY);

  for(let x = 0; x <= width; x += 10){
    const y = baseY + Math.sin((x * 0.018) + (time * 0.0022)) * amp + Math.sin((x * 0.008) - (time * 0.0013)) * (amp * .55);
    ctx.lineTo(x, y);
  }

  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  for(let x = 0; x <= width; x += 10){
    const y = baseY + Math.sin((x * 0.018) + (time * 0.0022)) * amp + Math.sin((x * 0.008) - (time * 0.0013)) * (amp * .55);
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.strokeStyle = 'rgba(255, 220, 150, 0.18)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function animate(timestamp){
  if(!start) start = timestamp;
  const elapsed = timestamp - start;
  const progress = Math.min(elapsed / duration, 1);

  const revealPercent = Math.min(easeInOutCubic(progress * 1.18) * 100, 100);
  document.documentElement.style.setProperty('--reveal', revealPercent + '%');
  fill.style.width = Math.min(progress * 100, 100) + '%';
  drawLiquid(timestamp, progress);

  if(progress > .54 && !gloss.classList.contains('run')) gloss.classList.add('run');

  if(progress < 1){
    requestAnimationFrame(animate);
  } else if(!ended){
    ended = true;
    page.classList.add('show');
    setTimeout(() => {
      loader.classList.add('hide');
      document.body.style.overflow = 'auto';
    }, 520);
  }
}

window.addEventListener('resize', resizeCanvas, { passive:true });
window.addEventListener('load', () => {
  resizeCanvas();
  requestAnimationFrame(animate);
});
