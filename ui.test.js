import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { fresh, caseData } from "./game.js";
test("UI completes evidence review, pressure confirmation and a night transition", async () => {
  const dom = new JSDOM(
    '<!doctype html><html><body><div id="app"></div></body></html>',
    { url: "https://example.test" },
  );
  for (const key of [
    "window",
    "document",
    "localStorage",
    "Element",
    "Node",
    "SVGElement",
  ])
    globalThis[key] = dom.window[key];
  const initial = fresh(1);
  initial.people[1].control = 80;
  initial.people[1].personality = "conciliatory";
  initial.people[0].personality = "authoritarian";
  initial.people[2].personality = "opportunist";
  initial.relations = { "arin:demir": 25, "arin:koray": 45, "demir:koray": 50 };
  initial.people[1].files[0].caseId = "island-foundation";
  localStorage.setItem("golge-sef-v4", JSON.stringify(initial));
  let source = await readFile(new URL("./main.js", import.meta.url), "utf8");
  source = source
    .replace('import "./style.css";', "")
    .replace(
      'from "lucide"',
      `from ${JSON.stringify(import.meta.resolve("lucide"))}`,
    )
    .replace(
      'from "./game.js"',
      `from ${JSON.stringify(new URL("./game.js", import.meta.url).href)}`,
    )
    .replace(
      'from "./languages.js"',
      `from ${JSON.stringify(new URL("./languages.js", import.meta.url).href)}`,
    );
  await import(
    "data:text/javascript;base64," + Buffer.from(source).toString("base64")
  );
  const click = (selector) => {
    const b = document.querySelector(selector);
    assert.ok(b, selector);
    assert.equal(b.disabled, false, selector);
    b.click();
  };
  assert.match(document.body.textContent, /Kimse masum kalmayacak/);
  document.querySelector("[data-language]").click();
  assert.match(document.body.textContent, /No one stays innocent/);
  document.querySelector("[data-language]").click();
  assert.match(document.body.textContent, /Kimse masum kalmayacak/);
  click('[data-select="arin"]');
  click("[data-back]");
  click('[data-action="investigate"]');
  click('[data-method="investigate"]');
  click("[data-review]");
  assert.equal(document.querySelectorAll("[data-doc]").length, 5);
  for (const id of caseData(initial, "arin", 0).answer)
    click(`[data-doc="${id}"]`);
  assert.equal(document.querySelector("[data-submit]").disabled, true);
  click('[data-verdict="guilty"]');
  click("[data-submit]");
  assert.match(document.body.textContent, /DOĞRULANDI/);
  click('[data-action="blackmail"]');
  click('[data-confirm="blackmail"]');
  click('[data-action="negotiate"]');
  click("[data-next]");
  assert.match(document.querySelector(".modal").textContent, /Siz uyurken/);
  click("[data-close]");
  const saved = JSON.parse(localStorage.getItem("golge-sef-v4"));
  assert.equal(saved.day, 2);
  assert.equal(saved.ap, 4);
  assert.equal(saved.people[1].trail, 20);
  click('[data-contain="arin"]');
  assert.equal(JSON.parse(localStorage.getItem("golge-sef-v4")).people[1].trail, 0);
  click('[data-modal="command"]');
  assert.doesNotMatch(document.querySelector(".modal").textContent, /\$\{/);
  click('[data-command="break"][data-target="koray"]');
  const commanded = JSON.parse(localStorage.getItem("golge-sef-v4"));
  assert.equal(commanded.relations["arin:koray"], 35);
  assert.equal(commanded.brokenUntil["arin:koray"], 3);
  assert.equal(commanded.ap, 1);
  const help = document.querySelector('[data-modal="help"]');
  help.focus();
  help.click();
  assert.equal(document.querySelector(".shell").inert, true);
  document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape" }));
  assert.equal(document.querySelector(".modal"), null);
  assert.equal(document.activeElement.dataset.modal, "help");
  click('[data-tab="archive"]');
  assert.match(document.body.textContent, /ŞİFRELİ İŞLEM ARŞİVİ/);
  dom.window.close();
});
