import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react"
import { useId } from "react"
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
  const pageSizeId = useId()
  const pages = pageCount(total, pageSize)
  const isFirst = page <= 1
  const isLast = page >= pages

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="hidden text-muted-foreground text-sm lg:block">
        {total} {total === 1 ? "row" : "rows"}
      </p>

      <div className="flex w-full items-center justify-between gap-6 lg:w-fit">
        <div className="flex items-center gap-2">
          <Label htmlFor={pageSizeId} className="font-medium text-sm">
            Rows per page
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
          Page {page} of {pages}
        </p>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            disabled={disabled || isFirst}
            onClick={() => onChange({ page: 1, pageSize })}
          >
            <ChevronsLeftIcon />
            <span className="sr-only">First page</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={disabled || isFirst}
            onClick={() => onChange({ page: page - 1, pageSize })}
          >
            <ChevronLeftIcon />
            <span className="sr-only">Previous page</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={disabled || isLast}
            onClick={() => onChange({ page: page + 1, pageSize })}
          >
            <ChevronRightIcon />
            <span className="sr-only">Next page</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            disabled={disabled || isLast}
            onClick={() => onChange({ page: pages, pageSize })}
          >
            <ChevronsRightIcon />
            <span className="sr-only">Last page</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
