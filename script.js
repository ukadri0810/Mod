const body = document.body;
const loader = document.getElementById('loader');
const loaderCount = document.getElementById('loaderCount');
const loaderProgress = document.getElementById('loaderProgress');
const loaderWords = document.getElementById('loaderWords');
const scoop = document.querySelector('.loader__scoop');
const params = new URLSearchParams(location.search);
const shouldSkipLoader = params.has('skipLoader') || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function startLoader() {
  if (shouldSkipLoader) {
    loader?.remove();
    body.classList.remove('is-locked');
    return;
  }

  body.classList.add('is-locked');
  const duration = 2500;
  const start = performance.now();
  const circumference = 572;
  let lastWord = -1;

  function tick(now) {
    const raw = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - raw, 3);
    const percent = Math.floor(eased * 100);
    loaderCount.textContent = String(percent).padStart(2, '0');
    loaderProgress.style.strokeDashoffset = circumference * (1 - eased);
    scoop.style.transform = `rotate(${eased * 360}deg)`;

    const wordIndex = Math.min(4, Math.floor(raw * 4.35));
    if (wordIndex !== lastWord) {
      loaderWords.style.transform = `translateY(-${wordIndex * 59}px)`;
      lastWord = wordIndex;
    }

    if (raw < 1) {
      requestAnimationFrame(tick);
    } else {
      setTimeout(() => {
        loader.classList.add('is-exiting');
        body.classList.remove('is-locked');
        setTimeout(() => loader.classList.add('is-gone'), 1300);
      }, 180);
    }
  }
  requestAnimationFrame(tick);
}
startLoader();

const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
menuToggle?.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!open));
  mobileMenu.classList.toggle('is-open', !open);
  mobileMenu.setAttribute('aria-hidden', String(open));
});
mobileMenu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menuToggle.setAttribute('aria-expanded', 'false');
  mobileMenu.classList.remove('is-open');
  mobileMenu.setAttribute('aria-hidden', 'true');
}));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .12, rootMargin: '0px 0px -50px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const moods = {
  crispy: {
    number: '01 / 04',
    title: 'CRUNCH<br>MODE',
    description: 'Golden, layered and seriously satisfying. This is the mood that can be heard from across the table.',
    dish: 'VEG CRISPY BURGER',
    image: 'assets/burger.webp',
    alt: 'Crispy vegetarian burger'
  },
  cheesy: {
    number: '02 / 04',
    title: 'CHEESE<br>PLEASE',
    description: 'Toasted edges, a smoky paneer centre and enough molten cheese to turn one bite into a full moment.',
    dish: 'PANEER CHEESE SANDWICH',
    image: 'assets/sandwich.webp',
    alt: 'Paneer cheese grilled sandwich'
  },
  spicy: {
    number: '03 / 04',
    title: 'HEAT<br>WAVE',
    description: 'Peri peri dust, creamy mayo and fries that refuse to stay on the table for very long.',
    dish: 'PERI PERI MAYO FRIES',
    image: 'assets/fries.webp',
    alt: 'Peri peri mayonnaise fries'
  },
  sweet: {
    number: '04 / 04',
    title: 'SWEET<br>ESCAPE',
    description: 'Cold vanilla, dark chocolate and KitKat crunch — the kind of ending that becomes the main plan.',
    dish: 'KITKAT SUNDAE',
    image: 'assets/sundae.webp',
    alt: 'KitKat chocolate sundae'
  }
};

const moodStage = document.getElementById('moodStage');
const moodNumber = document.getElementById('moodNumber');
const moodTitle = document.getElementById('moodTitle');
const moodDescription = document.getElementById('moodDescription');
const moodDish = document.getElementById('moodDish');
const moodImage = document.getElementById('moodImage');

document.querySelectorAll('.mood-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const selected = moods[tab.dataset.mood];
    if (!selected || tab.classList.contains('is-active')) return;
    document.querySelectorAll('.mood-tab').forEach(t => {
      const active = t === tab;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', String(active));
    });
    moodStage.classList.add('is-changing');
    setTimeout(() => {
      moodNumber.textContent = selected.number;
      moodTitle.innerHTML = selected.title;
      moodDescription.textContent = selected.description;
      moodDish.textContent = selected.dish;
      moodImage.src = selected.image;
      moodImage.alt = selected.alt;
      requestAnimationFrame(() => moodStage.classList.remove('is-changing'));
    }, 230);
  });
});

const rail = document.getElementById('dishRail');
let isDown = false;
let railStartX = 0;
let scrollStart = 0;
rail?.addEventListener('pointerdown', (event) => {
  isDown = true;
  rail.setPointerCapture(event.pointerId);
  railStartX = event.clientX;
  scrollStart = rail.scrollLeft;
});
rail?.addEventListener('pointermove', (event) => {
  if (!isDown) return;
  rail.scrollLeft = scrollStart - (event.clientX - railStartX) * 1.4;
});
rail?.addEventListener('pointerup', () => isDown = false);
rail?.addEventListener('pointercancel', () => isDown = false);

const parallaxTarget = document.querySelector('[data-parallax] img');
let ticking = false;
function updateParallax() {
  if (parallaxTarget && window.innerWidth > 760) {
    const amount = Math.min(window.scrollY * 0.035, 45);
    parallaxTarget.style.transform = `translateY(${amount}px) scale(1.05)`;
  }
  ticking = false;
}
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(updateParallax);
    ticking = true;
  }
}, { passive: true });

const cursor = document.getElementById('cursorDot');
if (window.matchMedia('(pointer:fine)').matches) {
  window.addEventListener('pointermove', (e) => {
    cursor.style.opacity = '1';
    cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
  });
  document.querySelectorAll('a, button, .dish-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-active'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-active'));
  });
}

// Small magnetic pull on primary CTAs.
document.querySelectorAll('.magnetic').forEach(button => {
  button.addEventListener('pointermove', (event) => {
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    button.style.transform = `translate(${x * .08}px, ${y * .12}px)`;
  });
  button.addEventListener('pointerleave', () => button.style.transform = 'translate(0,0)');
});
