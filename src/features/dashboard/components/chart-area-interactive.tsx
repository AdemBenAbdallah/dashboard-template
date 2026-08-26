import { type ReactNode, useEffect } from "react"
import { useTranslation } from "react-i18next"
// Recharts does not support RTL mirroring, so this chart always renders
// left-to-right (oldest -> newest, left -> right) even when the app locale is
// Arabic. Only the surrounding chrome (card title, range labels, tooltip
// text) is translated.
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useLocaleStore } from "@/features/locale/store"
import { useIsMobile } from "@/hooks/use-mobile"
import { type ChartPoint, type ChartRange, chartRangeSchema } from "../schemas"

const chartConfig = {
  visitors: { label: "Visitors" },
  desktop: { label: "Desktop", color: "var(--primary)" },
  mobile: { label: "Mobile", color: "var(--primary)" },
} satisfies ChartConfig

const RANGE_LABEL_KEY: Record<ChartRange, string> = {
  "90d": "dashboard.ranges.90d",
  "30d": "dashboard.ranges.30d",
  "7d": "dashboard.ranges.7d",
}

const RANGE_ORDER: ChartRange[] = ["90d", "30d", "7d"]

function formatDay(value: string | number, locale: string) {
  return new Date(value).toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    numberingSystem: "latn",
  })
}

interface ChartAreaInteractiveProps {
  points: ChartPoint[]
  range: ChartRange
  onRangeChange: (range: ChartRange) => void
  /** True while a range switch is refetching; dims the chart without unmounting. */
  isFetching?: boolean
}

export function ChartAreaInteractive({
  points,
  range,
  onRangeChange,
  isFetching = false,
}: ChartAreaInteractiveProps) {
  const { t } = useTranslation()
  const locale = useLocaleStore((state) => state.locale)
  const isMobile = useIsMobile()

  useEffect(() => {
    if (isMobile) onRangeChange("7d")
  }, [isMobile, onRangeChange])

  // The toggle group and select hand back a plain string; parse it so an
  // unexpected value can never widen `ChartRange`.
  const handleChange = (value: string) => {
    const parsed = chartRangeSchema.safeParse(value)
    if (parsed.success) onRangeChange(parsed.data)
  }

  /**
   * Recharts types the tooltip label as `ReactNode`, so narrow before
   * formatting and pass anything unexpected straight through.
   */
  const formatTooltipLabel = (label: ReactNode): ReactNode =>
    typeof label === "string" || typeof label === "number"
      ? formatDay(label, locale)
      : label

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>{t("dashboard.chart.title")}</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            {t("dashboard.chart.descriptionFull", {
              range: t(RANGE_LABEL_KEY[range]).toLowerCase(),
            })}
          </span>
          <span className="@[540px]/card:hidden">
            {t(RANGE_LABEL_KEY[range])}
          </span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={range}
            onValueChange={handleChange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            {RANGE_ORDER.map((value) => (
              <ToggleGroupItem key={value} value={value}>
                {t(RANGE_LABEL_KEY[value])}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <Select value={range} onValueChange={handleChange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label={t("dashboard.chart.selectTimeRangeAriaLabel")}
            >
              <SelectValue placeholder={t(RANGE_LABEL_KEY["90d"])} />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {RANGE_ORDER.map((value) => (
                <SelectItem key={value} value={value} className="rounded-lg">
                  {t(RANGE_LABEL_KEY[value])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className={`aspect-auto h-[250px] w-full transition-opacity ${
            isFetching ? "opacity-60" : "opacity-100"
          }`}
        >
          <AreaChart data={points}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => formatDay(value, locale)}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={formatTooltipLabel}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="mobile"
              type="natural"
              fill="url(#fillMobile)"
              stroke="var(--color-mobile)"
              stackId="a"
            />
            <Area
              dataKey="desktop"
              type="natural"
              fill="url(#fillDesktop)"
              stroke="var(--color-desktop)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function ChartAreaInteractiveSkeleton() {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-32" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-44" />
        </CardDescription>
        <CardAction>
          <Skeleton className="h-8 w-40 rounded-md" />
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <Skeleton className="h-[250px] w-full" />
      </CardContent>
    </Card>
  )
}
