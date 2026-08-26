import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  type ColumnFiltersState,
  type ColumnVisibilityState,
  columnFilteringFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  FlexRender,
  type Row,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  type SortingState,
  tableFeatures,
  useTable,
} from "@tanstack/react-table"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  CircleCheckIcon,
  Columns3Icon,
  EllipsisVerticalIcon,
  GripVerticalIcon,
  LoaderIcon,
  PlusIcon,
  TrendingUpIcon,
} from "lucide-react"
import * as React from "react"
import { useTranslation } from "react-i18next"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useIsMobile } from "@/hooks/use-mobile"
import { i18next } from "@/lib/i18n"
// The block declared its own inline zod schema for a row. It is replaced by the
// feature schema so the shape is defined exactly once, next to the API call
// that validates it.
import type { TableRow as DashboardRow } from "../schemas"

// New in v9: declare the features this table uses — anything you don't
// register is tree-shaken out of the bundle.
const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
})

const columnHelper = createColumnHelper<typeof features, DashboardRow>()

/**
 * Closed enums that arrive on the wire in English. `value` is the wire value
 * and must match `src/mocks/data/table.json` byte-for-byte — `optionLabel`
 * matches on it, and a near-miss like "Cover Page" vs "Cover page" falls back
 * to the untranslated English. Only `key` selects the localized label, so the
 * badge in the table and the option in the drawer always read the same.
 */
const TYPE_OPTIONS = [
  { value: "Cover page", key: "coverPage" },
  { value: "Table of contents", key: "tableOfContents" },
  { value: "Narrative", key: "narrative" },
  { value: "Technical content", key: "technicalContent" },
  { value: "Plain language", key: "plainLanguage" },
  { value: "Research", key: "research" },
  { value: "Planning", key: "planning" },
  { value: "Financial", key: "financial" },
  { value: "Legal", key: "legal" },
  { value: "Visual", key: "visual" },
] as const

const STATUS_OPTIONS = [
  { value: "Done", key: "done" },
  { value: "In Process", key: "inProcess" },
] as const

/** Falls back to the raw wire value so an unknown enum member still renders. */
function optionLabel(
  options: readonly { value: string; key: string }[],
  group: string,
  value: string,
): string {
  const match = options.find((option) => option.value === value)
  if (!match) {
    // The fallback keeps an unknown enum member rendering, but silence is how
    // a stale option list goes unnoticed until someone screenshots the app in
    // Arabic. Say so in dev.
    if (import.meta.env.DEV) {
      console.warn(
        `[i18n] No "${group}" option matches the wire value "${value}" — rendering it untranslated.`,
      )
    }
    return value
  }
  return i18next.t(`dashboard.table.${group}.${match.key}`)
}

/** Column ids are technical; the toolbar shows their translated headers. */
const COLUMN_LABEL_KEYS: Record<string, string> = {
  header: "dashboard.table.columns.header",
  type: "dashboard.table.columns.sectionType",
  status: "dashboard.table.columns.status",
  target: "dashboard.table.columns.target",
  limit: "dashboard.table.columns.limit",
  reviewer: "dashboard.table.columns.reviewer",
}

/** Sentinel in the seed data meaning "nobody assigned yet". */
const UNASSIGNED_REVIEWER = "Assign reviewer"

/** Reviewers are people in the seed data, so these are names, not copy. */
const REVIEWERS = ["Eddie Lake", "Jamik Tashpulatov", "Emily Whalen"] as const

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
  const { t } = useTranslation()
  const { attributes, listeners } = useSortable({
    id,
  })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:bg-transparent"
    >
      <GripVerticalIcon className="size-3 text-muted-foreground" />
      <span className="sr-only">{t("dashboard.table.dragToReorder")}</span>
    </Button>
  )
}

const columns = columnHelper.columns([
  columnHelper.display({
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  }),
  columnHelper.display({
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label={i18next.t("dashboard.table.selectAll")}
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={i18next.t("dashboard.table.selectRow")}
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  }),
  columnHelper.accessor("header", {
    header: () => i18next.t("dashboard.table.columns.header"),
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />
    },
    enableHiding: false,
  }),
  columnHelper.accessor("type", {
    header: () => i18next.t("dashboard.table.columns.sectionType"),
    cell: ({ row }) => (
      <div className="w-32">
        <Badge variant="outline" className="px-1.5 text-muted-foreground">
          {optionLabel(TYPE_OPTIONS, "types", row.original.type)}
        </Badge>
      </div>
    ),
  }),
  columnHelper.accessor("status", {
    header: () => i18next.t("dashboard.table.columns.status"),
    cell: ({ row }) => (
      <Badge variant="outline" className="px-1.5 text-muted-foreground">
        {row.original.status === "Done" ? (
          <CircleCheckIcon className="fill-green-500 dark:fill-green-400" />
        ) : (
          <LoaderIcon />
        )}
        {optionLabel(STATUS_OPTIONS, "statuses", row.original.status)}
      </Badge>
    ),
  }),
  columnHelper.accessor("target", {
    header: () => (
      <div className="w-full text-end">
        {i18next.t("dashboard.table.columns.target")}
      </div>
    ),
    cell: ({ row }) => (
      <form
        onSubmit={(e) => {
          e.preventDefault()
          toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
            loading: i18next.t("dashboard.table.savingRow", {
              name: row.original.header,
            }),
            success: i18next.t("dashboard.table.saved"),
            error: i18next.t("dashboard.table.saveFailed"),
          })
        }}
      >
        <Label htmlFor={`${row.original.id}-target`} className="sr-only">
          {i18next.t("dashboard.table.columns.target")}
        </Label>
        <Input
          className="h-8 w-16 border-transparent bg-transparent text-end shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background dark:bg-transparent dark:hover:bg-input/30 dark:focus-visible:bg-input/30"
          defaultValue={row.original.target}
          id={`${row.original.id}-target`}
        />
      </form>
    ),
  }),
  columnHelper.accessor("limit", {
    header: () => (
      <div className="w-full text-end">
        {i18next.t("dashboard.table.columns.limit")}
      </div>
    ),
    cell: ({ row }) => (
      <form
        onSubmit={(e) => {
          e.preventDefault()
          toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
            loading: i18next.t("dashboard.table.savingRow", {
              name: row.original.header,
            }),
            success: i18next.t("dashboard.table.saved"),
            error: i18next.t("dashboard.table.saveFailed"),
          })
        }}
      >
        <Label htmlFor={`${row.original.id}-limit`} className="sr-only">
          {i18next.t("dashboard.table.columns.limit")}
        </Label>
        <Input
          className="h-8 w-16 border-transparent bg-transparent text-end shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background dark:bg-transparent dark:hover:bg-input/30 dark:focus-visible:bg-input/30"
          defaultValue={row.original.limit}
          id={`${row.original.id}-limit`}
        />
      </form>
    ),
  }),
  columnHelper.accessor("reviewer", {
    header: () => i18next.t("dashboard.table.columns.reviewer"),
    cell: ({ row }) => {
      const isAssigned = row.original.reviewer !== UNASSIGNED_REVIEWER

      if (isAssigned) {
        return row.original.reviewer
      }

      return (
        <>
          <Label htmlFor={`${row.original.id}-reviewer`} className="sr-only">
            {i18next.t("dashboard.table.columns.reviewer")}
          </Label>
          <Select>
            <SelectTrigger
              className="w-38 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate"
              size="sm"
              id={`${row.original.id}-reviewer`}
            >
              <SelectValue
                placeholder={i18next.t("dashboard.table.assignReviewer")}
              />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectGroup>
                {REVIEWERS.slice(0, 2).map((reviewer) => (
                  <SelectItem key={reviewer} value={reviewer}>
                    {reviewer}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </>
      )
    },
  }),
  columnHelper.display({
    id: "actions",
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
            size="icon"
          >
            <EllipsisVerticalIcon />
            <span className="sr-only">
              {i18next.t("dashboard.table.openMenu")}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem>
            {i18next.t("dashboard.table.rowActions.edit")}
          </DropdownMenuItem>
          <DropdownMenuItem>
            {i18next.t("dashboard.table.rowActions.makeCopy")}
          </DropdownMenuItem>
          <DropdownMenuItem>
            {i18next.t("dashboard.table.rowActions.favorite")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            {i18next.t("dashboard.table.rowActions.delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  }),
])

function DraggableRow({ row }: { row: Row<typeof features, DashboardRow> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          <FlexRender cell={cell} />
        </TableCell>
      ))}
    </TableRow>
  )
}

export interface DataTableProps {
  data: DashboardRow[]
  /** 1-based page number, owned by the caller and sent to the API. */
  page: number
  pageSize: number
  /** Total rows across all pages, from the API — drives the page count. */
  total: number
  onPaginationChange: (next: { page: number; pageSize: number }) => void
}

export function DataTable({
  data: initialData,
  page,
  pageSize,
  total,
  onPaginationChange,
}: DataTableProps) {
  const { t } = useTranslation()
  // Local copy so drag-to-reorder can rearrange the current page. Reordering
  // is presentational only — it is not persisted, and resets when the query
  // refetches or the page changes.
  const [data, setData] = React.useState(() => initialData)
  React.useEffect(() => {
    setData(initialData)
  }, [initialData])

  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  )
  const [sorting, setSorting] = React.useState<SortingState>([])

  // The table works in 0-based page indexes; the API is 1-based.
  // Stable identity comes from React Compiler, not a hand-written useMemo —
  // TanStack Table and dnd-kit both care about these references.
  const pagination = { pageIndex: page - 1, pageSize }

  const handlePaginationChange = (
    updater: React.SetStateAction<typeof pagination>,
  ) => {
    const next = typeof updater === "function" ? updater(pagination) : updater
    onPaginationChange({
      page: next.pageIndex + 1,
      pageSize: next.pageSize,
    })
  }

  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  )

  const dataIds: UniqueIdentifier[] = data?.map(({ id }) => id) || []

  const table = useTable({
    features,
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    // The server already sliced the page, so the table must not slice again.
    manualPagination: true,
    rowCount: total,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: handlePaginationChange,
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  return (
    <Tabs
      defaultValue="outline"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          {t("dashboard.table.views.label")}
        </Label>
        <Select defaultValue="outline">
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            size="sm"
            id="view-selector"
          >
            <SelectValue placeholder={t("dashboard.table.views.placeholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="outline">
                {t("dashboard.table.views.outline")}
              </SelectItem>
              <SelectItem value="past-performance">
                {t("dashboard.table.views.pastPerformance")}
              </SelectItem>
              <SelectItem value="key-personnel">
                {t("dashboard.table.views.keyPersonnel")}
              </SelectItem>
              <SelectItem value="focus-documents">
                {t("dashboard.table.views.focusDocuments")}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <TabsList className="hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:px-1 @4xl/main:flex">
          <TabsTrigger value="outline">
            {t("dashboard.table.views.outline")}
          </TabsTrigger>
          <TabsTrigger value="past-performance">
            {t("dashboard.table.views.pastPerformance")}{" "}
            <Badge variant="secondary">3</Badge>
          </TabsTrigger>
          <TabsTrigger value="key-personnel">
            {t("dashboard.table.views.keyPersonnel")}{" "}
            <Badge variant="secondary">2</Badge>
          </TabsTrigger>
          <TabsTrigger value="focus-documents">
            {t("dashboard.table.views.focusDocuments")}
          </TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Columns3Icon data-icon="inline-start" />
                {t("dashboard.table.columnsButton")}
                <ChevronDownIcon data-icon="inline-end" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide(),
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {COLUMN_LABEL_KEYS[column.id]
                        ? t(COLUMN_LABEL_KEYS[column.id])
                        : column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm">
            <PlusIcon />
            <span className="hidden lg:inline">
              {t("dashboard.table.addSection")}
            </span>
          </Button>
        </div>
      </div>
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder ? null : (
                            <FlexRender header={header} />
                          )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      {t("dashboard.table.noResults")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
            {/* Selection is per-page: only the current page is in the client. */}
            {t("dashboard.table.selectedCount", {
              selected: table.getFilteredSelectedRowModel().rows.length,
              total,
            })}
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                {t("table.rowsPerPage")}
              </Label>
              <Select
                value={`${table.state.pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue placeholder={table.state.pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  <SelectGroup>
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              {t("table.pageOf", {
                page: table.state.pagination.pageIndex + 1,
                pages: table.getPageCount(),
              })}
            </div>
            <div className="ms-auto flex items-center gap-2 lg:ms-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">
                  {t("dashboard.table.goToFirstPage")}
                </span>
                <ChevronsLeftIcon className="rtl:-scale-x-100" />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">
                  {t("dashboard.table.goToPreviousPage")}
                </span>
                <ChevronLeftIcon className="rtl:-scale-x-100" />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">
                  {t("dashboard.table.goToNextPage")}
                </span>
                <ChevronRightIcon className="rtl:-scale-x-100" />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">
                  {t("dashboard.table.goToLastPage")}
                </span>
                <ChevronsRightIcon className="rtl:-scale-x-100" />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent
        value="past-performance"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent
        value="focus-documents"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
    </Tabs>
  )
}

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

function TableCellViewer({ item }: { item: DashboardRow }) {
  const isMobile = useIsMobile()
  const { t } = useTranslation()

  const chartConfig = {
    desktop: {
      label: t("dashboard.table.detail.desktop"),
      color: "var(--primary)",
    },
    mobile: {
      label: t("dashboard.table.detail.mobile"),
      color: "var(--primary)",
    },
  } satisfies ChartConfig

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button
          variant="link"
          className="w-fit px-0 text-start text-foreground"
        >
          {item.header}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.header}</DrawerTitle>
          <DrawerDescription>
            {t("dashboard.table.detail.chartDescription")}
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          {!isMobile && (
            <>
              <ChartContainer config={chartConfig}>
                <AreaChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    left: 0,
                    right: 10,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                    hide
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Area
                    dataKey="mobile"
                    type="natural"
                    fill="var(--color-mobile)"
                    fillOpacity={0.6}
                    stroke="var(--color-mobile)"
                    stackId="a"
                  />
                  <Area
                    dataKey="desktop"
                    type="natural"
                    fill="var(--color-desktop)"
                    fillOpacity={0.4}
                    stroke="var(--color-desktop)"
                    stackId="a"
                  />
                </AreaChart>
              </ChartContainer>
              <Separator />
              <div className="grid gap-2">
                <div className="flex gap-2 leading-none font-medium">
                  {t("dashboard.table.detail.trend")}{" "}
                  <TrendingUpIcon className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  {t("dashboard.table.detail.trendDescription")}
                </div>
              </div>
              <Separator />
            </>
          )}
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="header">
                {t("dashboard.table.columns.header")}
              </Label>
              <Input id="header" defaultValue={item.header} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="type">
                  {t("dashboard.table.detail.typeLabel")}
                </Label>
                <Select defaultValue={item.type}>
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue
                      placeholder={t("dashboard.table.detail.typePlaceholder")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {t(`dashboard.table.types.${option.key}`)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="status">
                  {t("dashboard.table.columns.status")}
                </Label>
                <Select defaultValue={item.status}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue
                      placeholder={t(
                        "dashboard.table.detail.statusPlaceholder",
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {t(`dashboard.table.statuses.${option.key}`)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="target">
                  {t("dashboard.table.columns.target")}
                </Label>
                <Input id="target" defaultValue={item.target} />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="limit">
                  {t("dashboard.table.columns.limit")}
                </Label>
                <Input id="limit" defaultValue={item.limit} />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="reviewer">
                {t("dashboard.table.columns.reviewer")}
              </Label>
              <Select defaultValue={item.reviewer}>
                <SelectTrigger id="reviewer" className="w-full">
                  <SelectValue
                    placeholder={t(
                      "dashboard.table.detail.reviewerPlaceholder",
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {REVIEWERS.map((reviewer) => (
                      <SelectItem key={reviewer} value={reviewer}>
                        {reviewer}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </form>
        </div>
        <DrawerFooter>
          <Button>{t("dashboard.table.detail.submit")}</Button>
          <DrawerClose asChild>
            <Button variant="outline">
              {t("dashboard.table.detail.close")}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

/** Matches the real table's toolbar + row metrics to avoid layout shift. */
export function DataTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="flex w-full flex-col justify-start gap-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Skeleton className="h-9 w-64" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
      <div className="px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <div className="flex h-10 items-center gap-4 border-b bg-muted px-4">
            <Skeleton className="h-4 w-full" />
          </div>
          {Array.from({ length: rows }, (_, index) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder rows
              key={index}
              className="flex h-12 items-center gap-4 border-b px-4 last:border-0"
            >
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
