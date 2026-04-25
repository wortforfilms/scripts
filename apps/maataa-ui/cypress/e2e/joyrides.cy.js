const publicJoyrides = [
  { path: "/?joyride=start", label: "Home joyride", firstTitle: "Main navigation" },
  { path: "/scripts?joyride=start", label: "Script explorer joyride", firstTitle: "Page overview" },
  { path: "/tools?joyride=start", label: "Tools joyride", firstTitle: "Page overview" },
  { path: "/investors?joyride=start", label: "Investor joyride", firstTitle: "Page overview" },
  { path: "/sponsors?joyride=start", label: "Sponsor joyride", firstTitle: "Page overview" },
  { path: "/creators?joyride=start", label: "Creator joyride", firstTitle: "Page overview" },
  { path: "/partners?joyride=start", label: "Partner joyride", firstTitle: "Page overview" },
  { path: "/accessibility?joyride=start", label: "Accessibility joyride", firstTitle: "Accessibility overview" }
];

const protectedJoyrides = [
  "/checkout?joyride=start",
  "/admin/finance?joyride=start",
  "/admin/dataset-qa?joyride=start",
  "/admin/glyph-qa?joyride=start",
  "/admin/features?joyride=start"
];

const authenticatedJoyrides = [
  { path: "/checkout?joyride=start", label: "Checkout joyride", firstTitle: "Page overview", login: "premium" },
  { path: "/admin/finance?joyride=start", label: "Admin finance joyride", firstTitle: "Page overview", login: "admin" },
  { path: "/admin/dataset-qa?joyride=start", label: "Dataset QA joyride", firstTitle: "Page overview", login: "admin" },
  { path: "/admin/glyph-qa?joyride=start", label: "Glyph QA joyride", firstTitle: "Page overview", login: "admin" },
  { path: "/admin/features?joyride=start", label: "Feature flags joyride", firstTitle: "Page overview", login: "admin" }
];

function finishJoyride(firstTitle) {
  cy.contains(firstTitle, { timeout: 15000 }).should("be.visible");
  cy.contains(/Step 1 of/).should("be.visible");

  function advance() {
    cy.get("section[aria-label]").last().then(($dialog) => {
      if ($dialog.text().includes("Finish")) {
        cy.wrap($dialog).contains("button", "Finish").click();
        return;
      }
      cy.wrap($dialog).contains("button", "Next").click();
      advance();
    });
  }

  advance();
  cy.contains(/Step \d+ of/).should("not.exist");
}

function visitAndFinishJoyride(path, firstTitle) {
  cy.visit(path);
  cy.get("body", { timeout: 15000 }).then(($body) => {
    if (!$body.text().includes(firstTitle)) cy.reload();
  });
  finishJoyride(firstTitle);
}

describe("Joyride walkthrough videos", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.viewport(1280, 900);
  });

  publicJoyrides.forEach((tour) => {
    it(`records ${tour.label}`, () => {
      visitAndFinishJoyride(tour.path, tour.firstTitle);
    });
  });

  it("keeps protected joyride routes behind auth before recording admin tours", () => {
    protectedJoyrides.forEach((path) => {
      cy.visit(path);
      cy.location("pathname").should("eq", "/signin");
      cy.contains("Sign in").should("be.visible");
    });
  });

  authenticatedJoyrides.forEach((tour) => {
    it(`records authenticated ${tour.label}`, () => {
      if (tour.login === "admin") cy.loginAsAdmin();
      if (tour.login === "premium") cy.loginAsPremiumUser();
      visitAndFinishJoyride(tour.path, tour.firstTitle);
    });
  });
});
