import { converters, format } from "./converter.js";

// --- Theme System -----------------------------------------

const themeToggle = document.getElementById("themeToggle");
const root = document.documentElement;

// Load saved theme
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  root.classList.add("dark");
  themeToggle.textContent = "☀️";
}

// Toggle theme
themeToggle.addEventListener("click", () => {
  const isDark = root.classList.toggle("dark");
  themeToggle.textContent = isDark ? "☀️" : "🌙";
  localStorage.setItem("theme", isDark ? "dark" : "light");
});


const input = document.getElementById("valueInput");
const grid = document.getElementById("conversionGrid");
const button = document.getElementById("convertBtn");

// Build cards dynamically
function buildCards() {
  grid.innerHTML = "";

  Object.entries(converters).forEach(([key, cfg]) => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="card-header">
        <div class="card-title">${cfg.label}</div>
        <div class="card-tag">${cfg.units[0]} ⇄ ${cfg.units[1]}</div>
      </div>
      <div class="card-body" id="${key}Result"></div>
    `;

    grid.appendChild(card);
  });
}

function convertAll() {
  const base = parseFloat(input.value);
  if (isNaN(base)) return;

  Object.entries(converters).forEach(([key, cfg]) => {
    const result = cfg.convert(base);

    const html = `
      <strong>${format(base)}</strong> ${cfg.units[0]} =
      <strong>${format(result.metricToImperial)}</strong> ${cfg.units[1]}
      <span class="sep">|</span>
      <strong>${format(base)}</strong> ${cfg.units[1]} =
      <strong>${format(result.imperialToMetric)}</strong> ${cfg.units[0]}
    `;

    document.getElementById(`${key}Result`).innerHTML = html;
  });
}

button.addEventListener("click", convertAll);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") convertAll();
});

// Initialize
buildCards();
convertAll();
