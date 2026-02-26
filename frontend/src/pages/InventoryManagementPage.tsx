import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Warehouse, AlertTriangle, PackageCheck, Clock, ChevronRight } from "lucide-react";
import { useGetAllCategories, useGetItemsByCategory } from "../hooks/useQueries";
import { formatDate, nanosecondsToDate, isExpired, isExpiringSoon } from "../lib/utils";
import { OrderStatus } from "../backend";
import type { InventoryItem } from "../backend";
import { cn } from "../lib/utils";

function formatOrderStatus(status: OrderStatus): { label: string; className: string } {
  switch (status) {
    case OrderStatus.orderRequired:
      return { label: "Order Required", className: "bg-red-600/20 text-red-400 border-red-600/30" };
    case OrderStatus.ordered:
      return { label: "Ordered", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
    case OrderStatus.ok:
    default:
      return { label: "OK", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" };
  }
}

function ExpiryCell({ expiryDate }: { expiryDate?: bigint }) {
  if (!expiryDate) return <span className="text-muted-foreground text-xs">—</span>;

  const expired = isExpired(expiryDate);
  const expiringSoon = !expired && isExpiringSoon(expiryDate);

  return (
    <div className="flex items-center gap-1.5">
      <span className={cn(
        "text-xs",
        expired ? "text-red-400" : expiringSoon ? "text-amber-400" : "text-foreground"
      )}>
        {formatDate(expiryDate)}
      </span>
      {expired && (
        <Badge className="text-[10px] px-1 py-0 bg-red-600/20 text-red-400 border-red-600/30">Expired</Badge>
      )}
      {expiringSoon && (
        <Badge className="text-[10px] px-1 py-0 bg-amber-500/20 text-amber-400 border-amber-500/30">Soon</Badge>
      )}
    </div>
  );
}

function StockCountCell({ item }: { item: InventoryItem }) {
  const count = Number(item.currentStockCount);
  const min = Number(item.minimumStockLevel);
  const isLow = min > 0 && count <= min;

  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("font-medium", isLow ? "text-red-400" : "text-foreground")}>
        {count}
      </span>
      {isLow && <AlertTriangle size={12} className="text-red-400" />}
    </div>
  );
}

function ItemsTable({ categoryId }: { categoryId: string }) {
  const { data: items, isLoading, isError } = useGetItemsByCategory(categoryId);

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <AlertTriangle size={36} className="mb-3 text-red-400 opacity-60" />
        <p className="text-sm">Failed to load items. Please try again.</p>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Warehouse size={40} className="mb-3 opacity-30" />
        <p className="text-sm font-medium">No items in this category</p>
        <p className="text-xs mt-1 opacity-70">Items will appear here once added by management.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent">
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Item Name</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Supplier</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Frequency</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider text-center">Stock</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Expiry Date</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Last Stocktake</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Checked By</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Order Status</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Expected Delivery</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const statusInfo = formatOrderStatus(item.orderStatus);
            return (
              <TableRow
                key={item.itemId}
                className="border-border/30 hover:bg-white/5 transition-colors"
              >
                <TableCell className="font-medium text-foreground text-sm py-3">
                  {item.name}
                  {item.size && (
                    <span className="ml-1.5 text-xs text-muted-foreground">({item.size})</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{item.supplier || "—"}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{item.orderFrequency || "—"}</TableCell>
                <TableCell className="text-center">
                  <StockCountCell item={item} />
                </TableCell>
                <TableCell>
                  <ExpiryCell expiryDate={item.expiryDate} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {item.lastStocktakeDate ? formatDate(item.lastStocktakeDate) : "—"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {item.lastStocktakeBy ?? "—"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn("text-xs font-medium border", statusInfo.className)}
                  >
                    {statusInfo.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {item.expectedDeliveryDate ? formatDate(item.expectedDeliveryDate) : "—"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default function InventoryManagementPage() {
  const { data: categories, isLoading: categoriesLoading, isError: categoriesError } = useGetAllCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  // Auto-select first category once loaded
  React.useEffect(() => {
    if (categories && categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].categoryId);
    }
  }, [categories, selectedCategoryId]);

  const selectedCategory = categories?.find((c) => c.categoryId === selectedCategoryId);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Inventory Management</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            View stock levels, expiry dates, and order status across all categories.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border rounded-lg px-3 py-2">
          <PackageCheck size={14} className="text-primary" />
          <span>Read-only view</span>
        </div>
      </div>

      {/* Summary Legend */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          OK
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
          Order Required
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
          Ordered / Expiring Soon
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <AlertTriangle size={12} className="text-red-400" />
          Low / Expired Stock
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-4 min-h-[600px]">
        {/* Category Sidebar */}
        <div className="w-56 flex-shrink-0">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Categories</p>
            </div>
            {categoriesLoading ? (
              <div className="p-3 space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-full rounded-md" />
                ))}
              </div>
            ) : categoriesError ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                <AlertTriangle size={20} className="mx-auto mb-2 text-red-400" />
                Failed to load categories
              </div>
            ) : (
              <ScrollArea className="h-[540px]">
                <div className="p-2 space-y-0.5">
                  {categories?.map((cat) => (
                    <button
                      key={cat.categoryId}
                      onClick={() => setSelectedCategoryId(cat.categoryId)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-150 text-left",
                        selectedCategoryId === cat.categoryId
                          ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                          : "text-foreground hover:bg-secondary/60 hover:text-foreground"
                      )}
                    >
                      <span className="truncate">{cat.name}</span>
                      {selectedCategoryId === cat.categoryId && (
                        <ChevronRight size={14} className="flex-shrink-0 ml-1" />
                      )}
                    </button>
                  ))}
                  {(!categories || categories.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground text-xs">
                      No categories found
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        {/* Items Panel */}
        <div className="flex-1 min-w-0">
          <div className="bg-card border border-border rounded-xl overflow-hidden h-full">
            {/* Panel Header */}
            <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-primary/10 to-transparent flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">
                  {selectedCategory ? selectedCategory.name : "Select a Category"}
                </h3>
                {selectedCategory?.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedCategory.description}</p>
                )}
              </div>
              {selectedCategoryId && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock size={12} />
                  <span>Live data</span>
                </div>
              )}
            </div>

            {/* Items Table */}
            {!selectedCategoryId ? (
              <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                <Warehouse size={48} className="mb-4 opacity-20" />
                <p className="text-sm font-medium">Select a category to view items</p>
                <p className="text-xs mt-1 opacity-60">Choose from the list on the left</p>
              </div>
            ) : (
              <ItemsTable categoryId={selectedCategoryId} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
