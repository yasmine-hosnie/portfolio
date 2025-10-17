/* Interactivity:
  - Theme toggle (persisted)
  - Mobile menu
  - Reveal on scroll
  - Contact Form
*/

/* Helpers */
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

/* Theme toggle */
const THEME_KEY = "yasmeen_theme";
const themeToggle = document.getElementById("theme-toggle");

function setTheme(theme) {
  if (theme === "light") document.body.classList.add("light");
  else document.body.classList.remove("light");
  updateThemeButton();
  localStorage.setItem(THEME_KEY, theme);
}

function getSavedTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) return saved;
  return window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function toggleTheme() {
  const isLight = document.body.classList.toggle("light");
  setTheme(isLight ? "light" : "dark");
}

function updateThemeButton() {
  if (!themeToggle) return;
  if (document.body.classList.contains("light")) {
    themeToggle.innerHTML = '<i class="fa-regular fa-sun"></i>';
    themeToggle.setAttribute("aria-pressed", "true");
  } else {
    themeToggle.innerHTML = '<i class="fa-regular fa-moon"></i>';
    themeToggle.setAttribute("aria-pressed", "false");
  }
}

setTheme(getSavedTheme());
if (themeToggle) {
  themeToggle.addEventListener("click", toggleTheme);
}

/* Mobile nav */
const hamburger = document.getElementById("hamburger");
const mobileNav = document.getElementById("mobile-nav");

if (hamburger && mobileNav) {
  hamburger.addEventListener("click", () => {
    const open = mobileNav.style.display !== "block";
    mobileNav.style.display = open ? "block" : "none";
    mobileNav.setAttribute("aria-hidden", open ? "false" : "true");
  });
  $$(".mobile-link").forEach((l) =>
    l.addEventListener("click", () => {
      mobileNav.style.display = "none";
    })
  );
}

/* Reveal on scroll */
const revealEls = $$(".reveal");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("show");
        observer.unobserve(e.target);
      }
    });
  },
  {
    threshold: 0.12,
  }
);
revealEls.forEach((el) => observer.observe(el));

/* Projects handling (Removed GitHub API fetch logic - now manual in HTML) */
const projectsGrid = document.getElementById("projects-grid");
// Manually setting project count since API fetch is removed
const countEl = document.getElementById("projects-count");
if (countEl) {
  // You can update this number manually based on your actual projects
  countEl.textContent = "10+";
}

/* Contact form (Formspree version) */
const contactForm = document.getElementById("contact-form");
const formNote = document.getElementById("form-note");

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    formNote.textContent = "";
    const name = $("#name").value.trim();
    const email = $("#email").value.trim();
    const message = $("#message").value.trim();

    if (!name || !email || !message) {
      formNote.textContent = "Please complete all fields.";
      return;
    }

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        formNote.textContent = "Message sent successfully!";
        contactForm.reset();
      } else {
        formNote.textContent = "Something went wrong. Please try again.";
      }
    } catch (err) {
      console.error(err);
      formNote.textContent = "Network error. Please try again later.";
    }
  });
}

/* Year in footer */
document.getElementById("year").textContent = new Date().getFullYear();

/* Accessibility: close mobile nav on Escape */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (mobileNav) {
      mobileNav.style.display = "none";
      mobileNav.setAttribute("aria-hidden", "true");
    }
  }
});
