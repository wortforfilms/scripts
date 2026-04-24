const { defineConfig } = require("cypress");

module.exports = defineConfig({
  video: true,
  screenshotOnRunFailure: true,
  videosFolder: "cypress/artifacts/videos",
  screenshotsFolder: "cypress/artifacts/screenshots",
  fixturesFolder: "cypress/fixtures",
  e2e: {
    baseUrl: "http://127.0.0.1:3000",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx}",
    supportFile: "cypress/support/e2e.js"
  }
});
