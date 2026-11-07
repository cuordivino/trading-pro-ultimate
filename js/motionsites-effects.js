/**
 * TRADING PRO ULTIMATE™ × cuordivino — MOTIONSITES INTERACTION ENGINE (v2.0)
 * Signature: © La_mEnte_arDente
 *
 * ZERO-REGRESSION GUARANTEE:
 * - Purely additive visual enhancer (Spotlight Reveal + Subtle Quantum Ambient Particles).
 * - Never modifies existing DOM IDs, values, event handlers, WebSockets, or calculations.
 * - Wrapped in try/catch and passive listeners so it can never block the main trading thread.
 */

(function () {
  "use strict";

  const CARD_SELECTORS = [
    ".card",
    ".signal-card",
    ".panel",
    ".terminal-panel",
    ".module-box",
    "[class*='card']",
    "[class*='panel']",
    "[class*='widget']"
  ].join(", ");

  function bindSpotlightCards() {
    try {
      const elements = document.querySelectorAll(CARD_SELECTORS);
      elements.forEach((el) => {
        if (el.dataset.msSpotlightBound === "true") return;
        el.dataset.msSpotlightBound = "true";
        el.classList.add("ms-liquid-card");

        el.addEventListener(
          "mousemove",
          (e) => {
            const rect = el.getBoundingClientRect();
            el.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
            el.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
          },
          { passive: true }
        );
      });

      const buttonsAndTabs = document.querySelectorAll("button, a, [role='tab'], div[onclick]");
      buttonsAndTabs.forEach((btn) => {
        if (
          btn.textContent &&
          btn.textContent.includes("Market Quantum Co-Pilot") &&
          !btn.classList.contains("ms-quantum-highlight")
        ) {
          btn.classList.add("ms-quantum-highlight");
        }
      });
    } catch (err) {
      // Fail silently
    }
  }

  function initAmbientQuantumCanvas() {
    try {
      if (document.getElementById("ms-ambient-canvas")) return;
      const canvas = document.createElement("canvas");
      canvas.id = "ms-ambient-canvas";
      document.body.prepend(canvas);

      const ctx = canvas.getContext("2d");
      let width = (canvas.width = window.innerWidth);
      let height = (canvas.height = window.innerHeight);

      window.addEventListener(
        "resize",
        () => {
          width = canvas.width = window.innerWidth;
          height = canvas.height = window.innerHeight;
        },
        { passive: true }
      );

      const particleCount = Math.min(28, Math.floor(width / 55));
      const particles = Array.from({ length: particleCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        radius: Math.random() * 1.4 + 0.6,
        isGold: Math.random() > 0.65
      }));

      function render() {
        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.isGold
            ? "rgba(251, 191, 36, 0.35)"
            : "rgba(56, 189, 248, 0.30)";
          ctx.fill();
        }
        requestAnimationFrame(render);
      }

      requestAnimationFrame(render);
    } catch (err) {
      // Fail silently
    }
  }

  function initMotionSitesUpgrade() {
    bindSpotlightCards();
    initAmbientQuantumCanvas();

    let debounceTimer = null;
    const observer = new MutationObserver(() => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(bindSpotlightCards, 180);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMotionSitesUpgrade);
  } else {
    initMotionSitesUpgrade();
  }
})();
