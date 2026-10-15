import { validate } from "./Register";

const valid = {
  name: "Ada Lovelace",
  username: "ada.l",
  email: "ada@example.com",
  password: "analytical",
  confirmPassword: "analytical",
};

describe("Register validation", () => {
  it("accepts valid details", () => {
    expect(validate(valid)).toEqual({});
  });

  it("explains each problem", () => {
    const errors = validate({
      name: " ",
      username: "a b",
      email: "ada@",
      password: "short",
      confirmPassword: "different",
    });

    expect(Object.keys(errors).sort()).toEqual([
      "confirmPassword",
      "email",
      "name",
      "password",
      "username",
    ]);
  });

  it("matches the API's username rules", () => {
    expect(validate({ ...valid, username: "ab" }).username).toBeDefined();
    expect(
      validate({ ...valid, username: "a".repeat(31) }).username
    ).toBeDefined();
    expect(validate({ ...valid, username: "Ada_99" }).username).toBeUndefined();
  });
});
