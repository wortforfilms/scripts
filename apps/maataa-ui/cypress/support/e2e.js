require("./commands");

Cypress.on("uncaught:exception", (error) => {
  if (error.name === "SyntaxError" && error.message.includes("Invalid or unexpected token")) {
    return false;
  }
  return true;
});
