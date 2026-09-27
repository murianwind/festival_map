const assert = require("node:assert/strict");
const { Given, When, Then, Before } = require("@cucumber/cucumber");
const Rules = require("../../../docs/js/display_rules.js");

Before(function () {
  this.holidays = new Set();
  this.festivals = new Map();
  this.today = null;
});

function festival(world, name) {
  if (!world.festivals.has(name)) {
    world.festivals.set(name, {
      id: name, name, start: "", end: "", dateStatus: "ok",
      lat: 37.5, lon: 127.0, region: "서울특별시",
    });
  }
  return world.festivals.get(name);
}

function tagLabels(tags) {
  return tags.map((t) => Rules.TAG_LABELS[t]);
}

Given("공휴일은 {string}이다", function (days) {
  this.holidays = new Set(days.split(",").map((s) => s.trim()));
});

Given("오늘은 {string}이다", function (day) {
  this.today = day;
});

Given("축제 {string}의 기간은 {string}부터 {string}까지이다", function (name, start, end) {
  Object.assign(festival(this, name), { start, end, dateStatus: "ok" });
});

Given("축제 {string}의 날짜는 비어 있다", function (name) {
  Object.assign(festival(this, name), { start: "", end: "", dateStatus: "missing" });
});

Given("축제 {string}의 날짜 오류 기간은 {string}부터 {string}까지이다", function (name, start, end) {
  Object.assign(festival(this, name), { start, end, dateStatus: "invalid" });
});

Given("축제 {string}는 위치가 없다", function (name) {
  Object.assign(festival(this, name), { lat: null, lon: null });
});

When("표시 규칙을 적용하면", function () {
  this.results = new Map();
  for (const [name, f] of this.festivals) {
    this.results.set(name, Rules.classifyFestival(f, this.today, this.holidays));
  }
});

Then("축제 {string}는 캘린더의 {string}에 표시된다", function (name, days) {
  assert.deepEqual(this.results.get(name).calendarDates, days.split(",").map((s) => s.trim()));
});

Then("축제 {string}는 캘린더에 표시되지 않는다", function (name) {
  assert.deepEqual(this.results.get(name).calendarDates, []);
});

Then("축제 {string}는 사이드바에 표시되지 않는다", function (name) {
  assert.deepEqual(this.results.get(name).sidebarTags, []);
});

Then("축제 {string}는 사이드바에 {string} 태그로 표시된다", function (name, labels) {
  const expected = labels.split(",").map((s) => s.trim());
  assert.deepEqual(tagLabels(this.results.get(name).sidebarTags), expected);
});

Given("현재 시각은 {string}이다", function (iso) {
  this.now = new Date(iso);
});

When("오늘 날짜를 구하면", function () {
  this.computedToday = Rules.todayInSeoul(this.now);
});

Then("오늘은 {string}로 계산된다", function (day) {
  assert.equal(this.computedToday, day);
});

Given("사이드바 항목의 지역이 {string}이다", function (regions) {
  this.sidebarItems = regions.split(",").map((r, i) => ({
    festival: { id: String(i), name: `축제${i}`, region: r.trim() },
    tags: ["long"],
  }));
});

When("지역별로 묶으면", function () {
  this.groups = Rules.groupByRegion(this.sidebarItems);
});

Then("지역 순서는 {string}이다", function (regions) {
  assert.deepEqual(this.groups.map((g) => g.region), regions.split(",").map((s) => s.trim()));
});

Then("{string} 그룹에는 {int}건이 있다", function (region, count) {
  assert.equal(this.groups.find((g) => g.region === region).items.length, count);
});
