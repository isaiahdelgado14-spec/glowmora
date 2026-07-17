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

// ---------- Gallery (rendered from data/gallery.json, editable in Pages CMS) ----------
// Small HTML-escaper so CMS-entered text can never break the markup.
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
const galleryGrid = document.getElementById('gallery-grid');
if (galleryGrid) {
  fetch('data/gallery.json', { cache: 'no-store' })
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      const photos = data && Array.isArray(data.photos) ? data.photos : null;
      if (!photos || !photos.length) return; // no data → keep the fallback tiles
      const html = photos
        .map((p) => {
          const src = String(p.image || '').replace(/^\//, ''); // keep paths relative
          if (!src) return '';
          const title = escapeHtml(p.title || '');
          const category = escapeHtml(p.category || '');
          const alt = escapeHtml(p.alt || p.title || '');
          return (
            '<figure class="tile reveal visible">' +
            '<img class="tile-art" src="' + escapeHtml(src) + '" alt="' + alt + '" loading="lazy">' +
            '<figcaption><strong>' + title + '</strong><span>' + category + '</span></figcaption>' +
            '</figure>'
          );
        })
        .join('');
      if (html) galleryGrid.innerHTML = html;
    })
    .catch(() => {}); // network/JSON error → the fallback tiles stay
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

// ---------- New-client offer popup ----------
const offerModal = document.getElementById('offer-modal');
if (offerModal) {
  const OFFER_KEY = 'glowmora-offer-signup'; // set ONLY after they sign up — so it keeps showing until then
  const openOffer = () => {
    offerModal.hidden = false;
    document.body.style.overflow = 'hidden';
  };
  const closeOffer = () => {
    offerModal.hidden = true;
    document.body.style.overflow = '';
    // NOTE: closing does NOT set the flag, so it shows again next visit until they sign up
  };
  // Show 2s after page load on EVERY visit, until they sign up
  if (!localStorage.getItem(OFFER_KEY)) {
    setTimeout(openOffer, 2000);
  }
  offerModal
    .querySelectorAll('[data-offer-close]')
    .forEach((el) => el.addEventListener('click', closeOffer));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !offerModal.hidden) closeOffer();
  });
  // Submit to BOTH MailerLite (so signups land in the email list) and Netlify
  // Forms (a same-origin backup copy), then show the success state — no reload.
  const offerForm = offerModal.querySelector('.offer-form');
  const offerSuccess = offerModal.querySelector('.offer-success');
  // MailerLite "GlowMora Website Signups" form → group "Website Signups"
  const ML_ENDPOINT =
    'https://assets.mailerlite.com/jsonp/2476666/forms/191552524344362035/subscribe';
  offerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(offerForm);
    const name = (data.get('name') || '').toString().trim();
    const email = (data.get('email') || '').toString().trim();
    const phone = (data.get('phone') || '').toString().trim();

    // 1) Add the subscriber to MailerLite. It's a cross-origin request, so we
    //    fire it "no-cors" (the data still arrives; we just can't read the reply).
    //    name/email/phone map to MailerLite's standard subscriber fields.
    fetch(ML_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        'fields[name]': name,
        'fields[email]': email,
        'fields[phone]': phone,
        'ml-submit': '1',
        anticsrf: 'true',
      }).toString(),
    }).catch(() => {});

    // 2) Keep a backup copy in Netlify Forms (same-origin, safe to await-less).
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(data).toString(),
    }).catch(() => {});

    // 3) Show the success message right away.
    offerForm.hidden = true;
    offerSuccess.hidden = false;
    localStorage.setItem(OFFER_KEY, '1');
  });
}
