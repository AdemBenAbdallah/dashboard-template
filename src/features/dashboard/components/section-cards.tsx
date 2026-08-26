import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Ltr } from "@/components/shared/ltr"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { StatCard } from "../schemas"

const GRID_CLASSES =
  "grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card"

export function SectionCards({ cards }: { cards: StatCard[] }) {
  const { t } = useTranslation()

  return (
    <div className={GRID_CLASSES}>
      {cards.map((card) => {
        const TrendIcon = card.delta >= 0 ? TrendingUpIcon : TrendingDownIcon
        const sign = card.delta >= 0 ? "+" : ""

        return (
          <Card key={card.id} className="@container/card">
            <CardHeader>
              <CardDescription>
                {t(`dashboard.cards.${card.id}.label`)}
              </CardDescription>
              <CardTitle className="font-semibold text-2xl tabular-nums @[250px]/card:text-3xl">
                <Ltr>{card.value}</Ltr>
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <TrendIcon />
                  <Ltr>
                    {sign}
                    {card.delta}%
                  </Ltr>
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                {t(`dashboard.cards.${card.id}.trendLabel`)}{" "}
                <TrendIcon className="size-4" />
              </div>
              <div className="text-muted-foreground">
                {t(`dashboard.cards.${card.id}.description`)}
              </div>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}

/** Same grid and card metrics as the real thing, so nothing shifts on load. */
export function SectionCardsSkeleton() {
  return (
    <div className={GRID_CLASSES}>
      {[0, 1, 2, 3].map((index) => (
        <Card key={index} className="@container/card">
          <CardHeader>
            <CardDescription>
              <Skeleton className="h-4 w-24" />
            </CardDescription>
            <CardTitle className="font-semibold text-2xl tabular-nums @[250px]/card:text-3xl">
              <Skeleton className="h-8 w-32" />
            </CardTitle>
            <CardAction>
              <Skeleton className="h-6 w-16 rounded-md" />
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-48" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
