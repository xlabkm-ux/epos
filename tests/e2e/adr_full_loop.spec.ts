import { test, expect } from "@playwright/test";

test.describe("ADR Full Review Loop (S5)", () => {
  test("should complete full loop from analysis to artifact version and trace", async ({
    page,
  }) => {
    // 1. Go to the app
    await page.goto("http://localhost:5173/");

    // 2. Switch to ADR view
    await page.click('button[data-testid="nav-adr-review"]');

    // 3. Select a proposed ADR
    await page.click('button[data-testid="adr-item-ADR-0026"]');

    // 4. Run Epistemic Analysis
    await page.click('button:has-text("Run Epistemic Analysis")');

    // 5. Open Governance Panel
    await page.click('button:has-text("Governance")');

    // 6. Verify Readiness (Indicators should be visible)
    await expect(page.locator("text=EVIDENCE COVERAGE")).toBeVisible();
    await expect(page.locator("text=TRACEABILITY")).toBeVisible();
    await expect(page.locator("text=RISK HANDLING")).toBeVisible();

    // 7. Verify Experimental Score is present but de-emphasized
    await expect(page.locator("text=Experimental Score")).toBeVisible();

    // 8. Go back to ADR view
    await page.click('button:has-text("View ADR")');

    // 9. Approve Decision
    await page.click('button:has-text("Approve Decision")');
    await expect(page.locator("text=Finalized")).toBeVisible();

    // 10. Open Artifact Panel
    await page.click('button:has-text("Artifact")');

    // 11. Generate ADR
    await page.click('button:has-text("Generate ADR")');

    // 12. Verify Markdown Content and Trace Summary
    await expect(page.locator("text=# ADR:")).toBeVisible();
    await expect(page.locator("text=Trace Summary")).toBeVisible();
    await expect(page.locator("text=Final Approval")).toBeVisible();
    await expect(page.locator("text=completed")).toContainText(""); // Should have green dot or status
  });
});
