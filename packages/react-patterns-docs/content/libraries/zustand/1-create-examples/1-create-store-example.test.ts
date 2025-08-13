import { example } from "./1-create-store-example";

describe("Create Store Example", () => {
  it("should export the correct example string", () => {
    expect(example).toBe("create store");
  });

  it("should demonstrate basic store creation pattern", () => {
    // This test serves as documentation showing how to use the pattern
    const exampleValue = example;

    // In a real implementation, this would show:
    // - How to create a Zustand store
    // - Basic state management patterns
    // - Usage examples

    expect(typeof exampleValue).toBe("string");
    expect(exampleValue).toContain("store");
  });

  it("The slice shouln't return empty string", () => {
    const exampleValue = example;
    expect(exampleValue).toContain("create store");
  });
});
