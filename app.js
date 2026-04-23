import { converters } from "./converter.js";
import { createAppState } from "./app-state.js";
import { buildCards, populateCategoryFilter, syncThemeToggle, updateCardVisibility, updateConversions } from "./app-view.js";

export function initApp({ doc = document, storage = localStorage } = {}) {
  const themeToggle = doc.getElementById("themeToggle");
  const input = doc.getElementById("valueInput");
  const grid = doc.getElementById("conversionGrid");
  const button = doc.getElementById("convertBtn");
  const categoryFilter = doc.getElementById("categoryFilter");
  const searchInput = doc.getElementById("searchInput");
  const root = doc.documentElement;

  if (!themeToggle || !input || !grid || !button || !categoryFilter || !searchInput || !root) {
    return null;
  }

  const entries = Object.entries(converters);
  const appState = createAppState({ entries, storage });
  input.value = appState.state.inputValue;
  searchInput.value = appState.state.searchQuery;

  const cardElements = buildCards({
    doc,
    grid,
    entries,
    getDirection: appState.getDirection,
    onDirectionChange: (key, direction) => {
      appState.setDirection(key, direction);
      convertAll();
    },
  });

  function updateCardVisibilityView() {
    updateCardVisibility(cardElements, appState.matchesFilters);
  }

  function convertAll() {
    const base = parseFloat(input.value);
    if (Number.isNaN(base)) {
      return;
    }

    updateConversions(cardElements, base);
  }

  if (appState.state.theme === "dark") {
    root.classList.add("dark");
  }

  syncThemeToggle(themeToggle, root.classList.contains("dark"));

  themeToggle.addEventListener("click", () => {
    const theme = appState.toggleTheme();
    const isDark = theme === "dark";
    root.classList.toggle("dark", isDark);
    syncThemeToggle(themeToggle, isDark);
  });

  button.addEventListener("click", convertAll);
  input.addEventListener("input", () => {
    appState.setInputValue(input.value);
    convertAll();
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      convertAll();
    }
  });
  categoryFilter.addEventListener("change", () => {
    appState.setCategory(categoryFilter.value);
    updateCardVisibilityView();
  });
  searchInput.addEventListener("input", () => {
    appState.setSearchQuery(searchInput.value);
    updateCardVisibilityView();
  });

  populateCategoryFilter(doc, categoryFilter, appState.categories, appState.state.category);
  updateCardVisibilityView();
  convertAll();

  return {
    input,
    grid,
    button,
    categoryFilter,
    searchInput,
    convertAll,
    cardElements,
  };
}

if (typeof document !== "undefined") {
  initApp();
}
