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
          <div id="conversionGrid"></div>
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
  assert.equal(normalizeText(lengthResult.textContent), "10.00 meters = 32.81 feet");
});

test("direction button clicks persist state and update the active line", () => {
  const dom = createAppDom();
  const app = initApp({ doc: dom.window.document, storage: dom.window.localStorage });
  const temperatureCard = dom.window.document.querySelector('[data-converter="temperature"]');
  const imperialButton = temperatureCard.querySelector('[data-direction="imperialToMetric"]');

  app.input.value = "32";
  imperialButton.click();

  const activeLine = temperatureCard.querySelector('.result-line');
  assert.equal(normalizeText(activeLine.textContent), "32.00 °F = 0.00 °C");
  assert.equal(dom.window.localStorage.getItem("converterDirection:temperature"), "imperialToMetric");
});

test("category filter hides nonmatching cards and saves the selection", () => {
  const dom = createAppDom();
  const app = initApp({ doc: dom.window.document, storage: dom.window.localStorage });

  app.categoryFilter.value = "Physics";
  app.categoryFilter.dispatchEvent(new dom.window.Event("change", { bubbles: true }));

  const visibleCards = [...dom.window.document.querySelectorAll(".card")].filter((card) => !card.hidden);
  const visibleConverters = visibleCards.map((card) => card.dataset.converter);

  assert.deepEqual(visibleConverters, ["pressure", "energy", "force"]);
  assert.equal(dom.window.localStorage.getItem("converterCategoryFilter"), "Physics");
});

test("search filter narrows visible cards using labels and units", () => {
  const dom = createAppDom();
  const app = initApp({ doc: dom.window.document, storage: dom.window.localStorage });

  app.searchInput.value = "psi";
  app.searchInput.dispatchEvent(new dom.window.Event("input", { bubbles: true }));

  const visibleCards = [...dom.window.document.querySelectorAll(".card")].filter((card) => !card.hidden);
  const visibleConverters = visibleCards.map((card) => card.dataset.converter);

  assert.deepEqual(visibleConverters, ["pressure"]);
  assert.equal(dom.window.localStorage.getItem("converterSearchQuery"), "psi");
});

test("stored input value is restored on initialization", () => {
  const dom = createAppDom();
  dom.window.localStorage.setItem("converterInputValue", "42");

  const app = initApp({ doc: dom.window.document, storage: dom.window.localStorage });
  const lengthResult = dom.window.document.querySelector('[data-converter="length"] .result-line');

  assert.equal(app.input.value, "42");
  assert.equal(normalizeText(lengthResult.textContent), "42.00 meters = 137.80 feet");
});
