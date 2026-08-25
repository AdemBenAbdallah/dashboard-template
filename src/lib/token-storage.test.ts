import { afterEach, describe, expect, it, vi } from "vitest"
import { tokenStorage } from "./token-storage"

afterEach(() => {
  vi.restoreAllMocks()
  window.localStorage.clear()
})

describe("tokenStorage", () => {
  it("round-trips a refresh token", () => {
    tokenStorage.setRefreshToken("rt_abc")
    expect(tokenStorage.getRefreshToken()).toBe("rt_abc")
  })

  it("returns null when nothing is stored", () => {
    expect(tokenStorage.getRefreshToken()).toBeNull()
  })

  it("clears the token", () => {
    tokenStorage.setRefreshToken("rt_abc")
    tokenStorage.clearRefreshToken()
    expect(tokenStorage.getRefreshToken()).toBeNull()
  })

  it("never stores the token under a guessable bare key", () => {
    tokenStorage.setRefreshToken("rt_abc")
    expect(window.localStorage.getItem("token")).toBeNull()
    expect(window.localStorage.getItem("refreshToken")).toBeNull()
  })

  // Private browsing and hardened settings make localStorage throw. Losing the
  // session is acceptable; crashing the app is not.
  it("survives a throwing getItem", () => {
    vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
      throw new Error("SecurityError")
    })
    expect(() => tokenStorage.getRefreshToken()).not.toThrow()
    expect(tokenStorage.getRefreshToken()).toBeNull()
  })

  it("survives a throwing setItem", () => {
    vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError")
    })
    expect(() => tokenStorage.setRefreshToken("rt_abc")).not.toThrow()
  })

  it("survives a throwing removeItem", () => {
    vi.spyOn(window.localStorage, "removeItem").mockImplementation(() => {
      throw new Error("SecurityError")
    })
    expect(() => tokenStorage.clearRefreshToken()).not.toThrow()
  })
})
