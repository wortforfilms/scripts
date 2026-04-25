Cypress.Commands.add("loadProofFixture", (fixtureName = "proof-sample.json") => {
  cy.get('[data-testid="hkd-file-input"]').selectFile(`cypress/fixtures/${fixtureName}`, {
    force: true
  });
});

Cypress.Commands.add("loginAsPremiumUser", () => {
  cy.task("sessionToken", {
    sub: "cy_premium",
    accountId: "acct_cy_premium",
    accountType: "INDIVIDUAL",
    accountRole: "OWNER",
    role: "USER",
    plan: "PREMIUM",
    permissions: []
  }).then((cookie) => {
    cy.setCookie(cookie.name, cookie.value, {
      sameSite: "lax",
      secure: false
    });
  });
});

Cypress.Commands.add("loginAsAdmin", () => {
  cy.task("sessionToken", {
    sub: "cy_admin",
    accountId: "acct_cy_admin",
    accountType: "ORGANIZATION",
    accountRole: "ADMIN",
    role: "ADMIN",
    plan: "ENTERPRISE",
    permissions: ["catalog-admin", "catalog-review"]
  }).then((cookie) => {
    cy.setCookie(cookie.name, cookie.value, {
      sameSite: "lax",
      secure: false
    });
  });
});
