describe("Merkle traversal", () => {
  it("renders runtime leaves and steps through a selected event path", () => {
    cy.loginAsPremiumUser();
    cy.intercept("GET", "/api/runtime/timeline", { fixture: "timeline-sample.json" }).as("timeline");

    cy.visit("/merkle");
    cy.wait("@timeline");

    cy.contains("Step-by-Step Merkle Traversal").should("be.visible");
    cy.get('[data-testid="merkle-root"]').should("not.be.empty");

    cy.get('[data-testid="event-leaf-0"]').should("contain.text", "scheduler.tick").click();
    cy.get('[data-testid="merkle-traversal-status"]').should("contain.text", "Traversing leaf #0");
    cy.contains("Active step").should("be.visible");
  });
});
