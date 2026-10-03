const assert = require("node:assert/strict");
const { Given, When, Then } = require("@cucumber/cucumber");
const SearchLink = require("../../../docs/js/search_link.js");

Given("축제 이름 {string}", function (name) {
  this.searchName = name;
});

When("구글 검색 주소를 만들면", function () {
  this.searchUrl = SearchLink.googleSearchUrl(this.searchName);
});

Then("검색 주소는 {string}이다", function (url) {
  assert.equal(this.searchUrl, url);
});
