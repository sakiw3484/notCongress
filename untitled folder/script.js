// House chamber layout: 435 seats in 15 curved rows, split by a center aisle.
const TOTAL_SEATS = 435;
const ROWS = 15;
const ROW_LABELS = "ABCDEFGHIJKLMNO".split("");
const MAX_SEATS = 8;

// Coordinate space used for layout (converted to % so it scales fluidly)
const W = 1000;
const H = 560;
const CENTER_X = W / 2;
const CENTER_Y = 540;
const R_MIN = 140;
const R_MAX = 480;
const AISLE_DEG = 6;    // gap on each side of the center
const SPREAD_DEG = 88;  // how far around each side the seats go

const chamber = document.getElementById("chamber");
const scroller = document.getElementById("chamber-scroll");
const seatList = document.getElementById("seat-list");
const countEl = document.getElementById("count");
const totalEl = document.getElementById("total");
const hintEl = document.getElementById("hint");
const confirmBtn = document.getElementById("confirm");
const clearBtn = document.getElementById("clear");
const modal = document.getElementById("modal");
const modalText = document.getElementById("modal-text");
const modalClose = document.getElementById("modal-close");
const zoomIn = document.getElementById("zoom-in");
const zoomOut = document.getElementById("zoom-out");
const zoomReset = document.getElementById("zoom-reset");

const selected = new Map(); // id -> { id, price, el }

// Seeded random so the "taken" seats are the same every load
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(1789);

function priceFor(rowIndex) {
  if (rowIndex <= 2) return 30;   // A-C
  if (rowIndex <= 9) return 20;   // D-J
  return 12;                      // K-O
}

// Work out how many seats go in each row (longer outer rows get more),
// so that the total is exactly 435.
function computeRows() {
  const radii = Array.from({ length: ROWS }, (_, i) => R_MIN + (i * (R_MAX - R_MIN)) / (ROWS - 1));
  const sumR = radii.reduce((a, b) => a + b, 0);
  const counts = radii.map((r) => Math.floor((TOTAL_SEATS * r) / sumR));
  let remainder = TOTAL_SEATS - counts.reduce((a, b) => a + b, 0);
  for (let i = ROWS - 1; remainder > 0; i = i === 0 ? ROWS - 1 : i - 1) {
    counts[i]++;
    remainder--;
  }
  return radii.map((radius, i) => ({ radius, count: counts[i] }));
}

function buildChamber() {
  const frag = document.createDocumentFragment();

  computeRows().forEach(({ radius, count }, r) => {
    const label = ROW_LABELS[r];
    const left = Math.ceil(count / 2);
    const right = count - left;

    [-1, 1].forEach((side) => {
      const perSide = side === -1 ? left : right;
      for (let k = 0; k < perSide; k++) {
        const t = (k + 0.5) / perSide;
        const deg = AISLE_DEG + t * (SPREAD_DEG - AISLE_DEG);
        const rad = (deg * Math.PI) / 180;
        const x = CENTER_X + side * radius * Math.sin(rad);
        const y = CENTER_Y - radius * Math.cos(rad);

        // Number seats left-to-right across the whole row
        const num = side === -1 ? left - k : left + k + 1;
        const id = `${label}${num}`;
        const price = priceFor(r);

        const seat = document.createElement("button");
        seat.className = "seat";
        seat.style.left = (x / W) * 100 + "%";
        seat.style.top = (y / H) * 100 + "%";
        seat.dataset.id = id;
        seat.dataset.price = price;
        seat.textContent = id;
        seat.setAttribute("aria-label", `Seat ${id}, $${price}`);
        seat.dataset.tip = `${id} · $${price}`;

        if (rand() < 0.28) {
          seat.classList.add("taken");
          seat.disabled = true;
          seat.dataset.tip = `${id} · taken`;
        }

        frag.appendChild(seat);
      }
    });
  });

  chamber.appendChild(frag);
}

// One listener for all 435 seats
chamber.addEventListener("click", (e) => {
  const seat = e.target.closest(".seat");
  if (seat && !seat.disabled) toggleSeat(seat);
});

function toggleSeat(seat) {
  const id = seat.dataset.id;

  if (selected.has(id)) {
    selected.delete(id);
    seat.classList.remove("selected");
  } else {
    if (selected.size >= MAX_SEATS) {
      seat.classList.add("shake");
      setTimeout(() => seat.classList.remove("shake"), 300);
      hintEl.textContent = `You can pick up to ${MAX_SEATS} seats.`;
      return;
    }
    selected.set(id, { id, price: Number(seat.dataset.price), el: seat });
    seat.classList.add("selected");
  }
  render();
}

function render() {
  seatList.innerHTML = "";
  let total = 0;

  [...selected.values()]
    .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
    .forEach((s) => {
      total += s.price;
      const li = document.createElement("li");
      li.innerHTML = `<span>Seat <strong>${s.id}</strong></span><span>$${s.price}
        <button aria-label="Remove seat ${s.id}">&times;</button></span>`;
      li.querySelector("button").addEventListener("click", () => toggleSeat(s.el));
      seatList.appendChild(li);
    });

  countEl.textContent = selected.size;
  totalEl.textContent = "$" + total;
  confirmBtn.disabled = clearBtn.disabled = selected.size === 0;
  hintEl.textContent =
    selected.size === 0
      ? `Click a seat to select it. Max ${MAX_SEATS} seats.`
      : `${MAX_SEATS - selected.size} more seat(s) allowed.`;
}

clearBtn.addEventListener("click", () => {
  selected.forEach((s) => s.el.classList.remove("selected"));
  selected.clear();
  render();
});

confirmBtn.addEventListener("click", () => {
  const ids = [...selected.keys()].join(", ");
  modalText.textContent = `You reserved ${selected.size} seat(s): ${ids}. Total: ${totalEl.textContent}.`;
  modal.hidden = false;

  selected.forEach((s) => {
    s.el.classList.remove("selected");
    s.el.classList.add("taken");
    s.el.disabled = true;
    s.el.dataset.tip = `${s.id} · taken`;
  });
  selected.clear();
  render();
});

modalClose.addEventListener("click", () => (modal.hidden = true));
modal.addEventListener("click", (e) => { if (e.target === modal) modal.hidden = true; });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") modal.hidden = true; });

// ---- Zoom (handy with 435 seats, essential on phones) ----
const ZOOM_LEVELS = [1, 1.5, 2, 3, 4];
let zoomIndex = window.innerWidth < 640 ? 1 : 0;

function applyZoom() {
  chamber.style.setProperty("--zoom", ZOOM_LEVELS[zoomIndex]);
  zoomOut.disabled = zoomIndex === 0;
  zoomIn.disabled = zoomIndex === ZOOM_LEVELS.length - 1;
  // keep the view centered on the chamber
  scroller.scrollLeft = (scroller.scrollWidth - scroller.clientWidth) / 2;
}
zoomIn.addEventListener("click", () => { zoomIndex = Math.min(zoomIndex + 1, ZOOM_LEVELS.length - 1); applyZoom(); });
zoomOut.addEventListener("click", () => { zoomIndex = Math.max(zoomIndex - 1, 0); applyZoom(); });
zoomReset.addEventListener("click", () => { zoomIndex = 0; applyZoom(); });

buildChamber();
render();
applyZoom();
