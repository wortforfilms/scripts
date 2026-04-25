const { createHmac } = require("crypto");
const { defineConfig } = require("cypress");

const SESSION_COOKIE_NAME = "maataa_session";
const TEST_SESSION_SECRET = "cypress-secret";

function base64Url(value) {
  return Buffer.from(value).toString("base64url");
}

function sessionToken(payload) {
  const header = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64Url(JSON.stringify({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  }));
  const signature = createHmac("sha256", TEST_SESSION_SECRET).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${signature}`;
}

module.exports = defineConfig({
  video: true,
  screenshotOnRunFailure: true,
  videosFolder: "cypress/artifacts/videos",
  screenshotsFolder: "cypress/artifacts/screenshots",
  fixturesFolder: "cypress/fixtures",
  e2e: {
    baseUrl: "http://127.0.0.1:3000",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx}",
    supportFile: "cypress/support/e2e.js",
    setupNodeEvents(on) {
      on("task", {
        sessionToken(payload) {
          return {
            name: SESSION_COOKIE_NAME,
            value: sessionToken(payload),
          };
        },
      });
    }
  }
});
