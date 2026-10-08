import { parseSort } from "./SortSelect";

describe("parseSort", () => {
  it("reads sort orders from the URL in any case", () => {
    expect(parseSort("price_asc")).toBe("PRICE_ASC");
    expect(parseSort("RATING")).toBe("RATING");
  });

  it("falls back to the featured order", () => {
    expect(parseSort(null)).toBe("FEATURED");
    expect(parseSort("cheapest")).toBe("FEATURED");
  });
});
