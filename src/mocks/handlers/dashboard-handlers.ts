import { HttpResponse, http } from "msw"
import {
  chartRangeSchema,
  type StatCard,
  type TableRow,
} from "@/features/dashboard/schemas"
import chartData from "../data/chart.json"
import tableData from "../data/table.json"
import { resolveCaller } from "../db"
import { API_URL, delay, unauthorized } from "./shared"

const STAT_CARDS: StatCard[] = [
  {
    id: "revenue",
    label: "Total Revenue",
    value: "$1,250.00",
    delta: 12.5,
    trendLabel: "Trending up this month",
    description: "Visitors for the last 6 months",
  },
  {
    id: "customers",
    label: "New Customers",
    value: "1,234",
    delta: -20,
    trendLabel: "Down 20% this period",
    description: "Acquisition needs attention",
  },
  {
    id: "accounts",
    label: "Active Accounts",
    value: "45,678",
    delta: 12.5,
    trendLabel: "Strong user retention",
    description: "Engagement exceeds targets",
  },
  {
    id: "growth",
    label: "Growth Rate",
    value: "4.5%",
    delta: 4.5,
    trendLabel: "Steady performance increase",
    description: "Meets growth projections",
  },
]

const RANGE_DAYS = { "7d": 7, "30d": 30, "90d": 90 } as const

/** The seed data ends here; ranges are measured back from it. */
const REFERENCE_DATE = new Date("2024-06-30")

const rows = tableData as TableRow[]
const points = chartData as { date: string; desktop: number; mobile: number }[]

export const dashboardHandlers = [
  http.get(`${API_URL}/dashboard/stats`, async ({ request }) => {
    await delay()
    if (!resolveCaller(request.headers.get("Authorization"))) {
      return unauthorized()
    }
    return HttpResponse.json({ cards: STAT_CARDS })
  }),

  http.get(`${API_URL}/dashboard/chart`, async ({ request }) => {
    await delay()
    if (!resolveCaller(request.headers.get("Authorization"))) {
      return unauthorized()
    }

    const url = new URL(request.url)
    const range = chartRangeSchema
      .catch("90d")
      .parse(url.searchParams.get("range"))

    const start = new Date(REFERENCE_DATE)
    start.setDate(start.getDate() - RANGE_DAYS[range])

    return HttpResponse.json({
      range,
      points: points.filter((point) => new Date(point.date) >= start),
    })
  }),

  http.get(`${API_URL}/dashboard/table`, async ({ request }) => {
    await delay()
    if (!resolveCaller(request.headers.get("Authorization"))) {
      return unauthorized()
    }

    const url = new URL(request.url)
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1)
    const pageSize = Math.max(1, Number(url.searchParams.get("pageSize")) || 10)
    const start = (page - 1) * pageSize

    return HttpResponse.json({
      rows: rows.slice(start, start + pageSize),
      page,
      pageSize,
      total: rows.length,
    })
  }),
]
