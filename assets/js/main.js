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
    sessionStorage.setItem("skip-home-intro-once", "1");
  } else {
    sessionStorage.removeItem("skip-home-intro-once");
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

const navigationEntries = performance.getEntriesByType("navigation");
const navigationType =
  navigationEntries.length > 0
    ? navigationEntries[0].type
    : performance.navigation && performance.navigation.type === 1
      ? "reload"
      : "navigate";

const skipHomeIntro = sessionStorage.getItem("skip-home-intro-once") === "1";

if (skipHomeIntro) {
  sessionStorage.removeItem("skip-home-intro-once");
}

if (
  isHomePage &&
  !prefersReducedMotion &&
  !skipHomeIntro &&
  (navigationType === "reload" || navigationType === "navigate")
) {
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
}
