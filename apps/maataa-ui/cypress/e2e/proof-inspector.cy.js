describe("Proof inspector flows", () => {
  it("loads an HKD fixture, verifies it, and animates a proof path", () => {
    cy.visit("/proof-inspector");

    cy.contains("Proof Inspector").should("be.visible");
    cy.loadProofFixture();

    cy.get('[data-testid="hash-status"]').should("contain.text", "Hash Check Passed");
    cy.get('[data-testid="signature-status"]').should("contain.text", "Signature Verified");

    cy.get('[data-testid="payload-leaf-1"]').click();
    cy.get('[data-testid="traversal-status"]').should("contain.text", "Traversing leaf #1");
  });
});
