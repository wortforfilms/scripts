Cypress.Commands.add("loadProofFixture", (fixtureName = "proof-sample.json") => {
  cy.get('[data-testid="hkd-file-input"]').selectFile(`cypress/fixtures/${fixtureName}`, {
    force: true
  });
});
