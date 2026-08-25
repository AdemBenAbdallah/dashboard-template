import { describe, expect, it } from "vitest"
import { safeRedirect } from "./redirect"

describe("safeRedirect", () => {
  it.each([
    ["/dashboard", "/dashboard"],
    ["/users", "/users"],
    ["/users?page=2", "/users?page=2"],
    ["/card-payments#row-3", "/card-payments#row-3"],
  ])("keeps the in-app path %s", (input, expected) => {
    expect(safeRedirect(input)).toBe(expected)
  })

  it.each([
    ["undefined", undefined],
    ["null", null],
    ["empty string", ""],
  ])("falls back to /dashboard when the param is %s", (_label, input) => {
    expect(safeRedirect(input)).toBe("/dashboard")
  })

  // These are the open-redirect cases. A crafted `?redirect=` must never send
  // the user off-origin after they authenticate.
  it.each([
    ["absolute https", "https://evil.example/steal"],
    ["absolute http", "http://evil.example"],
    ["protocol-relative", "//evil.example"],
    ["backslash protocol-relative", "/\\evil.example"],
    ["javascript scheme", "javascript:alert(1)"],
    ["data scheme", "data:text/html,<script>alert(1)</script>"],
    ["bare host", "evil.example"],
  ])("rejects %s", (_label, input) => {
    expect(safeRedirect(input)).toBe("/dashboard")
  })
})
