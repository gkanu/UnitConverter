import { format, getConversion, getUnitOptions } from "./converter.js";

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

export function sortCards(grid, sortedEntries, cardElements) {
  sortedEntries.forEach(([key]) => {
    const cardState = cardElements.get(key);
    if (cardState) {
      grid.appendChild(cardState.card);
    }
  });
}

function createUnitSelect(doc, cfg, role, selectedUnitId, onChange) {
  const select = doc.createElement("select");
  select.className = "unit-select";
  select.dataset.role = role;

  getUnitOptions(cfg).forEach((optionData) => {
    const option = doc.createElement("option");
    option.value = optionData.id;
    option.textContent = `${optionData.label} • ${optionData.system}`;
    select.append(option);
  });

  select.value = selectedUnitId;
  select.addEventListener("change", () => onChange(select.value));
  return select;
}

export function buildCards({ doc, grid, entries, getUnitSelection, onUnitChange }) {
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
  tag.textContent = [...new Set(Object.values(cfg.units).map((unit) => unit.system))].join(" / ");

    header.append(title, tag);

    const controls = doc.createElement("div");
  controls.className = "unit-group";

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
    reverseLabel.textContent = "Systems";
    const systemValue = doc.createElement("span");

    secondaryLine.append(reverseLabel, doc.createTextNode(": "), systemValue);
    resultBody.append(primaryLine, secondaryLine);

    const unitSelection = getUnitSelection(key);
    const fromField = doc.createElement("label");
    fromField.className = "unit-field";
    const fromCaption = doc.createElement("span");
    fromCaption.className = "unit-caption";
    fromCaption.textContent = "From";

    const toField = doc.createElement("label");
    toField.className = "unit-field";
    const toCaption = doc.createElement("span");
    toCaption.className = "unit-caption";
    toCaption.textContent = "To";

    const cardState = {
      key,
      card,
      cfg,
      fromUnitId: unitSelection.fromUnitId,
      toUnitId: unitSelection.toUnitId,
      nodes: {
        inputValue,
        inputUnit,
        outputValue,
        outputUnit,
        systemValue,
      },
    };

    const fromSelect = createUnitSelect(doc, cfg, "fromUnit", cardState.fromUnitId, (value) => {
      cardState.fromUnitId = value;
      onUnitChange(key, { fromUnitId: cardState.fromUnitId, toUnitId: cardState.toUnitId });
    });
    const toSelect = createUnitSelect(doc, cfg, "toUnit", cardState.toUnitId, (value) => {
      cardState.toUnitId = value;
      onUnitChange(key, { fromUnitId: cardState.fromUnitId, toUnitId: cardState.toUnitId });
    });

    cardState.nodes.fromSelect = fromSelect;
    cardState.nodes.toSelect = toSelect;

    fromField.append(fromCaption, fromSelect);
    toField.append(toCaption, toSelect);
    controls.append(fromField, toField);
    card.append(header, controls, resultBody);
    grid.appendChild(card);
    cardElements.set(key, cardState);
  });

  return cardElements;
}

export function updateCardVisibility(cardElements, matchesFilters) {
  let visibleCount = 0;

  cardElements.forEach((cardState) => {
    const isVisible = matchesFilters(cardState.cfg);
    cardState.card.hidden = !isVisible;

    if (isVisible) {
      visibleCount += 1;
    }
  });

  return visibleCount;
}

export function syncEmptyState(emptyState, visibleCount) {
  emptyState.hidden = visibleCount > 0;
}

export function updateConversions(cardElements, base) {
  cardElements.forEach((cardState) => {
    const active = getConversion(cardState.cfg, base, cardState.fromUnitId, cardState.toUnitId);

    cardState.nodes.inputValue.textContent = format(active.inputValue);
    cardState.nodes.inputUnit.textContent = active.inputUnit;
    cardState.nodes.outputValue.textContent = format(active.outputValue);
    cardState.nodes.outputUnit.textContent = active.outputUnit;
    cardState.nodes.systemValue.textContent = `${active.fromSystem} → ${active.toSystem}`;
  });
}