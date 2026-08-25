import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

/**
 * Placeholder rows that match the real table's header and row height, so
 * nothing shifts when the data arrives.
 */
export function TableSkeleton({
  columns,
  rows = 10,
}: {
  columns: readonly string[]
  rows?: number
}) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column}>{column}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }, (_, rowIndex) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder rows
            <TableRow key={rowIndex}>
              {columns.map((column) => (
                <TableCell key={column}>
                  <Skeleton className="h-5 w-full max-w-40" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
