// Booking page: availability calendar, time slots, and request form.
// "Booked" days/times are demo placeholders generated deterministically —
// connect a real scheduling backend (Calendly, Square, Acuity) to replace them.

const SLOTS = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM',
  '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM',
];
const MONTHS_AHEAD = 5; // how far clients can browse

const monthLabel = document.getElementById('cal-month-label');
const calGrid = document.getElementById('cal-grid');
const prevBtn = document.getElementById('cal-prev');
const nextBtn = document.getElementById('cal-next');
const timesDate = document.getElementById('times-date');
const timesGrid = document.getElementById('times-grid');
const dateInput = document.getElementById('date-input');
const timeSelect = document.getElementById('time-select');

const today = new Date();
today.setHours(0, 0, 0, 0);
let viewYear = today.getFullYear();
let viewMonth = today.getMonth();
let selectedDate = null;
let selectedSlot = null;

// Demo availability: pseudo-random but stable for a given date
const isDayBooked = (y, m, d) => (d * 13 + (m + 1) * 7 + y) % 5 === 0;
const isSlotBooked = (date, slotIndex) => (date.getDate() + slotIndex * 3) % 9 === 0;

const monthName = (y, m) =>
  new Date(y, m, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

const longDate = (date) =>
  date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const shortDate = (date) =>
  date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

// Populate the form's time dropdown once
SLOTS.forEach((slot) => {
  const opt = document.createElement('option');
  opt.textContent = slot;
  timeSelect.appendChild(opt);
});

function monthOffset(y, m) {
  return (y - today.getFullYear()) * 12 + (m - today.getMonth());
}

function renderCalendar() {
  monthLabel.textContent = monthName(viewYear, viewMonth);
  prevBtn.disabled = monthOffset(viewYear, viewMonth) <= 0;
  nextBtn.disabled = monthOffset(viewYear, viewMonth) >= MONTHS_AHEAD;
  calGrid.innerHTML = '';

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  for (let i = 0; i < firstWeekday; i++) {
    const pad = document.createElement('span');
    pad.className = 'day out';
    calGrid.appendChild(pad);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(viewYear, viewMonth, d);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'day';
    btn.textContent = d;

    if (date < today) {
      btn.classList.add('past');
      btn.disabled = true;
    } else if (isDayBooked(viewYear, viewMonth, d)) {
      btn.classList.add('booked');
      btn.disabled = true;
      btn.setAttribute('aria-label', `${longDate(date)} — booked`);
    } else {
      btn.classList.add('open');
      btn.setAttribute('aria-label', `${longDate(date)} — available`);
      if (selectedDate && date.getTime() === selectedDate.getTime()) {
        btn.classList.add('selected');
      }
      btn.addEventListener('click', () => selectDate(date));
    }
    calGrid.appendChild(btn);
  }
}

function selectDate(date) {
  selectedDate = date;
  selectedSlot = null;
  dateInput.value = shortDate(date);
  timeSelect.value = '';
  timesDate.textContent = longDate(date);
  renderCalendar();
  renderSlots();
}

function renderSlots() {
  timesGrid.innerHTML = '';

  if (!selectedDate) {
    const empty = document.createElement('p');
    empty.className = 'times-empty';
    empty.textContent = 'Pick a date on the calendar to see available times.';
    timesGrid.appendChild(empty);
    return;
  }

  SLOTS.forEach((slot, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'slot';
    btn.textContent = slot;

    if (isSlotBooked(selectedDate, i)) {
      btn.disabled = true;
    } else {
      if (slot === selectedSlot) btn.classList.add('selected');
      btn.addEventListener('click', () => selectSlot(slot));
    }
    timesGrid.appendChild(btn);
  });
}

function selectSlot(slot) {
  selectedSlot = slot;
  timeSelect.value = slot;
  renderSlots();
}

prevBtn.addEventListener('click', () => {
  viewMonth--;
  if (viewMonth < 0) { viewMonth = 11; viewYear--; }
  renderCalendar();
});

nextBtn.addEventListener('click', () => {
  viewMonth++;
  if (viewMonth > 11) { viewMonth = 0; viewYear++; }
  renderCalendar();
});

// Keep the calendar/slot UI in sync if the time is picked from the dropdown
timeSelect.addEventListener('change', () => {
  selectedSlot = timeSelect.value;
  renderSlots();
});

// ---------- Inspiration photo: show chosen filename ----------
const photoInput = document.getElementById('photo-input');
const photoLabel = document.getElementById('photo-label');
photoInput.addEventListener('change', () => {
  if (photoInput.files.length) {
    photoLabel.textContent = photoInput.files[0].name;
  }
});

// ---------- Request form ----------
// Front-end demo only: swap in a Formspree/Netlify endpoint to receive real
// requests (see README.md).
const form = document.getElementById('booking-form');
const success = document.querySelector('.form-success');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  form.hidden = true;
  success.hidden = false;
  success.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

renderCalendar();
renderSlots();
