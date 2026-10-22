import test from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  act,
  nextDay,
  outcome,
  caseData,
  relation,
  score,
  forecast,
  DAYS,
  commandInfo,
  transferPlans,
  validSave,
  containmentCost,
} from "./game.js";
import { incidents } from "./cases.js";
function scenario(seed = 1) {
  const s = fresh(seed);
  const traits = ["authoritarian", "conciliatory", "opportunist"];
  s.relations = { "arin:demir": 23, "demir:koray": 49, "arin:koray": 41 };
  s.people.forEach((p, index) => {
    p.personality = traits[index];
    p.power = [56, 48, 40][index];
    p.control = [12, 18, 24][index];
    p.files.forEach((f, fileIndex) => {
      f.caseId = incidents.filter((event) => event.minister === p.id && event.verdict === "guilty")[fileIndex].id;
    });
  });
  return s;
}
function answer(s, id, index) {
  const event = caseData(s, id, index);
  return { docs: event.answer, verdict: event.verdict };
}
function verified(s, id, index) {
  s = act(s, id, "investigate", index);
  return act(s, id, "review", index, answer(s, id, index));
}

test("an action completing an investigation ends the game immediately", () => {
  let s = verified(scenario(1), "arin", 0);
  s.people[1].trail = 88;
  s = act(s, "arin", "blackmail");
  assert.equal(s.people[1].trail, 100);
  assert.equal(s.ended, true);
  assert.equal(outcome(s).win, false);
  assert.equal(act(s, "arin", "hide"), s);
});

test("night forecast leaves the real state intact and matches resolution", () => {
  let s = verified(scenario(1), "demir", 0);
  s = act(s, "demir", "blackmail");
  s = act(s, "demir", "hide");
  const before = structuredClone(s);
  const predicted = forecast(s);
  assert.deepEqual(s, before);
  assert.deepEqual(nextDay(s).night, predicted);
});
test("four actions per day and no early night transition", () => {
  let s = scenario(1);
  assert.equal(nextDay(s), s);
  for (let i = 0; i < 4; i++) s = act(s, "demir", "hide");
  assert.equal(s.ap, 0);
  assert.equal(act(s, "demir", "support"), s);
  s = nextDay(s);
  assert.equal(s.day, 2);
  assert.equal(s.ap, 4);
});

test("a complete campaign has exactly seven nights and at most 28 orders", () => {
  let s = scenario(1);
  for (let day = 1; day <= DAYS; day++) {
    assert.equal(s.day, day);
    assert.equal(s.ended, false);
    assert.equal(nextDay(s), s);
    for (let action = 0; action < 4; action++) {
      s = act(s, "demir", "hide");
      assert.equal(s.ap, 3 - action);
    }
    assert.equal(act(s, "demir", "support"), s);
    s = nextDay(s);
    assert.ok(s.night.length > 0);
  }
  assert.equal(s.day, DAYS);
  assert.equal(s.orders, 28);
  assert.equal(s.ended, true);
  assert.equal(nextDay(s), s);
  assert.equal(act(s, "demir", "hide"), s);
});
test("investigation yields raw documents, not a usable blackmail secret", () => {
  let s = scenario(1);
  s = act(s, "demir", "investigate");
  assert.equal(s.people[0].files[0].stage, "raw");
  assert.equal(act(s, "demir", "blackmail"), s);
  s = act(s, "demir", "review", 0, answer(s, "demir", 0));
  assert.equal(s.people[0].files[0].stage, "verified");
  assert.equal(s.ap, 2);
});
test("incorrect matches spend one action, raise risk and lock retries today", () => {
  let s = act(scenario(3), "arin", "investigate");
  const c = caseData(s, "arin", 0),
    wrong = c.docs
      .filter((d) => !c.answer.includes(d.id))
      .slice(0, 2)
      .map((d) => d.id);
  const before = s.suspicion;
  s = act(s, "arin", "review", 0, { docs: wrong, verdict: c.verdict });
  assert.equal(s.ap, 2);
  assert.equal(s.suspicion, before + 7);
  assert.equal(s.people[1].files[0].stage, "raw");
  assert.equal(act(s, "arin", "review", 0, { docs: c.answer, verdict: c.verdict }), s);
});
test("same evidence cannot be blackmailed twice; publication closes leverage", () => {
  let s = verified(scenario(1), "arin", 0);
  s = act(s, "arin", "blackmail");
  assert.equal(s.people[1].files[0].stage, "verified");
  assert.equal(s.people[1].files[0].pressured, true);
  assert.equal(act(s, "arin", "blackmail"), s);
  s = act(s, "arin", "leak");
  assert.equal(s.people[1].files[0].public, true);
});
test("unverified leaks backfire", () => {
  let s = act(scenario(1), "arin", "investigate"),
    before = s.people[1].power;
  s = act(s, "arin", "leak");
  assert.equal(s.people[1].power, before + 8);
});
test("surveillance returns on the seventh morning but cannot start on the last day", () => {
  const start = scenario(1);
  start.day = DAYS - 1;
  let s = act(start, "koray", "follow");
  assert.equal(s.people[2].files[0].stage, "pending");
  assert.equal(act(s, "koray", "review", 0, { docs: ["a", "b"], verdict: "guilty" }), s);
  for (let i = 0; i < 3; i++) s = act(s, "demir", "hide");
  s = nextDay(s);
  assert.equal(s.people[2].files[0].stage, "raw");
  assert.equal(s.day, DAYS);
  assert.equal(act(s, "koray", "follow", 1), s);
});
test("night responses alter relationships and counter player pressure", () => {
  let s = verified(scenario(1), "demir", 0);
  s = act(s, "demir", "blackmail");
  s = act(s, "demir", "hide");
  const rel = relation(s, "demir", "koray"),
    susp = s.suspicion;
  s = nextDay(s);
  assert.ok(relation(s, "demir", "koray") > rel);
  assert.ok(s.suspicion > susp);
  assert.ok(s.night.some((t) => t.includes("karşı istihbarat")));
});
test("the final night resolves before ending; anger can cost victory", () => {
  let s = scenario(1);
  s.day = DAYS;
  s.ap = 0;
  s.backed = "arin";
  s.people[1].power = 95;
  s.people[1].control = 80;
  s.people[1].anger = 70;
  s.people[1].files[0] = {
    stage: "verified",
    pressured: true,
    public: false,
    exposed: false,
  };
  s = nextDay(s);
  assert.equal(s.ended, true);
  assert.equal(s.day, DAYS);
  assert.equal(s.people[1].files[0].exposed, true);
  assert.equal(s.people[1].control, 60);
  assert.equal(outcome(s).win, false);
});
test("alliances add election strength independently of raw influence", () => {
  const s = scenario(1);
  s.relations["arin:demir"] = 70;
  s.relations["demir:koray"] = 70;
  assert.equal(score(s, s.people[0]), s.people[0].power + 12);
});
test("a planned campaign is winnable without ignoring anger", () => {
  let s = scenario(1);
  s.backed = "arin";
  const plans = [
    ["investigate", 0, "review", 0, "blackmail", 0, "negotiate", 0],
    ["investigate", 1, "review", 1, "blackmail", 1, "negotiate", 0],
    ["contain", 0, "negotiate", 0],
    ["contain", 0, "negotiate", 0],
    ["support", 0, "negotiate", 0, "hide", 0, "hide", 0],
    ["support", 0, "negotiate", 0, "hide", 0, "hide", 0],
    ["support", 0, "negotiate", 0, "hide", 0, "hide", 0],
  ];
  for (const plan of plans) {
    for (let i = 0; i < plan.length; i += 2) {
      const a = plan[i],
        ix = plan[i + 1];
      const previous = s;
      s = act(
        s,
        "arin",
        a,
        ix,
        a === "review" ? answer(s, "arin", ix) : null,
      );
      assert.notEqual(s, previous, `Campaign action rejected: ${a}`);
    }
    s = nextDay(s);
  }
  assert.equal(s.apSpent, 28);
  assert.equal(s.orders, 24);
  assert.equal(s.ended, true);
  assert.equal(outcome(s).win, true);
});
test("puzzle variants have two valid distinct documents for all nine cases", () => {
  for (let seed = 0; seed < 12; seed++)
    for (const id of ["demir", "arin", "koray"])
      for (let i = 0; i < 3; i++) {
        const c = caseData(fresh(seed), id, i);
        assert.equal(new Set(c.answer).size, 2);
        assert.ok(c.answer.every((a) => c.docs.some((d) => d.id === a)));
      }
});

test("allies reduce leak damage and pay their own protection cost", () => {
  const alone = verified(scenario(1), "arin", 0);
  alone.relations["arin:demir"] = 20;
  alone.relations["arin:koray"] = 20;
  const protectedState = structuredClone(alone);
  protectedState.relations["arin:demir"] = 60;
  protectedState.relations["arin:koray"] = 60;
  const unprotectedResult = act(alone, "arin", "leak");
  const protectedResult = act(protectedState, "arin", "leak");
  assert.equal(alone.people[1].power - unprotectedResult.people[1].power, 17);
  assert.equal(protectedState.people[1].power - protectedResult.people[1].power, 5);
  for (const index of [0, 2]) {
    assert.equal(protectedResult.people[index].power, protectedState.people[index].power - 3);
    assert.equal(protectedResult.people[index].anger, protectedState.people[index].anger + 6);
  }
});

test("special commands enforce thresholds, costs and the daily limit", () => {
  const s = scenario(1);
  s.people[0].control = 100;
  const info = commandInfo(s, "demir", "koray", "break");
  s.people[0].control = info.threshold - 1;
  const payload = { target: "koray", kind: "break" };
  assert.equal(act(s, "demir", "command", 0, payload), s);
  s.people[0].control++;
  const result = act(s, "demir", "command", 0, payload);
  assert.equal(result.ap, s.ap - 1);
  assert.equal(result.people[0].control, info.threshold - 10);
  assert.equal(result.people[0].power, s.people[0].power + 3);
  assert.equal(result.people[0].anger, s.people[0].anger + 8);
  assert.equal(result.suspicion, s.suspicion + 2);
  assert.equal(relation(result, "demir", "koray"), 35);
  assert.equal(act(result, "demir", "command", 0, payload), result);
  assert.equal(act(s, "demir", "command", 0, { target: "demir", kind: "break" }), s);
});

test("breaking ties prevents night rapprochement today and tomorrow", () => {
  let s = scenario(1);
  s.people[0].control = 100;
  s.people[0].power = 90;
  s = act(s, "demir", "command", 0, { target: "koray", kind: "break" });
  for (let day = 1; day <= 3; day++) {
    s.ap = 0;
    s = nextDay(s);
    assert.equal(relation(s, "demir", "koray"), day <= 2 ? 35 : 43);
  }
});

test("commanded influence can transfer while broken ties prevent relationship gain", () => {
  let s = scenario(1);
  s.people[0].control = 100;
  s.people[2].control = 100;
  s = act(s, "demir", "command", 0, { target: "koray", kind: "break" });
  const before = structuredClone(s);
  s = act(s, "koray", "command", 0, { target: "demir", kind: "endorse" });
  assert.equal(relation(s, "demir", "koray"), 35);
  assert.equal(s.people[0].power, before.people[0].power + 10);
  assert.equal(s.people[2].power, before.people[2].power - 7);
});

test("natural support is planned before changes and each donor gives once", () => {
  let s = scenario(1);
  s.day = 4;
  s.ap = 0;
  s.people[0].power = 90;
  s.people[1].power = 30;
  s.people[2].power = 30;
  s.relations["arin:demir"] = 60;
  s.relations["demir:koray"] = 60;
  s.relations["arin:koray"] = 20;
  assert.deepEqual(transferPlans(s), [{ from: "arin", to: "demir" }, { from: "koray", to: "demir" }]);
  s = nextDay(s);
  assert.equal(s.people[0].power, 100);
  assert.equal(s.people[1].power, 24);
  assert.equal(s.people[2].power, 24);
  assert.equal(s.people[1].donated, true);
  assert.equal(s.people[2].donated, true);
  assert.deepEqual(transferPlans(s), []);
});

test("hiding leaves investigations intact and containment affects only its target", () => {
  let s = scenario(1);
  s.people[0].trail = 25;
  s.people[1].trail = 40;
  s = act(s, "demir", "hide");
  assert.equal(s.people[0].trail, 25);
  assert.equal(s.people[1].trail, 40);
  s = act(s, "demir", "contain");
  assert.equal(s.people[0].trail, 0);
  assert.equal(s.people[1].trail, 40);
  assert.equal(act(s, "demir", "contain"), s);
  s.ap = 0;
  s = nextDay(s);
  assert.equal(s.people[0].trail, 0);
  assert.equal(s.people[1].trail, 48);
});

test("allied open investigations advance faster and exposure ends the night", () => {
  let s = scenario(1);
  s.people[0].trail = 86;
  s.people[1].trail = 10;
  s.relations["arin:demir"] = 60;
  s.suspicion = 0;
  s.ap = 0;
  s = nextDay(s);
  assert.equal(s.people[0].trail, 100);
  assert.equal(s.people[1].trail, 24);
  assert.equal(s.ended, true);
  assert.equal(outcome(s).win, false);
});

test("invalid investigation targets do not crash or spend actions", () => {
  const s = scenario(1);
  for (const action of ["investigate", "follow", "review", "blackmail", "leak"]) {
    assert.equal(act(s, "demir", action, 99), s);
    assert.equal(act(s, "missing", action), s);
  }
});

test("saved campaigns validate throughout a full playthrough", () => {
  let s = scenario(1);
  assert.equal(validSave(s), true);
  while (!s.ended) {
    s = act(s, "koray", "hide");
    assert.equal(validSave(s), true);
    if (s.ap === 0) s = nextDay(s);
    assert.equal(validSave(JSON.parse(JSON.stringify(s))), true);
  }
});

test("broken, incomplete and older saves are rejected", () => {
  for (const value of [null, [], {}, { version: 2 }]) assert.equal(validSave(value), false);
  const changes = [
    (s) => { s.people.reverse(); },
    (s) => { s.people[0].trail = undefined; },
    (s) => { s.people[0].power = "80"; },
    (s) => { s.day = 8; },
    (s) => { s.ap = -1; },
    (s) => { s.relations = {}; },
    (s) => { s.log = []; },
    (s) => { s.night = [null]; },
    (s) => { s.backed = "missing"; },
    (s) => { s.people[0].files[0].stage = "pending"; },
  ];
  for (const change of changes) {
    const s = scenario(1);
    change(s);
    assert.equal(validSave(s), false);
  }
});

test("seeded campaigns randomize strengths, personalities and all 18 cases reproducibly", () => {
  assert.deepEqual(fresh(42), fresh(42));
  const leaders = new Map();
  const seenCases = new Set();
  const seenTraits = new Map(["demir", "arin", "koray"].map((id) => [id, new Set()]));
  const starts = new Set();
  for (let seed = 0; seed < 400; seed++) {
    const s = fresh(seed);
    assert.equal(validSave(s), true);
    assert.equal(new Set(s.people.map((p) => p.personality)).size, 3);
    for (const p of s.people) {
      assert.ok(score(s, p) >= 30 && score(s, p) <= 56);
      seenTraits.get(p.id).add(p.personality);
      assert.equal(new Set(p.files.map((f) => f.caseId)).size, 3);
      p.files.forEach((f) => seenCases.add(f.caseId));
    }
    Object.values(s.relations).forEach((value) => assert.ok(value >= 20 && value <= 75));
    starts.add(JSON.stringify(s.relations));
    const top = Math.max(...s.people.map((p) => score(s, p)));
    const winners = s.people.filter((p) => score(s, p) === top);
    if (winners.length === 1) leaders.set(winners[0].id, (leaders.get(winners[0].id) || 0) + 1);
  }
  assert.equal(seenCases.size, 18);
  seenTraits.forEach((traits) => assert.equal(traits.size, 6));
  assert.equal(leaders.size, 3);
  leaders.forEach((count) => assert.ok(count > 60));
  assert.ok(starts.size > 350);
});

test("the content pool has six incident types per department and solvable distinct evidence", () => {
  assert.equal(incidents.length, 18);
  assert.equal(new Set(incidents.map((event) => event.id)).size, 18);
  assert.equal(new Set(incidents.map((event) => event.title)).size, 18);
  for (const id of ["demir", "arin", "koray"]) {
    const pool = incidents.filter((event) => event.minister === id);
    assert.equal(pool.length, 6);
    assert.equal(new Set(pool.map((event) => event.type)).size, 6);
    assert.equal(pool.filter((event) => event.verdict === "clear").length, 1);
  }
  for (const event of incidents) {
    let s = fresh(8);
    s.people.find((p) => p.id === event.minister).files[0].caseId = event.id;
    const puzzle = caseData(s, event.minister, 0);
    assert.equal(puzzle.docs.length, 5);
    assert.equal(new Set(puzzle.docs.map((d) => d.body)).size, 5);
    assert.equal(puzzle.answer.length, 2);
    s = act(s, event.minister, "investigate");
    const result = act(s, event.minister, "review", 0, answer(s, event.minister, 0));
    assert.equal(result.people.find((p) => p.id === event.minister).files[0].stage,
      event.verdict === "guilty" ? "verified" : "cleared");
    assert.equal(result.ap, 2);
  }
});

test("a correct pair with a wrong conclusion fails and an unsupported allegation cannot become leverage", () => {
  let s = scenario();
  s.people[1].files[0].caseId = "interest-rumour";
  s = act(s, "arin", "investigate");
  const puzzle = caseData(s, "arin", 0);
  const wrong = act(s, "arin", "review", 0, { docs: puzzle.answer, verdict: "guilty" });
  assert.equal(wrong.people[1].files[0].stage, "raw");
  assert.equal(wrong.ap, s.ap - 1);
  const right = act(s, "arin", "review", 0, { docs: puzzle.answer, verdict: "clear" });
  assert.equal(right.people[1].files[0].stage, "cleared");
  assert.equal(right.suspicion, s.suspicion - 2);
  assert.equal(act(right, "arin", "blackmail"), right);
  assert.equal(act(right, "arin", "leak"), right);
  assert.equal(act(s, "arin", "review", 0, { docs: ["x", "y"], verdict: "clear" }), s);
  assert.equal(act(s, "arin", "review", 0, puzzle.answer), s);
});

test("anonymous leaks produce source searches before a concrete investigation", () => {
  let s = verified(scenario(), "arin", 0);
  s = act(s, "arin", "leak");
  assert.equal(s.people[1].trail, 0);
  assert.equal(s.people[1].hunt, 1);
  assert.equal(s.people[1].identified, false);
  s = act(s, "demir", "hide");
  s = nextDay(s);
  assert.equal(s.people[1].hunt, 2);
  assert.equal(s.people[1].trail, 0);
  s.ap = 0;
  s = nextDay(s);
  assert.equal(s.people[1].trail, 12);
  assert.equal(s.people[1].identified, true);
  assert.equal(s.people[1].trailOpenedDay, 2);
  assert.equal(s.people[1].hunt, 0);
  s.ap = 0;
  s = nextDay(s);
  assert.equal(s.people[1].trail, 20);
});

test("suspicious personalities trace leaks faster, while repeat access advances suspicion", () => {
  let s = verified(scenario(), "arin", 0);
  s.people[1].personality = "suspicious";
  s = act(s, "arin", "leak");
  s = act(s, "arin", "investigate", 1);
  assert.equal(s.people[1].hunt, 2);
  assert.equal(s.people[1].trail, 0);
  s = nextDay(s);
  assert.equal(s.people[1].trail, 12);
  assert.equal(s.people[1].hunt, 0);
});

test("containment escalates by investigation age and never spends unavailable AP", () => {
  const s = scenario();
  const p = s.people[0];
  p.trail = 50;
  p.identified = true;
  p.trailOpenedDay = 1;
  for (const [day, cost] of [[1, 2], [2, 2], [3, 3], [4, 3], [5, 4], [7, 4]]) {
    s.day = day;
    assert.equal(containmentCost(s, p), cost);
    s.ap = cost - 1;
    assert.equal(act(s, "demir", "contain"), s);
    s.ap = cost;
    const result = act(s, "demir", "contain");
    assert.equal(result.ap, 0);
    assert.equal(result.apSpent, cost);
    assert.equal(result.orders, 1);
    assert.equal(result.people[0].trail, 20);
    assert.equal(result.people[0].trailOpenedDay, 1);
  }
});

test("closing a file does not erase identity and new linked attacks reopen it", () => {
  let s = verified(scenario(), "arin", 0);
  s = act(s, "arin", "blackmail");
  assert.equal(s.people[1].trailOpenedDay, 1);
  s.ap = 4;
  s = act(s, "arin", "contain");
  assert.equal(s.ap, 2);
  assert.equal(s.people[1].trail, 0);
  assert.equal(s.people[1].identified, true);
  assert.equal(s.people[1].trailOpenedDay, 0);
  s.day = 5;
  s = act(s, "arin", "leak");
  assert.equal(s.people[1].trail, 18);
  assert.equal(s.people[1].trailOpenedDay, 5);
  assert.equal(containmentCost(s, s.people[1]), 2);
});

test("personalities change behavior independently of ministers' names", () => {
  let s = scenario();
  s.people[0].personality = "opportunist";
  s.people[1].personality = "suspicious";
  s.people[2].personality = "ambitious";
  s.people[1].power = 90;
  s.people[2].power = 20;
  s.relations = { "arin:demir": 20, "arin:koray": 20, "demir:koray": 20 };
  s.ap = 0;
  const result = nextDay(s);
  assert.equal(relation(result, "demir", "arin"), 28);
  assert.equal(relation(result, "demir", "koray"), 20);
  assert.equal(result.people[1].power, 91);
  assert.equal(result.people[2].power, 25);
  s.people[0].personality = "conciliatory";
  s.people[0].anger = 40;
  s.ap = 4;
  assert.equal(act(s, "demir", "negotiate").people[0].anger, 8);
});

test("loyal and ambitious personalities affect command acceptance and donations", () => {
  const s = scenario();
  s.people[0].control = 100;
  const base = commandInfo(s, "demir", "koray", "break").threshold;
  s.people[0].personality = "loyal";
  assert.equal(commandInfo(s, "demir", "koray", "break").threshold, base + 10);
  s.people[0].personality = "suspicious";
  const transfer = commandInfo(s, "demir", "koray", "endorse").threshold;
  s.people[0].personality = "ambitious";
  assert.equal(commandInfo(s, "demir", "koray", "endorse").threshold, transfer + 10);
  s.day = 4;
  s.people[0].power = 25;
  s.people[1].power = 90;
  s.relations["arin:demir"] = 70;
  assert.equal(transferPlans(s).some((plan) => plan.from === "demir"), false);
});

test("real randomized starts support a complete planned campaign without rejected actions", () => {
  let wins = 0;
  for (let seed = 0; seed < 40; seed++) {
    let s = fresh(seed);
    const target = [...s.people].sort((a, b) => score(s, b) - score(s, a))[0];
    const id = target.id;
    s.backed = id;
    const files = target.files.map((file, index) => ({ index, verdict: caseData(s, id, index).verdict }))
      .filter((file) => file.verdict === "guilty");
    for (let day = 1; day <= DAYS; day++) {
      const index = files[day === 1 ? 0 : 1].index;
      const plan = day <= 2 ? ["investigate", "review", "blackmail", "negotiate"]
        : day <= 4 ? ["contain", "negotiate"]
        : ["support", "negotiate", "hide", "hide"];
      for (const action of plan) {
        const before = s;
        s = act(s, id, action, index, action === "review" ? answer(s, id, index) : null);
        assert.notEqual(s, before, `seed ${seed}, day ${day}, action ${action}`);
        assert.equal(validSave(s), true);
      }
      assert.equal(s.ap, 0);
      s = nextDay(s);
      assert.equal(validSave(s), true);
    }
    assert.equal(s.apSpent, 28);
    assert.equal(s.ended, true);
    if (outcome(s).win) wins++;
  }
  assert.ok(wins > 0, "At least one naturally generated campaign should be winnable");
});

test("save validation rejects incompatible content and impossible AP bookkeeping", () => {
  const changes = [
    (s) => { s.version = 3; },
    (s) => { s.apSpent = 3; },
    (s) => { s.orders = 1; },
    (s) => { s.people[0].personality = s.people[1].personality; },
    (s) => { s.people[0].files[0].caseId = s.people[0].files[1].caseId; },
    (s) => { s.people[0].files[0].caseId = "island-foundation"; },
    (s) => { s.people[0].hunt = 1; s.people[0].identified = true; },
    (s) => { s.people[0].trail = 10; },
  ];
  for (const change of changes) {
    const s = fresh(9);
    change(s);
    assert.equal(validSave(s), false);
  }
});
