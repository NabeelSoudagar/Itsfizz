// ════════════════════════════════════════════════════════════
//  Itzfizz – Scroll-Driven Hero Animation
//  Car drives LEFT → RIGHT horizontally as user scrolls down
// ════════════════════════════════════════════════════════════

gsap.registerPlugin(ScrollTrigger);

// ── Element refs ────────────────────────────────────────────
const car      = document.getElementById("car");
const trail    = document.getElementById("trail");
const letters  = gsap.utils.toArray(".letter:not(.gap)");

// ── Use window load for guaranteed reliability ───────────────
// (fires after ALL resources including images are loaded)
window.addEventListener("load", init);

function init() {
  // ── Dimensions ──────────────────────────────────────────────
  const roadWidth = window.innerWidth;

  // Get car width from rendered size (fallback to 320px)
  const carH = 190;
  const carW = car.offsetWidth > 0 ? car.offsetWidth : 320;
  const endX = roadWidth + carW;   // car travels full road + exits right

  // ── Flip the car to face RIGHT (image is left-facing) ────────
  gsap.set(car, { scaleX: -1 });

  // ── Letter positions ─────────────────────────────────────────
  let letterRects = getLetterRects();
  window.addEventListener("resize", () => {
    letterRects = getLetterRects();
    ScrollTrigger.refresh();
  });

  function getLetterRects() {
    return gsap.utils.toArray(".letter:not(.gap)").map(l => {
      const r = l.getBoundingClientRect();
      return r.left + r.width / 2;
    });
  }

  // ══════════════════════════════════════════════════════════
  //  CORE: Car drives left → right, scrubbed to scroll
  // ══════════════════════════════════════════════════════════
  gsap.to(car, {
    scrollTrigger: {
      trigger:       ".scene",
      start:         "top top",
      end:           "bottom top",
      scrub:         0.6,
      pin:           ".stage",
      anticipatePin: 1,
    },
    x:    endX,
    ease: "none",

    onUpdate() {
      const carLeft = gsap.getProperty(car, "x");
      const carNose = carLeft + carW;

      // Expand trail behind the car
      gsap.set(trail, { width: Math.max(0, carLeft) });

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

  // ══════════════════════════════════════════════════════════
  //  STAT BOXES – fade in staggered on scroll
  // ══════════════════════════════════════════════════════════
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
        start:   `top+=${start} top`,
        end:     `top+=${end} top`,
        scrub:   true,
      },
      opacity: 1,
      y:       0,
      scale:   1,
      ease:    "power2.out",
    });
  });
}
