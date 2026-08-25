import { authHandlers } from "./auth-handlers"
import { dashboardHandlers } from "./dashboard-handlers"
import { operationsHandlers } from "./operations-handlers"
import { usersHandlers } from "./users-handlers"

export const handlers = [
  ...authHandlers,
  ...dashboardHandlers,
  ...operationsHandlers,
  ...usersHandlers,
]
