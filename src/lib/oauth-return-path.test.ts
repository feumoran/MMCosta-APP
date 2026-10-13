import { describe, expect, test } from "bun:test";
import { oauthReturnPath } from "./oauth-return-path";

describe("OAuth return paths", () => {
  test("preserves the complete local consent request", () => {
    const path = "/.lovable/oauth/consent?authorization_id=abc&extra=1#confirm";
    expect(oauthReturnPath(path)).toBe(path);
  });
  test("rejects external destinations and parser bypasses", () => {
    for (const path of ["https://outside.invalid", "//outside.invalid", "/\\outside.invalid", "/\n/outside.invalid", undefined, null, 42]) {
      expect(oauthReturnPath(path)).toBe("/");
    }
  });
  test("canonicalizes local dot segments without losing search", () => {
    expect(oauthReturnPath("/auth/../.lovable/oauth/consent?authorization_id=abc")).toBe("/.lovable/oauth/consent?authorization_id=abc");
  });
});