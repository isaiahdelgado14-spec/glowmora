// Mark JS as available so reveal animations can safely hide elements
document.documentElement.classList.add('js');

// ---------- Sticky header shadow ----------
const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 10);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// ---------- Mobile menu ----------
const navToggle = document.querySelector('.nav-toggle');
navToggle.addEventListener('click', () => {
  const open = document.body.classList.toggle('nav-open');
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});

document.querySelectorAll('.nav-links a').forEach((link) =>
  link.addEventListener('click', () => {
    document.body.classList.remove('nav-open');
    navToggle.setAttribute('aria-expanded', 'false');
  })
);

// ---------- Scroll-in reveals ----------
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => observer.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('visible'));
}

// ---------- Gallery filters (home page only) ----------
const filterBtns = document.querySelectorAll('.filter-btn');
const tiles = document.querySelectorAll('.tile');
filterBtns.forEach((btn) =>
  btn.addEventListener('click', () => {
    filterBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    tiles.forEach((tile) => {
      tile.classList.toggle('hide', filter !== 'all' && tile.dataset.category !== filter);
    });
  })
);

// ---------- Footer year ----------
document.getElementById('year').textContent = new Date().getFullYear();
