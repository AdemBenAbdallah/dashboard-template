import { ROLES, type Role } from "@/features/auth/roles"

/**
 * In-memory database for the mock API.
 *
 * State lives for the lifetime of the tab: invites and deletes are visible
 * until reload, then the seed is restored.
 *
 * Records are stored in the *backend's* `UserDto` shape (`pubkey`,
 * `firstName`/`lastName`, uppercase roles) rather than the app's `User` model,
 * so the handlers exercise the same parse/transform path as the real API and
 * `contract.test.ts` stays a genuine contract check.
 */

/** `UserDto` as served by iris-backend. */
export interface ApiUser {
  pubkey: string
  email: string
  firstName: string
  lastName: string
  role: Role
  image: { path: string } | null
  phone: string
  status: "ACTIVE" | "INACTIVE" | "BLOCKED" | "DELETED"
  emailVerifiedAt: string | null
  phoneVerifiedAt: string | null
  createdAt: string
  lastLogin: string | null
}

/**
 * The subset `/auth/profile` actually serves.
 *
 * `UserDto` also declares `isEmailVerified`/`isPhoneVerified`, but nothing
 * backs those names on the entity so `ClassSerializerInterceptor` drops them —
 * the real response carries no verification state at all.
 */
export type ApiProfile = Omit<ApiUser, "emailVerifiedAt" | "phoneVerifiedAt">

export interface SeedAccount extends ApiUser {
  password: string
}

const SEED_ACCOUNTS: readonly SeedAccount[] = [
  {
    pubkey: "usr_001",
    email: "admin@acme.test",
    password: "password123",
    firstName: "Avery",
    lastName: "Stone",
    role: ROLES.SUPERADMIN,
    image: null,
    phone: "+966500000001",
    status: "ACTIVE",
    emailVerifiedAt: "2024-01-20T09:00:00.000Z",
    phoneVerifiedAt: "2024-01-20T09:00:00.000Z",
    createdAt: "2024-01-15T09:00:00.000Z",
    lastLogin: "2024-08-01T09:00:00.000Z",
  },
  {
    pubkey: "usr_002",
    email: "user@acme.test",
    password: "password123",
    firstName: "Blake",
    lastName: "Rivera",
    role: ROLES.STAFF,
    image: null,
    phone: "+966500000002",
    status: "ACTIVE",
    emailVerifiedAt: "2024-01-20T09:00:00.000Z",
    phoneVerifiedAt: "2024-01-20T09:00:00.000Z",
    createdAt: "2024-03-02T11:30:00.000Z",
    lastLogin: null,
  },
  {
    pubkey: "usr_003",
    email: "casey@acme.test",
    password: "password123",
    firstName: "Casey",
    lastName: "Nguyen",
    role: ROLES.STAFF,
    image: null,
    phone: "+966500000003",
    status: "ACTIVE",
    emailVerifiedAt: "2024-01-20T09:00:00.000Z",
    phoneVerifiedAt: "2024-01-20T09:00:00.000Z",
    createdAt: "2024-05-21T14:45:00.000Z",
    lastLogin: null,
  },
  {
    pubkey: "usr_004",
    email: "dana@acme.test",
    password: "password123",
    firstName: "Dana",
    lastName: "Whitfield",
    role: ROLES.SUPERADMIN,
    image: null,
    phone: "+966500000004",
    status: "ACTIVE",
    emailVerifiedAt: "2024-01-20T09:00:00.000Z",
    phoneVerifiedAt: null,
    createdAt: "2024-07-08T08:15:00.000Z",
    lastLogin: null,
  },
  {
    pubkey: "usr_006",
    email: "frankie@acme.test",
    password: "password123",
    firstName: "Frankie",
    lastName: "Osei",
    role: ROLES.ADMIN,
    image: null,
    phone: "+966500000006",
    status: "ACTIVE",
    emailVerifiedAt: "2024-02-20T09:00:00.000Z",
    phoneVerifiedAt: "2024-02-20T09:00:00.000Z",
    createdAt: "2024-02-19T08:15:00.000Z",
    lastLogin: null,
  },
  {
    pubkey: "usr_007",
    email: "devadmin@acme.test",
    password: "password123",
    firstName: "Gale",
    lastName: "Sunderland",
    role: ROLES.ADMIN_DEVELOPER,
    image: null,
    phone: "+966500000007",
    status: "ACTIVE",
    emailVerifiedAt: "2024-03-20T09:00:00.000Z",
    phoneVerifiedAt: "2024-03-20T09:00:00.000Z",
    createdAt: "2024-03-19T08:15:00.000Z",
    lastLogin: null,
  },
  {
    // Authenticates successfully but has no business in the dashboard — this
    // is what the DASHBOARD_ROLES check at login exists for.
    pubkey: "usr_005",
    email: "customer@acme.test",
    password: "password123",
    firstName: "Emery",
    lastName: "Sadiq",
    role: ROLES.CUSTOMER,
    image: null,
    phone: "+966500000005",
    status: "ACTIVE",
    emailVerifiedAt: "2024-01-20T09:00:00.000Z",
    phoneVerifiedAt: "2024-01-20T09:00:00.000Z",
    createdAt: "2024-09-11T10:00:00.000Z",
    lastLogin: null,
  },
]

/**
 * Every seeded account, dashboard and app roles alike.
 *
 * The customer and professional accounts are declared further down, so this is
 * assembled after them — see `ALL_SEED_ACCOUNTS`.
 */
export const accounts: SeedAccount[] = []

/**
 * Customer and professional profile rows.
 *
 * The real endpoints return a profile wrapping the account under `user`, not a
 * flat user, so the mock stores them the same way — otherwise the schemas that
 * flatten those wrappers would never be exercised.
 */
export interface SeedProfile {
  pubkey: string
  /** `pubkey` of the account in `accounts`. */
  userPubkey: string
  createdAt: string
  note?: string | null
  hasTools?: boolean
  company?: string | null
  siret?: string | null
  area?: { pubkey: string; name: string } | null
}

const SEED_CUSTOMER_ACCOUNTS: readonly SeedAccount[] = [
  {
    pubkey: "usr_101",
    email: "hana@example.test",
    password: "password123",
    firstName: "Hana",
    lastName: "Aziz",
    role: ROLES.CUSTOMER,
    image: null,
    phone: "+966500000101",
    status: "ACTIVE",
    emailVerifiedAt: "2024-04-02T09:00:00.000Z",
    phoneVerifiedAt: "2024-04-02T09:00:00.000Z",
    createdAt: "2024-04-01T09:00:00.000Z",
    lastLogin: null,
  },
  {
    pubkey: "usr_102",
    email: "omar@example.test",
    password: "password123",
    firstName: "Omar",
    lastName: "Haddad",
    role: ROLES.CUSTOMER,
    image: null,
    phone: "+966500000102",
    status: "BLOCKED",
    emailVerifiedAt: "2024-05-02T09:00:00.000Z",
    phoneVerifiedAt: null,
    createdAt: "2024-05-01T09:00:00.000Z",
    lastLogin: null,
  },
]

const SEED_PROFESSIONAL_ACCOUNTS: readonly SeedAccount[] = [
  {
    pubkey: "usr_201",
    email: "yusuf@pro.test",
    password: "password123",
    firstName: "Yusuf",
    lastName: "Karim",
    role: ROLES.PROFESSIONAL,
    image: null,
    phone: "+966500000201",
    status: "ACTIVE",
    emailVerifiedAt: "2024-02-02T09:00:00.000Z",
    phoneVerifiedAt: "2024-02-02T09:00:00.000Z",
    createdAt: "2024-02-01T09:00:00.000Z",
    lastLogin: null,
  },
  {
    // Self-registered and awaiting approval — the state the approve action exists for.
    pubkey: "usr_202",
    email: "layla@pro.test",
    password: "password123",
    firstName: "Layla",
    lastName: "Nasser",
    role: ROLES.PROFESSIONAL,
    image: null,
    phone: "+966500000202",
    status: "INACTIVE",
    emailVerifiedAt: "2024-06-02T09:00:00.000Z",
    phoneVerifiedAt: "2024-06-02T09:00:00.000Z",
    createdAt: "2024-06-01T09:00:00.000Z",
    lastLogin: null,
  },
]

const SEED_CUSTOMERS: readonly SeedProfile[] = [
  {
    pubkey: "cus_001",
    userPubkey: "usr_101",
    createdAt: "2024-04-01T09:00:00.000Z",
    note: null,
  },
  {
    pubkey: "cus_002",
    userPubkey: "usr_102",
    createdAt: "2024-05-01T09:00:00.000Z",
    note: null,
  },
]

const SEED_PROFESSIONALS: readonly SeedProfile[] = [
  {
    pubkey: "pro_001",
    userPubkey: "usr_201",
    createdAt: "2024-02-01T09:00:00.000Z",
    hasTools: true,
    company: "Karim Maintenance",
    siret: "80012345600017",
    area: { pubkey: "area_01", name: "Riyadh North" },
  },
  {
    pubkey: "pro_002",
    userPubkey: "usr_202",
    createdAt: "2024-06-01T09:00:00.000Z",
    hasTools: false,
    company: null,
    siret: null,
    area: null,
  },
]

const ALL_SEED_ACCOUNTS: readonly SeedAccount[] = [
  ...SEED_ACCOUNTS,
  ...SEED_CUSTOMER_ACCOUNTS,
  ...SEED_PROFESSIONAL_ACCOUNTS,
]

accounts.push(...ALL_SEED_ACCOUNTS.map((account) => ({ ...account })))

export const customers: SeedProfile[] = SEED_CUSTOMERS.map((row) => ({
  ...row,
}))
export const professionals: SeedProfile[] = SEED_PROFESSIONALS.map((row) => ({
  ...row,
}))

/**
 * Opaque tokens, keyed to a user's pubkey. Nothing here is cryptography.
 *
 * The maps live in page memory, so they are empty after a reload. A token
 * therefore also *encodes* its user id, and the lookups fall back to parsing
 * it — otherwise every page reload would log the user out and the
 * session-bootstrap path would be impossible to exercise in development.
 * `revokedTokens` still wins, so logout behaves correctly within a session. A
 * real API would verify a signature here instead.
 */
const accessTokens = new Map<string, string>()
const refreshTokens = new Map<string, string>()
const revokedTokens = new Set<string>()

let tokenCounter = 0

function mintToken(prefix: string, pubkey: string): string {
  tokenCounter += 1
  return `${prefix}_${pubkey}_${tokenCounter}_${Date.now()}`
}

/** Recovers the pubkey baked into a token minted in a previous page load. */
function pubkeyFromToken(
  token: string,
  prefix: "at" | "rt",
): string | undefined {
  const match = new RegExp(`^${prefix}_(usr_\\d+)_\\d+_\\d+$`).exec(token)
  if (!match) return undefined
  const pubkey = match[1]
  return accounts.some((account) => account.pubkey === pubkey)
    ? pubkey
    : undefined
}

/** Mirrors `TokenResponseDto`: snake_case, with lifetimes alongside. */
export function issueTokens(pubkey: string): {
  access_token: string
  expires_in: string
  refresh_token: string
  refresh_expires_in: string
} {
  const accessToken = mintToken("at", pubkey)
  const refreshToken = mintToken("rt", pubkey)
  accessTokens.set(accessToken, pubkey)
  refreshTokens.set(refreshToken, pubkey)
  // The lifetimes really are strings on the wire — the server echoes the raw
  // `JWT_EXPIRATION_TIME` / `REFRESH_TOKEN_EXPIRATION` config values.
  return {
    access_token: accessToken,
    expires_in: "30d",
    refresh_token: refreshToken,
    refresh_expires_in: "40d",
  }
}

/**
 * Issues a fresh access token against a refresh token.
 *
 * Deliberately does *not* rotate the refresh token: the backend's
 * `refreshTokenUser` returns `{ access_token }` alone and leaves the stored
 * refresh token valid. Mocking rotation here would hide a real client bug.
 */
export function refreshAccessToken(
  refreshToken: string,
): { access_token: string } | null {
  if (revokedTokens.has(refreshToken)) return null

  const pubkey =
    refreshTokens.get(refreshToken) ?? pubkeyFromToken(refreshToken, "rt")
  if (!pubkey) return null

  const accessToken = mintToken("at", pubkey)
  accessTokens.set(accessToken, pubkey)
  return { access_token: accessToken }
}

export function revokeTokensFor(pubkey: string): void {
  for (const [token, owner] of refreshTokens) {
    if (owner === pubkey) {
      refreshTokens.delete(token)
      revokedTokens.add(token)
    }
  }
}

export function findAccountByCredentials(
  identifier: string,
  password: string,
): SeedAccount | undefined {
  return accounts.find(
    (account) =>
      account.email.toLowerCase() === identifier.toLowerCase() &&
      account.password === password,
  )
}

/** Resolves the caller from an `Authorization: Bearer <token>` header. */
export function resolveCaller(
  authorization: string | null,
): SeedAccount | undefined {
  if (!authorization?.startsWith("Bearer ")) return undefined
  const token = authorization.slice("Bearer ".length)
  const pubkey = accessTokens.get(token) ?? pubkeyFromToken(token, "at")
  if (!pubkey) return undefined
  return accounts.find((account) => account.pubkey === pubkey)
}

/** What `/auth/signin` returns: the raw entity, timestamps and all. */
export function toPublicUser(account: SeedAccount): ApiUser {
  const { password: _password, ...user } = account
  return user
}

/** What `/auth/profile` returns: the DTO subset, with no verification state. */
export function toProfile(account: SeedAccount): ApiProfile {
  const {
    password: _password,
    emailVerifiedAt: _emailVerifiedAt,
    phoneVerifiedAt: _phoneVerifiedAt,
    ...profile
  } = account
  return profile
}

export function addAccount(input: {
  email: string
  name: string
  role: Role
}): SeedAccount {
  const [firstName, ...rest] = input.name.trim().split(/\s+/)
  const account: SeedAccount = {
    pubkey: `usr_${String(accounts.length + 1).padStart(3, "0")}`,
    email: input.email,
    firstName: firstName ?? "",
    lastName: rest.join(" "),
    role: input.role,
    password: "password123",
    image: null,
    phone: "",
    status: "ACTIVE",
    emailVerifiedAt: null,
    phoneVerifiedAt: null,
    createdAt: new Date().toISOString(),
    lastLogin: null,
  }
  accounts.push(account)
  return account
}

/** Joins a profile row to its account, as the real `include: { user: … }` does. */
export function withUser(row: SeedProfile) {
  const account = accounts.find(
    (candidate) => candidate.pubkey === row.userPubkey,
  )
  if (!account) return null
  const { userPubkey: _userPubkey, ...profile } = row
  return { ...profile, user: toPublicUser(account) }
}

/** Sets an account's status — what `/professionals/:pubkey/approve` really does. */
export function setAccountStatus(
  userPubkey: string,
  status: SeedAccount["status"],
): boolean {
  const account = accounts.find((candidate) => candidate.pubkey === userPubkey)
  if (!account) return false
  account.status = status
  return true
}

export function removeProfile(
  collection: SeedProfile[],
  pubkey: string,
): boolean {
  const index = collection.findIndex((row) => row.pubkey === pubkey)
  if (index === -1) return false
  collection.splice(index, 1)
  return true
}

export function removeAccount(pubkey: string): boolean {
  const index = accounts.findIndex((account) => account.pubkey === pubkey)
  if (index === -1) return false
  accounts.splice(index, 1)
  return true
}

/**
 * Restores the seed state.
 *
 * `accounts` and the token maps are module-level mutable state, so without
 * this an invite or delete in one test leaks into the next and the suite
 * becomes order-dependent. Called from the global test `afterEach`; in the
 * browser a page reload does the same job.
 */
export function resetMockDb(): void {
  accounts.length = 0
  accounts.push(...ALL_SEED_ACCOUNTS.map((account) => ({ ...account })))
  customers.length = 0
  customers.push(...SEED_CUSTOMERS.map((row) => ({ ...row })))
  professionals.length = 0
  professionals.push(...SEED_PROFESSIONALS.map((row) => ({ ...row })))
  accessTokens.clear()
  refreshTokens.clear()
  revokedTokens.clear()
  tokenCounter = 0
}
