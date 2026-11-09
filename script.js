/* =========================================================
   PERSONAL PORTFOLIO JAVASCRIPT
   ========================================================= */

const CONFIG = {
  githubUsername: "thanujaX",
  repoCount: 6,              // how many repos to show
  hideForks: true,           // hide forked repos
  cacheMinutes: 30,          // avoid GitHub API rate limit (60 req/hour)

  projects: [
    {
      type: "Web Application",
      title: "Smart Water Quality Monitoring",
      description: "A responsive monitoring dashboard concept that presents water-quality readings in a clear visual format and supports better decision making for aquaculture farming. The interface is designed around readable data, alerts and simple user actions.",
      role: "Frontend Developer",
      stack: "HTML · CSS · JavaScript",
      focus: "Monitoring UI"
    },
    {
      type: "Frontend Project",
      title: "Personal Portfolio",
      description: "A responsive personal portfolio created to demonstrate semantic HTML, modern CSS, JavaScript interactivity, accessibility, responsive layouts and a public API integration.",
      role: "Designer & Developer",
      stack: "HTML · CSS · JavaScript",
      focus: "UI / UX"
    },
    {
      type: "Application",
      title: "Student Management System",
      description: "An academic application concept for managing student information, courses and results. The project focuses on structured data, CRUD operations and a straightforward user experience.",
      role: "Developer",
      stack: "Java · MySQL",
      focus: "Data Management"
    }
  ]
};

/* ---------- Safe localStorage helpers ---------- */
function safeGet(key) { try { return localStorage.getItem(key); } catch { return null; } }
function safeSet(key, val) { try { localStorage.setItem(key, val); } catch { /* ignore */ } }

/* ---------- Mobile navigation ---------- */
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
});

document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

/* ---------- Dark / Light theme ---------- */
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  safeSet("portfolio-theme", theme);
  themeIcon.textContent = theme === "dark" ? "☀" : "☾";
  themeToggle.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
}

const savedTheme = safeGet("portfolio-theme");
const preferredDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
setTheme(savedTheme || (preferredDark ? "dark" : "light"));

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  setTheme(current === "dark" ? "light" : "dark");
});

/* ---------- Scroll reveal animation ---------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

/* ---------- Scrollspy navigation ---------- */
const sections = document.querySelectorAll("main section[id]");
const navItems = document.querySelectorAll(".nav-link");

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navItems.forEach(item => item.classList.remove("active"));
      const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (active) active.classList.add("active");
    }
  });
}, { rootMargin: "-35% 0px -55% 0px" });

sections.forEach(section => sectionObserver.observe(section));

/* ---------- Project modal ---------- */
const modal = document.getElementById("projectModal");
const modalClose = document.getElementById("modalClose");
const modalTitle = document.getElementById("modalTitle");
const modalType = document.getElementById("modalType");
const modalDescription = document.getElementById("modalDescription");
const modalRole = document.getElementById("modalRole");
const modalStack = document.getElementById("modalStack");
const modalFocus = document.getElementById("modalFocus");
let lastFocused = null;

function openProject(index) {
  const project = CONFIG.projects[index];
  if (!project) return;

  lastFocused = document.activeElement;
  modalType.textContent = project.type;
  modalTitle.textContent = project.title;
  modalDescription.textContent = project.description;
  modalRole.textContent = project.role;
  modalStack.textContent = project.stack;
  modalFocus.textContent = project.focus;

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  modalClose.focus();
}

function closeProject() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  if (lastFocused) lastFocused.focus();   // return focus (accessibility)
}

document.querySelectorAll(".project-detail-btn").forEach(button => {
  button.addEventListener("click", () => openProject(Number(button.dataset.project)));
});

modalClose.addEventListener("click", closeProject);
document.querySelector("[data-close-modal]").addEventListener("click", closeProject);

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && modal.classList.contains("open")) closeProject();
});

/* ---------- GitHub public API ---------- */
const repoGrid = document.getElementById("repoGrid");

// Colours for the most common languages
const LANG_COLORS = {
  JavaScript: "#f1e05a", TypeScript: "#3178c6", HTML: "#e34c26", CSS: "#563d7c",
  Java: "#b07219", Python: "#3572a5", C: "#888888", "C++": "#f34b7d",
  "C#": "#178600", PHP: "#4f5d95", Kotlin: "#a97bff", Dart: "#00b4ab", Shell: "#89e051"
};

function escapeHTML(value) {
  const div = document.createElement("div");
  div.textContent = value ?? "";
  return div.innerHTML;
}

function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);
  const units = [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60]];
  for (const [name, size] of units) {
    const n = Math.floor(seconds / size);
    if (n >= 1) return `${n} ${name}${n > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

function showSkeletons(count = 3) {
  repoGrid.setAttribute("aria-busy", "true");
  repoGrid.innerHTML = Array.from({ length: count }, () =>
    `<div class="repo-card skeleton" aria-hidden="true"><span></span><span></span><span></span></div>`
  ).join("");
}

function showRepoMessage(message, withLink = true) {
  repoGrid.setAttribute("aria-busy", "false");
  const link = withLink
    ? `<br><a class="repo-fallback-link" href="https://github.com/${encodeURIComponent(CONFIG.githubUsername)}" target="_blank" rel="noopener noreferrer">Visit my GitHub profile ↗</a>`
    : "";
  repoGrid.innerHTML = `<div class="loading-card">${escapeHTML(message)}${link}</div>`;
}

function renderRepos(repos) {
  repoGrid.setAttribute("aria-busy", "false");
  repoGrid.innerHTML = repos.map(repo => {
    const description = repo.description || "No description added yet.";
    const language = repo.language || "Code";
    const color = LANG_COLORS[repo.language] || "var(--accent)";
    const topics = (repo.topics || []).slice(0, 3)
      .map(t => `<span>${escapeHTML(t)}</span>`).join("");

    return `
      <a class="repo-card" href="${escapeHTML(repo.html_url)}" target="_blank" rel="noopener noreferrer">
        <div class="repo-top">
          <span class="repo-icon">◈</span>
          <span class="repo-icon">↗</span>
        </div>
        <h3>${escapeHTML(repo.name)}</h3>
        <p>${escapeHTML(description)}</p>
        ${topics ? `<div class="repo-topics">${topics}</div>` : ""}
        <div class="repo-meta">
          <span><strong style="color:${color}">●</strong> ${escapeHTML(language)}</span>
          <span>★ ${repo.stargazers_count}</span>
          <span>⑂ ${repo.forks_count}</span>
          <span class="repo-updated">${timeAgo(repo.pushed_at || repo.updated_at)}</span>
        </div>
      </a>`;
  }).join("");
}

async function loadGitHubRepos() {
  const username = (CONFIG.githubUsername || "").trim();

  if (!username) {
    showRepoMessage("Add your GitHub username in CONFIG.githubUsername inside script.js.", false);
    return;
  }

  const cacheKey = `gh-repos-${username}`;

  // 1) Use cached data if it is still fresh
  try {
    const cached = JSON.parse(sessionStorage.getItem(cacheKey) || "null");
    if (cached && Date.now() - cached.time < CONFIG.cacheMinutes * 60000) {
      renderRepos(cached.repos);
      return;
    }
  } catch { /* ignore broken cache */ }

  showSkeletons(3);

  // 2) Fetch from the real GitHub API (api.github.com — NOT github.com)
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=pushed&direction=desc&per_page=30`,
      { signal: controller.signal, headers: { Accept: "application/vnd.github+json" } }
    );

    if (response.status === 404) throw new Error("not-found");
    if (response.status === 403) throw new Error("rate-limit");
    if (!response.ok) throw new Error("http-" + response.status);

    let repos = await response.json();
    if (CONFIG.hideForks) repos = repos.filter(r => !r.fork);
    repos = repos.slice(0, CONFIG.repoCount);

    if (!repos.length) {
      showRepoMessage("No public repositories to show yet — more coming soon!");
      return;
    }

    try { sessionStorage.setItem(cacheKey, JSON.stringify({ time: Date.now(), repos })); } catch { /* ignore */ }
    renderRepos(repos);
  } catch (error) {
    const messages = {
      "not-found": "That GitHub username was not found. Check CONFIG.githubUsername in script.js.",
      "rate-limit": "GitHub's request limit was reached for now. Please try again in a little while."
    };
    showRepoMessage(
      error.name === "AbortError"
        ? "GitHub took too long to respond. Please try again later."
        : messages[error.message] || "Repositories could not be loaded right now. Check your internet connection."
    );
  } finally {
    clearTimeout(timeout);
  }
}

loadGitHubRepos();
