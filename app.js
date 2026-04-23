import { converters } from "./converter.js";
import { createAppState } from "./app-state.js";
import {
  buildCards,
  populateCategoryFilter,
  sortCards,
  syncEmptyState,
  syncThemeToggle,
  updateCardVisibility,
  updateConversions,
} from "./app-view.js";

export function initApp({ doc = document, storage = localStorage } = {}) {
  const themeToggle = doc.getElementById("themeToggle");
  const input = doc.getElementById("valueInput");
  const grid = doc.getElementById("conversionGrid");
  const button = doc.getElementById("convertBtn");
  const categoryFilter = doc.getElementById("categoryFilter");
  const searchInput = doc.getElementById("searchInput");
  const sortSelect = doc.getElementById("sortSelect");
  const clearFiltersButton = doc.getElementById("clearFiltersBtn");
  const emptyState = doc.getElementById("emptyState");
  const root = doc.documentElement;

  if (!themeToggle || !input || !grid || !button || !categoryFilter || !searchInput || !sortSelect || !clearFiltersButton || !emptyState || !root) {
    return null;
  }

  const entries = Object.entries(converters);
  const appState = createAppState({ entries, storage });
  input.value = appState.state.inputValue;
  searchInput.value = appState.state.searchQuery;
  sortSelect.value = appState.state.sortKey;

  const cardElements = buildCards({
    doc,
    grid,
    entries,
    getUnitSelection: appState.getUnitSelection,
    onUnitChange: (key, selection) => {
      appState.setUnitSelection(key, selection);
      convertAll();
    },
  });

  function applyGridState() {
    sortCards(grid, appState.sortEntries(entries), cardElements);
    const visibleCount = updateCardVisibility(cardElements, appState.matchesFilters);
    syncEmptyState(emptyState, visibleCount);
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
    applyGridState();
  });
  searchInput.addEventListener("input", () => {
    appState.setSearchQuery(searchInput.value);
    applyGridState();
  });
  sortSelect.addEventListener("change", () => {
    appState.setSortKey(sortSelect.value);
    applyGridState();
  });
  clearFiltersButton.addEventListener("click", () => {
    appState.resetToolbarState();
    input.value = appState.state.inputValue;
    searchInput.value = appState.state.searchQuery;
    categoryFilter.value = appState.state.category;
    sortSelect.value = appState.state.sortKey;
    applyGridState();
    convertAll();
  });

  populateCategoryFilter(doc, categoryFilter, appState.categories, appState.state.category);
  applyGridState();
  convertAll();

  return {
    input,
    grid,
    button,
    categoryFilter,
    searchInput,
    sortSelect,
    clearFiltersButton,
    convertAll,
    cardElements,
  };
}

if (typeof document !== "undefined") {
  initApp();
}
