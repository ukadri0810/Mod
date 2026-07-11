const body = document.body;
const loader = document.getElementById('loader');
const loaderCount = document.getElementById('loaderCount');
const loaderProgress = document.getElementById('loaderProgress');
const loaderWords = document.getElementById('loaderWords');
const loaderBar = document.getElementById('loaderBar');
const loaderOrbit = document.getElementById('loaderOrbit');
const loaderStatus = document.getElementById('loaderStatus');
const params = new URLSearchParams(window.location.search);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const shouldSkipLoader = params.has('skipLoader');

function removeLoaderImmediately() {
  loader?.remove();
  body.classList.remove('is-locked');
  body.classList.add('site-ready');
}

function startLoader() {
  if (!loader || !loaderCount || !loaderProgress || !loaderWords || !loaderBar) {
    removeLoaderImmediately();
    return;
  }

  if (shouldSkipLoader) {
    removeLoaderImmediately();
    return;
  }

  body.classList.add('is-locked');

  const minDuration = reducedMotion ? 500 : 2600;
  const maxDuration = reducedMotion ? 800 : 5200;
  const circumference = 2 * Math.PI * 96;
  const startedAt = performance.now();
  const images = Array.from(document.images);
  let loadedAssets = images.filter(image => image.complete).length;
  let displayedProgress = 0;
  let lastWordIndex = -1;
  let finished = false;

  images.forEach(image => {
    if (image.complete) return;
    const markComplete = () => {
      loadedAssets += 1;
    };
    image.addEventListener('load', markComplete, { once: true });
    image.addEventListener('error', markComplete, { once: true });
  });

  const statusMessages = [
    'One place. Every mood.',
    'Melting the cheese.',
    'Turning up the heat.',
    'Finishing with something sweet.',
    'Your mood is ready.'
  ];

  function paint(progress) {
    const safeProgress = Math.max(0, Math.min(progress, 1));
    const percent = Math.round(safeProgress * 100);
    loaderCount.textContent = `${String(percent).padStart(2, '0')}%`;
    loaderProgress.style.strokeDashoffset = String(circumference * (1 - safeProgress));
    loaderBar.style.width = `${safeProgress * 100}%`;

    if (loaderOrbit) {
      loaderOrbit.style.transform = `rotate(${safeProgress * 430}deg)`;
    }

    const wordIndex = Math.min(4, Math.floor(safeProgress * 4.25));
    if (wordIndex !== lastWordIndex) {
      const firstWord = loaderWords.querySelector('span');
      const wordHeight = firstWord?.getBoundingClientRect().height || 128;
      loaderWords.style.transform = `translateY(-${wordIndex * wordHeight}px)`;
      if (loaderStatus) loaderStatus.textContent = statusMessages[wordIndex];
      lastWordIndex = wordIndex;
    }
  }

  function completeLoader() {
    if (finished) return;
    finished = true;
    paint(1);
    loader.classList.add('is-complete');

    window.setTimeout(() => {
      loader.classList.add('is-exiting');
      body.classList.remove('is-locked');
      body.classList.add('site-ready');

      window.setTimeout(() => {
        loader.classList.add('is-gone');
        loader.setAttribute('aria-hidden', 'true');
      }, reducedMotion ? 40 : 1100);
    }, reducedMotion ? 80 : 360);
  }

  function tick(now) {
    const elapsed = now - startedAt;
    const assetRatio = images.length ? loadedAssets / images.length : 1;
    let targetProgress;

    if (elapsed < minDuration) {
      const timeRatio = elapsed / minDuration;
      targetProgress = Math.min(0.9, timeRatio * 0.79 + assetRatio * 0.13);
    } else if (assetRatio >= 1) {
      targetProgress = 1;
    } else {
      const overtimeRatio = Math.min((elapsed - minDuration) / Math.max(maxDuration - minDuration, 1), 1);
      targetProgress = 0.9 + overtimeRatio * 0.1;
    }

    if (elapsed >= maxDuration) targetProgress = 1;

    displayedProgress += (targetProgress - displayedProgress) * (reducedMotion ? 0.5 : 0.095);
    if (targetProgress === 1 && displayedProgress > 0.992) displayedProgress = 1;
    paint(displayedProgress);

    if (displayedProgress >= 1) {
      completeLoader();
      return;
    }

    requestAnimationFrame(tick);
  }

  paint(0);
  requestAnimationFrame(tick);

  // Safety exit: a failed image or browser event can never trap the visitor.
  window.setTimeout(completeLoader, maxDuration + 1400);
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

// Cinematic hero carousel: automatic mood changes with accessible manual controls.
const cinemaHero = document.querySelector('.cinema-hero');
const heroVisual = document.getElementById('heroVisual');
const heroSlides = Array.from(document.querySelectorAll('.cinema-slide'));
const heroMoodWord = document.getElementById('heroMoodWord');
const heroDescription = document.getElementById('heroDescription');
const heroDishName = document.getElementById('heroDishName');
const heroSlideNumber = document.getElementById('heroSlideNumber');
const heroDishCard = document.querySelector('.cinema-hero__dish-card');
const heroDynamic = document.querySelector('.cinema-hero__dynamic');
const heroDots = document.getElementById('heroDots');
const heroPrev = document.getElementById('heroPrev');
const heroNext = document.getElementById('heroNext');

let heroIndex = 0;
let heroTimer = null;
let heroStarted = false;
let heroPaused = false;
let heroChanging = false;
const heroInterval = reducedMotion ? 8000 : 5600;

function restartHeroProgress() {
  if (!heroVisual || heroPaused) return;
  heroVisual.classList.remove('is-running');
  // Reading offsetWidth reliably restarts the CSS progress animation.
  void heroVisual.offsetWidth;
  heroVisual.classList.add('is-running');
}

function scheduleHero() {
  window.clearTimeout(heroTimer);
  if (!heroStarted || heroPaused || heroSlides.length < 2) return;
  restartHeroProgress();
  heroTimer = window.setTimeout(() => showHeroSlide(heroIndex + 1), heroInterval);
}

function updateHeroDots() {
  heroDots?.querySelectorAll('button').forEach((dot, index) => {
    const active = index === heroIndex;
    dot.classList.toggle('is-active', active);
    dot.setAttribute('aria-current', active ? 'true' : 'false');
  });
}

function showHeroSlide(nextIndex, immediate = false) {
  if (!heroSlides.length || heroChanging) return;
  const normalized = (nextIndex + heroSlides.length) % heroSlides.length;
  if (normalized === heroIndex && !immediate) {
    scheduleHero();
    return;
  }

  heroChanging = true;
  window.clearTimeout(heroTimer);

  const nextSlide = heroSlides[normalized];
  const swapDelay = immediate || reducedMotion ? 0 : 210;

  heroDynamic?.classList.add('is-updating');
  heroDescription?.classList.add('is-updating');
  heroDishCard?.classList.add('is-updating');

  window.setTimeout(() => {
    heroSlides[heroIndex]?.classList.remove('is-active');
    nextSlide.classList.add('is-active');
    heroIndex = normalized;

    const mood = nextSlide.dataset.mood || '';
    const dish = nextSlide.dataset.dish || '';
    const description = nextSlide.dataset.description || '';
    const accent = nextSlide.dataset.accent || '#f39a35';

    if (heroMoodWord) heroMoodWord.textContent = mood;
    if (heroDescription) heroDescription.textContent = description;
    if (heroDishName) heroDishName.textContent = dish;
    if (heroSlideNumber) heroSlideNumber.textContent = `${String(heroIndex + 1).padStart(2, '0')} / ${String(heroSlides.length).padStart(2, '0')}`;
    cinemaHero?.style.setProperty('--hero-accent', accent);
    updateHeroDots();

    requestAnimationFrame(() => {
      heroDynamic?.classList.remove('is-updating');
      heroDescription?.classList.remove('is-updating');
      heroDishCard?.classList.remove('is-updating');
      heroChanging = false;
      scheduleHero();
    });
  }, swapDelay);
}

if (heroDots && heroSlides.length) {
  heroSlides.forEach((slide, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `Show ${slide.dataset.dish || `dish ${index + 1}`}`);
    button.addEventListener('click', () => showHeroSlide(index));
    heroDots.appendChild(button);
  });
  updateHeroDots();
}

heroPrev?.addEventListener('click', () => showHeroSlide(heroIndex - 1));
heroNext?.addEventListener('click', () => showHeroSlide(heroIndex + 1));

function pauseHero() {
  heroPaused = true;
  window.clearTimeout(heroTimer);
  heroVisual?.classList.remove('is-running');
}

function resumeHero() {
  heroPaused = false;
  scheduleHero();
}

heroVisual?.addEventListener('mouseenter', pauseHero);
heroVisual?.addEventListener('mouseleave', resumeHero);
heroVisual?.addEventListener('focusin', pauseHero);
heroVisual?.addEventListener('focusout', (event) => {
  if (!heroVisual.contains(event.relatedTarget)) resumeHero();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) pauseHero();
  else resumeHero();
});

function startHeroAutoplay() {
  if (heroStarted || !heroSlides.length) return;
  heroStarted = true;
  scheduleHero();
}

if (body.classList.contains('site-ready')) {
  startHeroAutoplay();
} else {
  const readyObserver = new MutationObserver(() => {
    if (body.classList.contains('site-ready')) {
      readyObserver.disconnect();
      startHeroAutoplay();
    }
  });
  readyObserver.observe(body, { attributes: true, attributeFilter: ['class'] });
}

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
