import { format, getConversion } from "./converter.js";

function createDirectionButton(doc, label, direction, onSelect) {
  const buttonElement = doc.createElement("button");
  buttonElement.type = "button";
  buttonElement.className = "direction-btn";
  buttonElement.textContent = label;
  buttonElement.dataset.direction = direction;
  buttonElement.addEventListener("click", () => onSelect(direction));
  return buttonElement;
}

export function syncThemeToggle(themeToggle, isDark) {
  themeToggle.textContent = isDark ? "☀️" : "🌙";
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.setAttribute("aria-label", isDark ? "Enable light mode" : "Enable dark mode");
}

export function populateCategoryFilter(doc, categoryFilter, categories, selectedCategory) {
  const existingOptions = [...categoryFilter.options].map((option) => option.value);

  categories.forEach((category) => {
    if (existingOptions.includes(category)) {
      return;
    }

    const option = doc.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.append(option);
  });

  categoryFilter.value = selectedCategory;
}

function setActiveDirection(cardState, direction) {
  cardState.direction = direction;

  cardState.directionButtons.forEach((buttonElement) => {
    const isActive = buttonElement.dataset.direction === direction;
    buttonElement.classList.toggle("is-active", isActive);
    buttonElement.setAttribute("aria-pressed", String(isActive));
  });
}

export function buildCards({ doc, grid, entries, getDirection, onDirectionChange }) {
  const cardElements = new Map();
  grid.replaceChildren();

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

    const cardState = {
      key,
      card,
      cfg,
      direction: getDirection(key),
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
        onDirectionChange(key, direction);
      }
    );
    const imperialToMetricButton = createDirectionButton(
      doc,
      `${cfg.units[1]} → ${cfg.units[0]}`,
      "imperialToMetric",
      (direction) => {
        setActiveDirection(cardState, direction);
        onDirectionChange(key, direction);
      }
    );

    cardState.directionButtons = [metricToImperialButton, imperialToMetricButton];
    setActiveDirection(cardState, cardState.direction);

    controls.append(metricToImperialButton, imperialToMetricButton);
    card.append(header, controls, resultBody);
    grid.appendChild(card);
    cardElements.set(key, cardState);
  });

  return cardElements;
}

export function updateCardVisibility(cardElements, matchesFilters) {
  cardElements.forEach((cardState) => {
    cardState.card.hidden = !matchesFilters(cardState.cfg);
  });
}

export function updateConversions(cardElements, base) {
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