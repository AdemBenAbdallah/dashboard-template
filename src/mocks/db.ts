import { ROLES, type Role } from "@/features/auth/roles"
import type { User } from "@/features/auth/schemas"

/**
 * In-memory database for the mock API.
 *
 * State lives for the lifetime of the tab: invites and deletes are visible
 * until reload, then the seed is restored.
 */

export interface SeedAccount extends User {
  password: string
}

const SEED_ACCOUNTS: readonly SeedAccount[] = [
  {
    id: "usr_001",
    email: "admin@acme.test",
    password: "password123",
    name: "Avery Stone",
    role: ROLES.SUPERADMIN,
    avatarUrl: null,
    createdAt: "2024-01-15T09:00:00.000Z",
  },
  {
    id: "usr_002",
    email: "user@acme.test",
    password: "password123",
    name: "Blake Rivera",
    role: ROLES.PROFICIENT,
    avatarUrl: null,
    createdAt: "2024-03-02T11:30:00.000Z",
  },
  {
    id: "usr_003",
    email: "casey@acme.test",
    password: "password123",
    name: "Casey Nguyen",
    role: ROLES.PROFICIENT,
    avatarUrl: null,
    createdAt: "2024-05-21T14:45:00.000Z",
  },
  {
    id: "usr_004",
    email: "dana@acme.test",
    password: "password123",
    name: "Dana Whitfield",
    role: ROLES.SUPERADMIN,
    avatarUrl: null,
    createdAt: "2024-07-08T08:15:00.000Z",
  },
]

export const accounts: SeedAccount[] = SEED_ACCOUNTS.map((account) => ({
  ...account,
}))

/**
 * Opaque tokens, keyed to a user id. Nothing here is cryptography.
 *
 * The maps live in page memory, so they are empty after a reload. A refresh
 * token therefore also *encodes* its user id, and `rotateTokens` falls back to
 * parsing it — otherwise every page reload would log the user out and the
 * session-bootstrap path would be impossible to exercise in development.
 * `revokedTokens` still wins, so rotation and logout behave correctly within a
 * session. A real API would verify a signature here instead.
 */
const accessTokens = new Map<string, string>()
const refreshTokens = new Map<string, string>()
const revokedTokens = new Set<string>()

let tokenCounter = 0

function mintToken(prefix: string, userId: string): string {
  tokenCounter += 1
  return `${prefix}_${userId}_${tokenCounter}_${Date.now()}`
}

/** Recovers the user id baked into a token minted in a previous page load. */
function userIdFromToken(token: string): string | undefined {
  const match = /^rt_(usr_\d+)_\d+_\d+$/.exec(token)
  if (!match) return undefined
  const userId = match[1]
  return accounts.some((account) => account.id === userId) ? userId : undefined
}

export function issueTokens(userId: string): {
  accessToken: string
  refreshToken: string
} {
  const accessToken = mintToken("at", userId)
  const refreshToken = mintToken("rt", userId)
  accessTokens.set(accessToken, userId)
  refreshTokens.set(refreshToken, userId)
  return { accessToken, refreshToken }
}

/** Rotates the refresh token, mirroring what a real API should do. */
export function rotateTokens(refreshToken: string): {
  accessToken: string
  refreshToken: string
} | null {
  if (revokedTokens.has(refreshToken)) return null

  const userId =
    refreshTokens.get(refreshToken) ?? userIdFromToken(refreshToken)
  if (!userId) return null

  refreshTokens.delete(refreshToken)
  revokedTokens.add(refreshToken)
  return issueTokens(userId)
}

export function revokeRefreshToken(refreshToken: string | undefined): void {
  if (!refreshToken) return
  refreshTokens.delete(refreshToken)
  revokedTokens.add(refreshToken)
}

export function findAccountByCredentials(
  email: string,
  password: string,
): SeedAccount | undefined {
  return accounts.find(
    (account) =>
      account.email.toLowerCase() === email.toLowerCase() &&
      account.password === password,
  )
}

/** Resolves the caller from an `Authorization: Bearer <token>` header. */
export function resolveCaller(
  authorization: string | null,
): SeedAccount | undefined {
  if (!authorization?.startsWith("Bearer ")) return undefined
  const token = authorization.slice("Bearer ".length)
  const userId = accessTokens.get(token)
  if (!userId) return undefined
  return accounts.find((account) => account.id === userId)
}

export function toPublicUser(account: SeedAccount): User {
  const { password: _password, ...user } = account
  return user
}

export function addAccount(input: {
  email: string
  name: string
  role: Role
}): SeedAccount {
  const account: SeedAccount = {
    id: `usr_${String(accounts.length + 1).padStart(3, "0")}`,
    email: input.email,
    name: input.name,
    role: input.role,
    password: "password123",
    avatarUrl: null,
    createdAt: new Date().toISOString(),
  }
  accounts.push(account)
  return account
}

export function removeAccount(id: string): boolean {
  const index = accounts.findIndex((account) => account.id === id)
  if (index === -1) return false
  accounts.splice(index, 1)
  return true
}
