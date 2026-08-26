import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react"
import { useId } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  PAGE_SIZE_OPTIONS,
  type PaginationParams,
  pageCount,
} from "@/lib/pagination"

interface TablePaginationProps extends PaginationParams {
  total: number
  onChange: (next: PaginationParams) => void
  disabled?: boolean
}

/**
 * Pagination footer shared by the list pages. The dashboard's data table has
 * its own controls because TanStack Table owns that state.
 */
export function TablePagination({
  page,
  pageSize,
  total,
  onChange,
  disabled = false,
}: TablePaginationProps) {
  const { t } = useTranslation()
  const pageSizeId = useId()
  const pages = pageCount(total, pageSize)
  const isFirst = page <= 1
  const isLast = page >= pages

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="hidden text-muted-foreground text-sm lg:block">
        {t("table.rowCount", { count: total })}
      </p>

      <div className="flex w-full items-center justify-between gap-6 lg:w-fit">
        <div className="flex items-center gap-2">
          <Label htmlFor={pageSizeId} className="font-medium text-sm">
            {t("table.rowsPerPage")}
          </Label>
          <Select
            value={String(pageSize)}
            disabled={disabled}
            // Changing page size returns to page 1 so the view can't land past
            // the end of the list.
            onValueChange={(value) =>
              onChange({ page: 1, pageSize: Number(value) })
            }
          >
            <SelectTrigger size="sm" className="w-20" id={pageSizeId}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="font-medium text-sm">
          {t("table.pageOf", { page, pages })}
        </p>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            disabled={disabled || isFirst}
            onClick={() => onChange({ page: 1, pageSize })}
          >
            <ChevronsLeftIcon className="rtl:-scale-x-100" />
            <span className="sr-only">{t("table.firstPage")}</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={disabled || isFirst}
            onClick={() => onChange({ page: page - 1, pageSize })}
          >
            <ChevronLeftIcon className="rtl:-scale-x-100" />
            <span className="sr-only">{t("table.previousPage")}</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={disabled || isLast}
            onClick={() => onChange({ page: page + 1, pageSize })}
          >
            <ChevronRightIcon className="rtl:-scale-x-100" />
            <span className="sr-only">{t("table.nextPage")}</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            disabled={disabled || isLast}
            onClick={() => onChange({ page: pages, pageSize })}
          >
            <ChevronsRightIcon className="rtl:-scale-x-100" />
            <span className="sr-only">{t("table.lastPage")}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
