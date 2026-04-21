const toggle = document.querySelector(".mobile-toggle");
const navLinks = document.querySelector(".nav-links");

if (toggle && navLinks) {
  toggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });
}

const transitionLayer = document.createElement("div");
transitionLayer.className = "page-transition";
document.body.appendChild(transitionLayer);

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const HOME_PATHS = new Set(["/", "/index.html"]);
const INTRO_SKIP_PARAM = "_intro";
const connection =
  navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
const isSafariBrowser =
  typeof navigator !== "undefined" &&
  /Safari/i.test(navigator.userAgent) &&
  !/Chrome|CriOS|Chromium|Edg|OPR|Firefox|FxiOS|Android/i.test(navigator.userAgent);

if (isSafariBrowser) {
  document.documentElement.classList.add("is-safari");
}

function shouldUseLiteMotionByHints() {
  if (prefersReducedMotion) {
    return true;
  }

  if (connection && connection.saveData) {
    return true;
  }

  if (typeof navigator.deviceMemory === "number" && navigator.deviceMemory <= 4) {
    return true;
  }

  if (typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4) {
    return true;
  }

  return false;
}

function measureFramePacing(sampleCount = 12) {
  return new Promise((resolve) => {
    if (typeof window.requestAnimationFrame !== "function") {
      resolve(false);
      return;
    }

    const deltas = [];
    let previousTime = null;

    const step = (timestamp) => {
      if (previousTime !== null) {
        deltas.push(timestamp - previousTime);
      }

      previousTime = timestamp;

      if (deltas.length >= sampleCount) {
        const averageDelta = deltas.reduce((sum, value) => sum + value, 0) / deltas.length;
        const slowFrames = deltas.filter((value) => value > 24).length;
        resolve(averageDelta > 19.5 || slowFrames >= 3);
        return;
      }

      window.requestAnimationFrame(step);
    };

    window.requestAnimationFrame(step);
  });
}

const liteMotionPromise = (async () => {
  if (prefersReducedMotion) {
    return true;
  }

  if (isSafariBrowser) {
    return false;
  }

  if (shouldUseLiteMotionByHints()) {
    return true;
  }

  return measureFramePacing();
})();

liteMotionPromise.then((useLiteMotion) => {
  if (useLiteMotion) {
    document.documentElement.classList.add("is-lite-motion");
  }
});

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");

  if (!link) {
    return;
  }

  const href = link.getAttribute("href");

  if (
    !href ||
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    link.target === "_blank" ||
    link.hasAttribute("download") ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }

  const nextUrl = new URL(link.href, window.location.href);

  if (nextUrl.origin !== window.location.origin) {
    return;
  }

  if (
    nextUrl.pathname === window.location.pathname &&
    nextUrl.search === window.location.search &&
    nextUrl.hash === window.location.hash
  ) {
    return;
  }

  if (nextUrl.pathname === window.location.pathname && nextUrl.hash) {
    return;
  }

  if (HOME_PATHS.has(nextUrl.pathname)) {
    nextUrl.searchParams.set(INTRO_SKIP_PARAM, "0");
  }

  event.preventDefault();
  document.body.classList.add("page-leaving");

  window.setTimeout(() => {
    window.location.href = nextUrl.href;
  }, 220);
});

const revealSelectors = [
  ".split > div",
  ".card",
  ".quote",
  ".cred-card",
  ".info-item",
  ".pubs-list li",
  ".blog-card",
  ".symptom-card",
  ".blog-sources",
  ".notice",
  ".condition-list-card",
  ".cta-banner",
];

const revealElements = Array.from(
  new Set(
    revealSelectors.flatMap((selector) => Array.from(document.querySelectorAll(selector)))
  )
);

if ("IntersectionObserver" in window && !prefersReducedMotion) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.08,
      rootMargin: "0px 0px -4% 0px",
    }
  );

  revealElements.forEach((element, index) => {
    element.classList.add("reveal-item");
    element.style.setProperty("--reveal-delay", `${(index % 4) * 32}ms`);
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach((element) => {
    element.classList.add("is-visible");
  });
}

const isHomePage = HOME_PATHS.has(window.location.pathname);
const currentUrl = new URL(window.location.href);
const skipHomeIntro = currentUrl.searchParams.get(INTRO_SKIP_PARAM) === "0";

const navigationEntries = performance.getEntriesByType("navigation");
const navigationType =
  navigationEntries.length > 0
    ? navigationEntries[0].type
    : performance.navigation && performance.navigation.type === 1
      ? "reload"
      : "navigate";

if (isHomePage && skipHomeIntro) {
  currentUrl.searchParams.delete(INTRO_SKIP_PARAM);
  const cleanedPath =
    currentUrl.pathname +
    (currentUrl.searchParams.toString() ? `?${currentUrl.searchParams.toString()}` : "") +
    currentUrl.hash;
  window.history.replaceState({}, "", cleanedPath);
}

liteMotionPromise.then(() => {
  if (
    !isHomePage ||
    prefersReducedMotion ||
    skipHomeIntro ||
    (navigationType !== "reload" && navigationType !== "navigate")
  ) {
    return;
  }

  const intro = document.createElement("div");
  intro.className = "site-intro";
  intro.setAttribute("aria-hidden", "true");
  intro.innerHTML = `
    <div class="site-intro-inner">
      <div class="site-intro-mark">
        <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
          <path d="M12 5c-4.6 0-8.6 3-10 7 1.4 4 5.4 7 10 7s8.6-3 10-7c-1.4-4-5.4-7-10-7zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-2.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" fill="currentColor"></path>
        </svg>
      </div>
      <div class="site-intro-title">Ali R. Salman, MD</div>
      <div class="site-intro-subtitle">Medical and surgical retina care for Northern Virginia, Southern Maryland, and Washington, D.C.</div>
      <div class="site-intro-line"></div>
    </div>
  `;

  document.body.appendChild(intro);

  window.setTimeout(() => {
    intro.classList.add("is-hidden");
  }, 2200);

  window.setTimeout(() => {
    intro.remove();
  }, 5300);
});
