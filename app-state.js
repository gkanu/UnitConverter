import { readStoredValue, writeStoredValue } from "./storage.js";

export const THEME_STORAGE_KEY = "theme";
export const FILTER_STORAGE_KEY = "converterCategoryFilter";
export const SEARCH_STORAGE_KEY = "converterSearchQuery";
export const INPUT_STORAGE_KEY = "converterInputValue";
export const SORT_STORAGE_KEY = "converterSortKey";
export const FROM_UNIT_STORAGE_PREFIX = "converterFromUnit:";
export const TO_UNIT_STORAGE_PREFIX = "converterToUnit:";
const DEFAULT_INPUT_VALUE = "20";
const DEFAULT_SORT_KEY = "category";

export function createAppState({ entries, storage }) {
  const categories = [...new Set(entries.map(([, cfg]) => cfg.category))];
  const validCategories = new Set(["all", ...categories]);
  const validSortKeys = new Set([DEFAULT_SORT_KEY, "label-asc", "label-desc"]);
  const storedTheme = readStoredValue(storage, THEME_STORAGE_KEY);
  const storedCategory = readStoredValue(storage, FILTER_STORAGE_KEY);
  const storedSearchQuery = readStoredValue(storage, SEARCH_STORAGE_KEY) ?? "";
  const storedInputValue = readStoredValue(storage, INPUT_STORAGE_KEY);
  const storedSortKey = readStoredValue(storage, SORT_STORAGE_KEY);
  const unitSelections = new Map(
    entries.map(([key, cfg]) => {
      const storedFromUnitId = readStoredValue(storage, `${FROM_UNIT_STORAGE_PREFIX}${key}`);
      const storedToUnitId = readStoredValue(storage, `${TO_UNIT_STORAGE_PREFIX}${key}`);
      const fromUnitId = storedFromUnitId && cfg.units[storedFromUnitId] ? storedFromUnitId : cfg.defaultFrom;
      const toUnitId = storedToUnitId && cfg.units[storedToUnitId] ? storedToUnitId : cfg.defaultTo;

      return [key, { fromUnitId, toUnitId }];
    })
  );

  const state = {
    theme: storedTheme === "dark" ? "dark" : "light",
    category: validCategories.has(storedCategory) ? storedCategory : "all",
    searchQuery: storedSearchQuery,
    inputValue: storedInputValue ?? DEFAULT_INPUT_VALUE,
    sortKey: validSortKeys.has(storedSortKey) ? storedSortKey : DEFAULT_SORT_KEY,
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

  function getUnitSelection(key) {
    return unitSelections.get(key);
  }

  function setUnitSelection(key, selection) {
    unitSelections.set(key, selection);
    writeStoredValue(storage, `${FROM_UNIT_STORAGE_PREFIX}${key}`, selection.fromUnitId);
    writeStoredValue(storage, `${TO_UNIT_STORAGE_PREFIX}${key}`, selection.toUnitId);
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

  function setSortKey(sortKey) {
    state.sortKey = validSortKeys.has(sortKey) ? sortKey : DEFAULT_SORT_KEY;
    writeStoredValue(storage, SORT_STORAGE_KEY, state.sortKey);
  }

  function resetToolbarState() {
    setCategory("all");
    setSearchQuery("");
    setInputValue(DEFAULT_INPUT_VALUE);
    setSortKey(DEFAULT_SORT_KEY);
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

    const haystack = [
      cfg.label,
      cfg.category,
      ...Object.values(cfg.units).flatMap((unit) => [unit.label, unit.symbol, unit.system]),
    ].join(" ").toLowerCase();
    return haystack.includes(normalizedQuery);
  }

  function sortEntries(entryList) {
    return [...entryList].sort(([, leftCfg], [, rightCfg]) => {
      if (state.sortKey === "label-asc") {
        return leftCfg.label.localeCompare(rightCfg.label);
      }

      if (state.sortKey === "label-desc") {
        return rightCfg.label.localeCompare(leftCfg.label);
      }

      const categoryComparison = leftCfg.category.localeCompare(rightCfg.category);
      if (categoryComparison !== 0) {
        return categoryComparison;
      }

      return leftCfg.label.localeCompare(rightCfg.label);
    });
  }

  return {
    categories,
    state,
    getUnitSelection,
    setUnitSelection,
    setTheme,
    toggleTheme,
    setCategory,
    setSearchQuery,
    setInputValue,
    setSortKey,
    resetToolbarState,
    matchesFilters,
    sortEntries,
  };
}