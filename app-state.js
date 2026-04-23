import { readStoredValue, writeStoredValue } from "./storage.js";

export const THEME_STORAGE_KEY = "theme";
export const FILTER_STORAGE_KEY = "converterCategoryFilter";
export const SEARCH_STORAGE_KEY = "converterSearchQuery";
export const INPUT_STORAGE_KEY = "converterInputValue";
export const DIRECTION_STORAGE_PREFIX = "converterDirection:";

export function createAppState({ entries, storage }) {
  const categories = [...new Set(entries.map(([, cfg]) => cfg.category))];
  const validCategories = new Set(["all", ...categories]);
  const storedTheme = readStoredValue(storage, THEME_STORAGE_KEY);
  const storedCategory = readStoredValue(storage, FILTER_STORAGE_KEY);
  const storedSearchQuery = readStoredValue(storage, SEARCH_STORAGE_KEY) ?? "";
  const storedInputValue = readStoredValue(storage, INPUT_STORAGE_KEY);
  const directions = new Map(
    entries.map(([key]) => {
      const storedDirection = readStoredValue(storage, `${DIRECTION_STORAGE_PREFIX}${key}`);
      const direction = storedDirection === "imperialToMetric" ? "imperialToMetric" : "metricToImperial";
      return [key, direction];
    })
  );

  const state = {
    theme: storedTheme === "dark" ? "dark" : "light",
    category: validCategories.has(storedCategory) ? storedCategory : "all",
    searchQuery: storedSearchQuery,
    inputValue: storedInputValue ?? "20",
  };

  function setTheme(theme) {
    state.theme = theme;
    writeStoredValue(storage, THEME_STORAGE_KEY, theme);
  }

  function toggleTheme() {
    const nextTheme = state.theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    return nextTheme;
  }

  function getDirection(key) {
    return directions.get(key) ?? "metricToImperial";
  }

  function setDirection(key, direction) {
    directions.set(key, direction);
    writeStoredValue(storage, `${DIRECTION_STORAGE_PREFIX}${key}`, direction);
  }

  function setCategory(category) {
    state.category = validCategories.has(category) ? category : "all";
    writeStoredValue(storage, FILTER_STORAGE_KEY, state.category);
  }

  function setSearchQuery(searchQuery) {
    state.searchQuery = searchQuery;
    writeStoredValue(storage, SEARCH_STORAGE_KEY, searchQuery);
  }

  function setInputValue(inputValue) {
    state.inputValue = inputValue;
    writeStoredValue(storage, INPUT_STORAGE_KEY, inputValue);
  }

  function matchesFilters(cfg) {
    const matchesCategory = state.category === "all" || cfg.category === state.category;
    const normalizedQuery = state.searchQuery.trim().toLowerCase();

    if (!matchesCategory) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystack = [cfg.label, cfg.category, ...cfg.units].join(" ").toLowerCase();
    return haystack.includes(normalizedQuery);
  }

  return {
    categories,
    state,
    getDirection,
    setDirection,
    setTheme,
    toggleTheme,
    setCategory,
    setSearchQuery,
    setInputValue,
    matchesFilters,
  };
}