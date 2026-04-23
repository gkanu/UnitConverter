import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

import { initApp } from "./app.js";

function createAppDom() {
  const dom = new JSDOM(
    `<!DOCTYPE html>
    <html lang="en">
      <body>
        <main class="app">
          <button id="themeToggle" type="button"></button>
          <input id="valueInput" type="number" value="20" />
          <button id="convertBtn" type="button">Convert</button>
          <select id="categoryFilter">
            <option value="all">All categories</option>
          </select>
          <input id="searchInput" type="search" />
          <select id="sortSelect">
            <option value="category">Category</option>
            <option value="label-asc">A to Z</option>
            <option value="label-desc">Z to A</option>
          </select>
          <button id="clearFiltersBtn" type="button">Clear filters</button>
          <div id="conversionGrid"></div>
          <div id="emptyState" hidden></div>
        </main>
      </body>
    </html>`,
    { url: "https://example.test" }
  );

  return dom;
}

function normalizeText(text) {
  return text.replace(/\s+/g, " ").trim();
}

test("live updates refresh card output when the input changes", () => {
  const dom = createAppDom();
  const app = initApp({ doc: dom.window.document, storage: dom.window.localStorage });

  app.input.value = "10";
  app.input.dispatchEvent(new dom.window.Event("input", { bubbles: true }));

  const lengthResult = dom.window.document.querySelector('[data-converter="length"] .result-line');
  assert.equal(normalizeText(lengthResult.textContent), "10.00 m = 32.81 ft");
});

test("unit selection changes persist state and update the active line", () => {
  const dom = createAppDom();
  const app = initApp({ doc: dom.window.document, storage: dom.window.localStorage });
  const lengthCard = dom.window.document.querySelector('[data-converter="length"]');
  const fromSelect = lengthCard.querySelector('[data-role="fromUnit"]');
  const toSelect = lengthCard.querySelector('[data-role="toUnit"]');

  app.input.value = "1";
  fromSelect.value = "meter";
  fromSelect.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  toSelect.value = "inch";
  toSelect.dispatchEvent(new dom.window.Event("change", { bubbles: true }));

  const activeLine = lengthCard.querySelector('.result-line');
  assert.equal(normalizeText(activeLine.textContent), "1.00 m = 39.37 in");
  assert.equal(dom.window.localStorage.getItem("converterFromUnit:length"), "meter");
  assert.equal(dom.window.localStorage.getItem("converterToUnit:length"), "inch");
});

test("category filter hides nonmatching cards and saves the selection", () => {
  const dom = createAppDom();
  const app = initApp({ doc: dom.window.document, storage: dom.window.localStorage });

  app.categoryFilter.value = "Physics";
  app.categoryFilter.dispatchEvent(new dom.window.Event("change", { bubbles: true }));

  const visibleCards = [...dom.window.document.querySelectorAll(".card")].filter((card) => !card.hidden);
  const visibleConverters = visibleCards.map((card) => card.dataset.converter);

  assert.deepEqual(visibleConverters, ["energy", "force", "pressure"]);
  assert.equal(dom.window.localStorage.getItem("converterCategoryFilter"), "Physics");
});

test("search filter narrows visible cards using labels and units", () => {
  const dom = createAppDom();
  const app = initApp({ doc: dom.window.document, storage: dom.window.localStorage });

  app.searchInput.value = "nautical";
  app.searchInput.dispatchEvent(new dom.window.Event("input", { bubbles: true }));

  const visibleCards = [...dom.window.document.querySelectorAll(".card")].filter((card) => !card.hidden);
  const visibleConverters = visibleCards.map((card) => card.dataset.converter);

  assert.deepEqual(visibleConverters, ["speed"]);
  assert.equal(dom.window.localStorage.getItem("converterSearchQuery"), "nautical");
});

test("stored input value is restored on initialization", () => {
  const dom = createAppDom();
  dom.window.localStorage.setItem("converterInputValue", "42");

  const app = initApp({ doc: dom.window.document, storage: dom.window.localStorage });
  const lengthResult = dom.window.document.querySelector('[data-converter="length"] .result-line');

  assert.equal(app.input.value, "42");
  assert.equal(normalizeText(lengthResult.textContent), "42.00 m = 137.80 ft");
});

test("clear filters resets search, sort, category, and input to defaults", () => {
  const dom = createAppDom();
  const app = initApp({ doc: dom.window.document, storage: dom.window.localStorage });

  app.categoryFilter.value = "Physics";
  app.categoryFilter.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  app.searchInput.value = "psi";
  app.searchInput.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
  app.sortSelect.value = "label-desc";
  app.sortSelect.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  app.input.value = "7";
  app.input.dispatchEvent(new dom.window.Event("input", { bubbles: true }));

  app.clearFiltersButton.click();

  assert.equal(app.categoryFilter.value, "all");
  assert.equal(app.searchInput.value, "");
  assert.equal(app.sortSelect.value, "category");
  assert.equal(app.input.value, "20");
});

test("empty state appears when filters hide every card", () => {
  const dom = createAppDom();
  const app = initApp({ doc: dom.window.document, storage: dom.window.localStorage });
  const emptyState = dom.window.document.getElementById("emptyState");

  app.searchInput.value = "no-match-query";
  app.searchInput.dispatchEvent(new dom.window.Event("input", { bubbles: true }));

  assert.equal(emptyState.hidden, false);
});
