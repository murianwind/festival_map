const assert = require("node:assert/strict");
const { Given, When, Then } = require("@cucumber/cucumber");
const ViewState = require("../../../docs/js/view_state.js");

const list = (text) => text.split(",").map((s) => s.trim());

Given("축제가 있는 날은 {string}이다", function (days) {
  this.days = list(days);
});

Given("보던 달은 {string}이고 선택한 날은 {string}이다", function (month, day) {
  this.viewedMonth = month;
  this.previousDay = day;
});

Given("보던 달은 {string}이다", function (month) {
  this.viewedMonth = month;
});

When("화면 상태를 다시 정하면", function () {
  this.next = ViewState.nextViewState({
    days: this.days, today: this.today, month: this.viewedMonth, selected: this.previousDay,
  });
});

Then("보는 달은 {string}이다", function (month) {
  assert.equal(this.next.month, month);
});

Then("선택한 날은 {string}이다", function (day) {
  assert.equal(this.next.selected, day);
});

Then("선택한 날은 없다", function () {
  assert.equal(this.next.selected, null);
});

When("휴가 날짜 선택창의 시작 값을 정하면", function () {
  this.pickerValue = ViewState.pickerStartValue(this.viewedMonth, this.today);
});

Then("시작 값은 {string}이다", function (day) {
  assert.equal(this.pickerValue, day);
});
