import { describe, expect, it } from "vitest"
import { z } from "zod"
import { DEFAULT_PAGINATION, pageCount, paginatedSchema } from "./pagination"

describe("pageCount", () => {
  it.each([
    [0, 10, 1],
    [1, 10, 1],
    [10, 10, 1],
    [11, 10, 2],
    [61, 10, 7],
    [47, 20, 3],
  ])("total=%i pageSize=%i -> %i pages", (total, pageSize, expected) => {
    expect(pageCount(total, pageSize)).toBe(expected)
  })

  it("never reports zero pages for an empty list", () => {
    // The footer renders "Page 1 of N"; N must never be 0.
    expect(pageCount(0, 25)).toBe(1)
  })
})

describe("paginatedSchema", () => {
  const schema = paginatedSchema(z.object({ id: z.number() }))

  it("accepts a well-formed envelope", () => {
    const parsed = schema.parse({
      rows: [{ id: 1 }],
      page: 1,
      pageSize: 10,
      total: 1,
    })
    expect(parsed.rows).toHaveLength(1)
  })

  it("rejects a zero or negative page", () => {
    const base = { rows: [], pageSize: 10, total: 0 }
    expect(() => schema.parse({ ...base, page: 0 })).toThrow()
    expect(() => schema.parse({ ...base, page: -1 })).toThrow()
  })

  it("allows a zero total but rejects a negative one", () => {
    const base = { rows: [], page: 1, pageSize: 10 }
    expect(() => schema.parse({ ...base, total: 0 })).not.toThrow()
    expect(() => schema.parse({ ...base, total: -1 })).toThrow()
  })

  it("rejects rows that fail the item schema", () => {
    expect(() =>
      schema.parse({ rows: [{ id: "1" }], page: 1, pageSize: 10, total: 1 }),
    ).toThrow()
  })
})

describe("DEFAULT_PAGINATION", () => {
  it("starts on page 1, since the API is 1-based", () => {
    expect(DEFAULT_PAGINATION.page).toBe(1)
    expect(DEFAULT_PAGINATION.pageSize).toBeGreaterThan(0)
  })
})
