import formatCurrency from "./CurrencyFormatter";
import safeRedirect from "./safeRedirect";

describe("formatCurrency", () => {
  it("formats whole Naira amounts with grouping", () => {
    expect(formatCurrency(25000)).toBe("₦25,000");
    expect(formatCurrency(1750000)).toBe("₦1,750,000");
    expect(formatCurrency(0)).toBe("₦0");
  });

  it("keeps the sign for negative amounts", () => {
    expect(formatCurrency(-163000)).toBe("-₦163,000");
  });
});

describe("safeRedirect", () => {
  it("allows paths inside the app", () => {
    expect(safeRedirect("/cart")).toBe("/cart");
    expect(safeRedirect("/search?sr=mouse")).toBe("/search?sr=mouse");
  });

  it("keeps query strings and hashes", () => {
    expect(safeRedirect("/cart?step=1#summary")).toBe("/cart?step=1#summary");
  });

  it("rejects tricks browsers treat as other origins", () => {
    expect(safeRedirect("/\\evil.example")).toBe("/");
    expect(safeRedirect("/\t/evil.example")).toBe("/");
  });

  it("never sends people back to the sign-in pages", () => {
    expect(safeRedirect("/login")).toBe("/");
    expect(safeRedirect("/register?redirect=%2Fcart")).toBe("/");
  });

  it("falls back for missing or external targets", () => {
    expect(safeRedirect(null)).toBe("/");
    expect(safeRedirect("https://evil.example")).toBe("/");
    expect(safeRedirect("//evil.example")).toBe("/");
    expect(safeRedirect("mailto:someone@example.com", "/home")).toBe("/home");
  });
});
