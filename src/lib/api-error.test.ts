import { AxiosError, AxiosHeaders } from "axios"
import { describe, expect, it } from "vitest"
import { apiErrorMessage } from "./api-error"

const FALLBACK = "Something went wrong."

function axiosErrorWith(status: number, data: unknown): AxiosError {
  const config = { headers: new AxiosHeaders() }
  return new AxiosError("Request failed", "ERR_BAD_REQUEST", config, null, {
    status,
    statusText: "",
    headers: {},
    config,
    data,
  } as never)
}

describe("apiErrorMessage", () => {
  it("prefers the server's own message", () => {
    const error = axiosErrorWith(409, { message: "That email already exists." })
    expect(apiErrorMessage(error, FALLBACK)).toBe("That email already exists.")
  })

  it("ignores a response body that is not the error envelope", () => {
    const error = axiosErrorWith(500, { detail: "nope" })
    expect(apiErrorMessage(error, FALLBACK)).toBe(FALLBACK)
  })

  it("explains a 403 without a message", () => {
    const error = axiosErrorWith(403, null)
    expect(apiErrorMessage(error, FALLBACK)).toMatch(/permission/i)
  })

  it("explains a 404 without a message", () => {
    const error = axiosErrorWith(404, null)
    expect(apiErrorMessage(error, FALLBACK)).toMatch(/no longer exists/i)
  })

  it("explains a network failure with no response at all", () => {
    const error = new AxiosError("Network Error", "ERR_NETWORK")
    expect(apiErrorMessage(error, FALLBACK)).toMatch(/could not reach/i)
  })

  it("falls back for a non-axios throw", () => {
    expect(apiErrorMessage(new Error("boom"), FALLBACK)).toBe(FALLBACK)
    expect(apiErrorMessage("a string", FALLBACK)).toBe(FALLBACK)
    expect(apiErrorMessage(undefined, FALLBACK)).toBe(FALLBACK)
  })

  it("never leaks a stack trace to the user", () => {
    const error = new Error("boom")
    expect(apiErrorMessage(error, FALLBACK)).not.toContain("at ")
  })
})
