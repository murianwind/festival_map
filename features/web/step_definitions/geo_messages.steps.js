const assert = require("node:assert/strict");
const { Given, When, Then } = require("@cucumber/cucumber");
const GeoMessages = require("../../../docs/js/geo_messages.js");

Given("위치 오류 코드는 {int}이다", function (code) {
  this.geoCode = code;
});

When("안내 문구를 만들면", function () {
  this.geoMessage = GeoMessages.messageFor(this.geoCode);
});

Then("안내 문구는 {string}이다", function (message) {
  assert.equal(this.geoMessage, message);
});
