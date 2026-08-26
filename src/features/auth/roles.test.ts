import { describe, expect, it } from "vitest"
import { hasRole, ROLE_VALUES, ROLES, roleLabel } from "./roles"

describe("hasRole", () => {
  it("allows any role when the resource declares no restriction", () => {
    expect(hasRole(ROLES.STAFF, undefined)).toBe(true)
    expect(hasRole(ROLES.SUPERADMIN, undefined)).toBe(true)
  })

  it("treats an empty allow-list as unrestricted", () => {
    expect(hasRole(ROLES.STAFF, [])).toBe(true)
  })

  it("denies an anonymous user any restricted resource", () => {
    expect(hasRole(null, [ROLES.STAFF])).toBe(false)
    expect(hasRole(undefined, [ROLES.SUPERADMIN])).toBe(false)
  })

  it("allows an anonymous user through an unrestricted resource", () => {
    // Authentication is the route guard's job; this predicate is only about
    // roles, and must not accidentally become a second auth check.
    expect(hasRole(null, undefined)).toBe(true)
  })

  it("matches when the role is in the allow-list", () => {
    expect(hasRole(ROLES.SUPERADMIN, [ROLES.SUPERADMIN])).toBe(true)
    expect(hasRole(ROLES.STAFF, [ROLES.SUPERADMIN, ROLES.STAFF])).toBe(true)
  })

  it("denies when the role is absent from the allow-list", () => {
    expect(hasRole(ROLES.STAFF, [ROLES.SUPERADMIN])).toBe(false)
  })
})

describe("role metadata", () => {
  it("exposes every role in ROLE_VALUES", () => {
    expect(ROLE_VALUES).toHaveLength(Object.keys(ROLES).length)
    expect(new Set(ROLE_VALUES)).toEqual(new Set(Object.values(ROLES)))
  })

  it("has a human label for every role", () => {
    // Guards against adding a role to ROLES and forgetting the `auth.roles`
    // block in the locale files — i18next echoes the key back when it misses,
    // so an unresolved label is the dotted path rather than a name.
    for (const role of ROLE_VALUES) {
      expect(roleLabel(role)).toBeTruthy()
      expect(roleLabel(role)).not.toContain("auth.roles")
    }
  })
})
