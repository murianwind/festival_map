module.exports = {
  default: {
    paths: ["features/web/**/*.feature"],
    require: ["features/web/step_definitions/**/*.js"],
    format: ["progress"],
  },
};
