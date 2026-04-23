import { converters, format, getConversion } from "./converter.js";

const THEME_STORAGE_KEY = "theme";
const FILTER_STORAGE_KEY = "converterCategoryFilter";
const DIRECTION_STORAGE_PREFIX = "converterDirection:";

function readStoredValue(storage, key) {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function writeStoredValue(storage, key, value) {
  try {
    storage.setItem(key, value);
  } catch {
    // Ignore unavailable storage and keep the UI working.
  }
}

function createDirectionButton(doc, label, direction, onSelect) {
  const buttonElement = doc.createElement("button");
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

export function initApp({ doc = document, storage = localStorage } = {}) {
  const themeToggle = doc.getElementById("themeToggle");
  const input = doc.getElementById("valueInput");
  const grid = doc.getElementById("conversionGrid");
  const button = doc.getElementById("convertBtn");
  const categoryFilter = doc.getElementById("categoryFilter");
  const root = doc.documentElement;

  if (!themeToggle || !input || !grid || !button || !categoryFilter || !root) {
    return null;
  }

  const cardElements = new Map();
  const entries = Object.entries(converters);

  function syncThemeToggle(isDark) {
    themeToggle.textContent = isDark ? "☀️" : "🌙";
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", isDark ? "Enable light mode" : "Enable dark mode");
  }

  function updateCardVisibility() {
    const activeCategory = categoryFilter.value;

    cardElements.forEach((cardState) => {
      cardState.card.hidden = activeCategory !== "all" && cardState.cfg.category !== activeCategory;
    });
  }

  function populateCategoryFilter() {
    const categories = [...new Set(entries.map(([, cfg]) => cfg.category))];

    categories.forEach((category) => {
      const option = doc.createElement("option");
      option.value = category;
      option.textContent = category;
      categoryFilter.append(option);
    });

    const storedCategory = readStoredValue(storage, FILTER_STORAGE_KEY);
    if (storedCategory && [...categoryFilter.options].some((option) => option.value === storedCategory)) {
      categoryFilter.value = storedCategory;
    }
  }

  function buildCards() {
    grid.replaceChildren();
    cardElements.clear();

    entries.forEach(([key, cfg]) => {
      const card = doc.createElement("div");
      card.className = "card";
      card.dataset.converter = key;
      card.dataset.category = cfg.category;

      const header = doc.createElement("div");
      header.className = "card-header";

      const title = doc.createElement("div");
      title.className = "card-title";
      title.textContent = cfg.label;

      const tag = doc.createElement("div");
      tag.className = "card-tag";
      tag.textContent = `${cfg.units[0]} ⇄ ${cfg.units[1]}`;

      header.append(title, tag);

      const controls = doc.createElement("div");
      controls.className = "direction-group";
      controls.setAttribute("role", "group");
      controls.setAttribute("aria-label", `${cfg.label} conversion direction`);

      const resultBody = doc.createElement("div");
      resultBody.className = "card-body";
      resultBody.id = `${key}Result`;
      resultBody.setAttribute("role", "status");
      resultBody.setAttribute("aria-live", "polite");

      const primaryLine = doc.createElement("p");
      primaryLine.className = "result-line";

      const inputValue = doc.createElement("strong");
      const inputUnit = doc.createElement("span");
      const equalsText = doc.createElement("span");
      equalsText.textContent = " = ";
      const outputValue = doc.createElement("strong");
      const outputUnit = doc.createElement("span");

      primaryLine.append(inputValue, doc.createTextNode(" "), inputUnit, equalsText, outputValue, doc.createTextNode(" "), outputUnit);

      const secondaryLine = doc.createElement("p");
      secondaryLine.className = "result-line result-line-secondary";

      const reverseLabel = doc.createElement("span");
      reverseLabel.className = "result-label";
      reverseLabel.textContent = "Reverse";
      const reverseValue = doc.createElement("span");

      secondaryLine.append(reverseLabel, doc.createTextNode(": "), reverseValue);
      resultBody.append(primaryLine, secondaryLine);

      const storedDirection = readStoredValue(storage, `${DIRECTION_STORAGE_PREFIX}${key}`);
      const initialDirection = storedDirection === "imperialToMetric" ? "imperialToMetric" : "metricToImperial";
      const cardState = {
        key,
        card,
        cfg,
        direction: initialDirection,
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
        doc,
        `${cfg.units[0]} → ${cfg.units[1]}`,
        "metricToImperial",
        (direction) => {
          setActiveDirection(cardState, direction);
          writeStoredValue(storage, `${DIRECTION_STORAGE_PREFIX}${key}`, direction);
          convertAll();
        }
      );
      const imperialToMetricButton = createDirectionButton(
        doc,
        `${cfg.units[1]} → ${cfg.units[0]}`,
        "imperialToMetric",
        (direction) => {
          setActiveDirection(cardState, direction);
          writeStoredValue(storage, `${DIRECTION_STORAGE_PREFIX}${key}`, direction);
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

    updateCardVisibility();
  }

  function convertAll() {
    const base = parseFloat(input.value);
    if (Number.isNaN(base)) {
      return;
    }

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

  const savedTheme = readStoredValue(storage, THEME_STORAGE_KEY);
  if (savedTheme === "dark") {
    root.classList.add("dark");
  }

  syncThemeToggle(root.classList.contains("dark"));

  themeToggle.addEventListener("click", () => {
    const isDark = root.classList.toggle("dark");
    syncThemeToggle(isDark);
    writeStoredValue(storage, THEME_STORAGE_KEY, isDark ? "dark" : "light");
  });

  button.addEventListener("click", convertAll);
  input.addEventListener("input", convertAll);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      convertAll();
    }
  });
  categoryFilter.addEventListener("change", () => {
    writeStoredValue(storage, FILTER_STORAGE_KEY, categoryFilter.value);
    updateCardVisibility();
  });

  populateCategoryFilter();
  buildCards();
  convertAll();

  return {
    input,
    grid,
    button,
    categoryFilter,
    convertAll,
    cardElements,
  };
}

if (typeof document !== "undefined") {
  initApp();
}
