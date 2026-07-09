const loader = document.getElementById('loader');
const site = document.getElementById('site');
const canvas = document.getElementById('dust');
const ctx = canvas.getContext('2d');
let particles = [];
function resize(){canvas.width=innerWidth*devicePixelRatio;canvas.height=innerHeight*devicePixelRatio;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);particles=Array.from({length: Math.min(72, Math.floor(innerWidth/14))},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.8+.4,v:Math.random()*.35+.08,a:Math.random()*Math.PI*2,o:Math.random()*.35+.08}));}
function draw(){ctx.clearRect(0,0,innerWidth,innerHeight);for(const p of particles){p.y-=p.v;p.x+=Math.sin((p.a+=.006))*0.18;if(p.y<-10){p.y=innerHeight+10;p.x=Math.random()*innerWidth}ctx.globalAlpha=p.o;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=p.r>1.3?'#f0a332':'#7d2c98';ctx.fill();}requestAnimationFrame(draw)}
resize(); draw(); addEventListener('resize',resize);
setTimeout(()=>{site.classList.add('show'); site.setAttribute('aria-hidden','false');},3600);
setTimeout(()=>{loader.classList.add('hide'); document.body.style.overflow='auto';},4300);
const plate=document.getElementById('plate');
document.addEventListener('pointermove',e=>{if(innerWidth<760||loader.classList.contains('hide'))return;const x=(e.clientX/innerWidth-.5)*8;const y=(e.clientY/innerHeight-.5)*-8;plate.style.transform=`translateY(0) scale(1) rotateX(${y}deg) rotateY(${x}deg)`;});
