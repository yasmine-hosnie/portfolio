/* Interactivity:
 - Theme toggle (persisted)
 - Mobile menu
 - Reveal on scroll
 - Projects: inject freshcart then fetch rest (exclude duplicate)
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
themeToggle.addEventListener("click", toggleTheme);

/* Mobile nav */
const hamburger = document.getElementById("hamburger");
const mobileNav = document.getElementById("mobile-nav");
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
  { threshold: 0.12 }
);
revealEls.forEach((el) => observer.observe(el));

/* Projects handling */
const projectsGrid = document.getElementById("projects-grid");
const username = "yasmine-hosnie"; // your GitHub username

function createProjectCard(repo) {
  const el = document.createElement("article");
  el.className = "project";
  el.innerHTML = `
    <h3><a href="${repo.html_url}" target="_blank" rel="noopener">${
    repo.name
  }</a></h3>
    <p>${repo.description ? repo.description : ""}</p>
    <div class="project-meta">
      <span><i class="fa-regular fa-star"></i> ${
        repo.stargazers_count || 0
      }</span>
      <span>${
        repo.updated_at ? new Date(repo.updated_at).toLocaleDateString() : ""
      }</span>
    </div>
    ${
      repo.language || repo.topics
        ? `<div class="repo-tech">${repo.language ? repo.language : ""}${
            repo.language && repo.topics ? " · " : ""
          }${repo.topics ? repo.topics.join(", ") : ""}</div>`
        : ""
    }
  `;
  return el;
}

/* inject hard-coded freshcart card first */
function injectFreshCart() {
  const fresh = {
    name: "freshcart",
    html_url: "https://github.com/yasmine-hosnie/freshcart",
    description:
      "E-commerce with React & Tailwind — shopping cart, product listing and checkout UI.",
    stargazers_count: 0,
    updated_at: new Date().toISOString(),
    language: "React / Tailwind",
    topics: [],
  };
  projectsGrid.innerHTML = "";
  projectsGrid.appendChild(createProjectCard(fresh));
}

/* fetch other repos and append (excluding freshcart) */
async function fetchRepos() {
  try {
    const res = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100`
    );
    if (!res.ok) throw new Error("GitHub failed");
    const repos = await res.json();
    const filtered = repos
      .filter((r) => !r.fork && r.name.toLowerCase() !== "freshcart")
      .sort(
        (a, b) =>
          b.stargazers_count - a.stargazers_count ||
          new Date(b.updated_at) - new Date(a.updated_at)
      )
      .slice(0, 6);
    filtered.forEach((r) => projectsGrid.appendChild(createProjectCard(r)));

    const countEl = document.getElementById("projects-count");
    if (countEl)
      countEl.textContent =
        repos.filter((r) => !r.fork).length || filtered.length + 1;
  } catch (err) {
    console.error(err);
    if (projectsGrid) {
      const msg = document.createElement("div");
      msg.className = "loader";
      msg.textContent = "Could not load projects right now.";
      projectsGrid.appendChild(msg);
    }
  }
}

/* Run injection + fetch */
injectFreshCart();
fetchRepos();

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
        headers: { Accept: "application/json" },
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
    mobileNav.style.display = "none";
    mobileNav.setAttribute("aria-hidden", "true");
  }
});
