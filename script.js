// ════════════════════════════════════════════════════════════
//  Itzfizz – Scroll-Driven Hero Animation
//  Car drives LEFT → RIGHT horizontally as user scrolls down
// ════════════════════════════════════════════════════════════

gsap.registerPlugin(ScrollTrigger);

// ── Element refs ────────────────────────────────────────────
const car      = document.getElementById("car");
const trail    = document.getElementById("trail");
const headline = document.getElementById("valueText");
const letters  = gsap.utils.toArray(".letter:not(.gap)");

// ── Dimensions ──────────────────────────────────────────────
const roadWidth = window.innerWidth;

// Wait for image to load so we get real dimensions
car.addEventListener("load", init);
if (car.complete) init();     // already cached

function init() {
  const carW = car.naturalWidth
    ? (car.naturalWidth / car.naturalHeight) * 190   // preserve aspect ratio
    : 320;

  // How far the car travels across the road
  const endX = roadWidth + carW;   // fully exits right side

  // ── Flip the car to face RIGHT (image is left-facing) ────
  gsap.set(car, { scaleX: -1 });

  // Recalculate on resize
  let letterRects = getLetterRects();
  window.addEventListener("resize", () => { letterRects = getLetterRects(); });

  function getLetterRects() {
    return gsap.utils.toArray(".letter:not(.gap)").map(l => {
      const r = l.getBoundingClientRect();
      return r.left + r.width / 2;   // centre of each letter
    });
  }

  // ── CORE SCROLL ANIMATION ─────────────────────────────────
  // Car drives left → right, pinned to sticky stage
  gsap.to(car, {
    scrollTrigger: {
      trigger:     ".scene",
      start:       "top top",
      end:         "bottom top",
      scrub:       0.6,          // smooth lag = buttery
      pin:         ".stage",
      anticipatePin: 1,
    },
    x:    endX,
    ease: "none",               // linear = 1:1 with scroll

    onUpdate() {
      // Current leading edge of car (left px + full width)
      const carLeft = gsap.getProperty(car, "x");
      const carNose = carLeft + carW;

      // Expand trail to match car's left edge
      const trailEnd = Math.max(0, carLeft);
      gsap.set(trail, { width: trailEnd });

      // Reveal each letter as car nose passes its centre
      letters.forEach((letter, i) => {
        if (carNose >= letterRects[i]) {
          letter.classList.add("revealed");
        } else {
          letter.classList.remove("revealed");
        }
      });
    },
  });

  // ── STAT BOXES – stagger in as scroll progresses ──────────
  const boxes = [
    { id: "#box1", start: 250, end: 450 },
    { id: "#box2", start: 450, end: 650 },
    { id: "#box3", start: 600, end: 800 },
    { id: "#box4", start: 800, end: 1000 },
  ];

  boxes.forEach(({ id, start, end }) => {
    gsap.to(id, {
      scrollTrigger: {
        trigger: ".scene",
        start:  `top+=${start} top`,
        end:    `top+=${end} top`,
        scrub: true,
      },
      opacity: 1,
      y: 0,
      scale: 1,
      ease: "power2.out",
    });
  });
}
