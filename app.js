import { converters, format, getConversion } from "./converter.js";

// --- Theme System -----------------------------------------

const themeToggle = document.getElementById("themeToggle");
const root = document.documentElement;

function syncThemeToggle(isDark) {
  themeToggle.textContent = isDark ? "☀️" : "🌙";
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.setAttribute("aria-label", isDark ? "Enable light mode" : "Enable dark mode");
}

// Load saved theme
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  root.classList.add("dark");
}

syncThemeToggle(root.classList.contains("dark"));

// Toggle theme
themeToggle.addEventListener("click", () => {
  const isDark = root.classList.toggle("dark");
  syncThemeToggle(isDark);
  localStorage.setItem("theme", isDark ? "dark" : "light");
});


const input = document.getElementById("valueInput");
const grid = document.getElementById("conversionGrid");
const button = document.getElementById("convertBtn");
const cardElements = new Map();

function createDirectionButton(label, direction, onSelect) {
  const buttonElement = document.createElement("button");
  buttonElement.type = "button";
  buttonElement.className = "direction-btn";
  buttonElement.textContent = label;
  buttonElement.dataset.direction = direction;
  buttonElement.addEventListener("click", () => onSelect(direction));
  return buttonElement;
}

function setActiveDirection(cardState, direction) {
  cardState.direction = direction;

  cardState.directionButtons.forEach((buttonElement) => {
    const isActive = buttonElement.dataset.direction === direction;
    buttonElement.classList.toggle("is-active", isActive);
    buttonElement.setAttribute("aria-pressed", String(isActive));
  });
}

// Build cards dynamically
function buildCards() {
  grid.replaceChildren();
  cardElements.clear();

  Object.entries(converters).forEach(([key, cfg]) => {
    const card = document.createElement("div");
    card.className = "card";

    const header = document.createElement("div");
    header.className = "card-header";

    const title = document.createElement("div");
    title.className = "card-title";
    title.textContent = cfg.label;

    const tag = document.createElement("div");
    tag.className = "card-tag";
    tag.textContent = `${cfg.units[0]} ⇄ ${cfg.units[1]}`;

    header.append(title, tag);

    const controls = document.createElement("div");
    controls.className = "direction-group";
    controls.setAttribute("role", "group");
    controls.setAttribute("aria-label", `${cfg.label} conversion direction`);

    const resultBody = document.createElement("div");
    resultBody.className = "card-body";
    resultBody.id = `${key}Result`;
    resultBody.setAttribute("role", "status");
    resultBody.setAttribute("aria-live", "polite");

    const primaryLine = document.createElement("p");
    primaryLine.className = "result-line";

    const inputValue = document.createElement("strong");
    const inputUnit = document.createElement("span");
    const equalsText = document.createElement("span");
    equalsText.textContent = " = ";
    const outputValue = document.createElement("strong");
    const outputUnit = document.createElement("span");

    primaryLine.append(inputValue, document.createTextNode(" "), inputUnit, equalsText, outputValue, document.createTextNode(" "), outputUnit);

    const secondaryLine = document.createElement("p");
    secondaryLine.className = "result-line result-line-secondary";

    const reverseLabel = document.createElement("span");
    reverseLabel.className = "result-label";
    reverseLabel.textContent = "Reverse";
    const reverseValue = document.createElement("span");

    secondaryLine.append(reverseLabel, document.createTextNode(": "), reverseValue);
    resultBody.append(primaryLine, secondaryLine);

    const cardState = {
      cfg,
      direction: "metricToImperial",
      directionButtons: [],
      nodes: {
        inputValue,
        inputUnit,
        outputValue,
        outputUnit,
        reverseValue,
      },
    };

    const metricToImperialButton = createDirectionButton(
      `${cfg.units[0]} → ${cfg.units[1]}`,
      "metricToImperial",
      (direction) => {
        setActiveDirection(cardState, direction);
        convertAll();
      }
    );
    const imperialToMetricButton = createDirectionButton(
      `${cfg.units[1]} → ${cfg.units[0]}`,
      "imperialToMetric",
      (direction) => {
        setActiveDirection(cardState, direction);
        convertAll();
      }
    );

    cardState.directionButtons = [metricToImperialButton, imperialToMetricButton];
    setActiveDirection(cardState, cardState.direction);

    controls.append(metricToImperialButton, imperialToMetricButton);
    card.append(header, controls, resultBody);

    grid.appendChild(card);
    cardElements.set(key, cardState);
  });
}

function convertAll() {
  const base = parseFloat(input.value);
  if (isNaN(base)) return;

  cardElements.forEach((cardState) => {
    const active = getConversion(cardState.cfg, base, cardState.direction);
    const reverseDirection = cardState.direction === "metricToImperial" ? "imperialToMetric" : "metricToImperial";
    const reverse = getConversion(cardState.cfg, base, reverseDirection);

    cardState.nodes.inputValue.textContent = format(active.inputValue);
    cardState.nodes.inputUnit.textContent = active.inputUnit;
    cardState.nodes.outputValue.textContent = format(active.outputValue);
    cardState.nodes.outputUnit.textContent = active.outputUnit;
    cardState.nodes.reverseValue.textContent = `${format(reverse.inputValue)} ${reverse.inputUnit} = ${format(reverse.outputValue)} ${reverse.outputUnit}`;
  });
}

button.addEventListener("click", convertAll);
input.addEventListener("input", convertAll);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") convertAll();
});

// Initialize
buildCards();
convertAll();
