import React, { useState } from 'react';
import { useGetAllCategories, useGetAllItems, useIsCallerAdmin } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { ScrollArea } from '../components/ui/scroll-area';
import { Package, AlertTriangle, CheckCircle, Clock, Pencil } from 'lucide-react';
import type { InventoryItem, InventoryCategory } from '../backend';
import { OrderStatus } from '../backend';
import { formatOrderStatusLabel } from '../lib/utils';
import EditInventoryItemModal from '../components/inventory/EditInventoryItemModal';

function formatDate(ts?: bigint): string {
  if (!ts) return '—';
  return new Date(Number(ts) / 1_000_000).toLocaleDateString('en-GB');
}

function isExpired(ts?: bigint): boolean {
  if (!ts) return false;
  return Number(ts) / 1_000_000 < Date.now();
}

function isExpiringSoon(ts?: bigint): boolean {
  if (!ts) return false;
  const ms = Number(ts) / 1_000_000;
  return ms > Date.now() && ms < Date.now() + 30 * 24 * 60 * 60 * 1000;
}

function OrderStatusBadge({ status }: { status: InventoryItem['orderStatus'] }) {
  if (status === OrderStatus.ok) {
    return (
      <Badge variant="secondary" className="bg-green-100 text-green-800 gap-1">
        <CheckCircle className="w-3 h-3" />
        OK
      </Badge>
    );
  }
  if (status === OrderStatus.orderRequired) {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertTriangle className="w-3 h-3" />
        Order Required
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1">
      <Clock className="w-3 h-3" />
      Ordered
    </Badge>
  );
}

export default function InventoryManagementPage() {
  const { data: categories = [], isLoading: categoriesLoading } = useGetAllCategories();
  const { data: allItems = [], isLoading: itemsLoading } = useGetAllItems();
  const { data: isAdmin } = useIsCallerAdmin();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const isLoading = categoriesLoading || itemsLoading;

  // Auto-select first category
  React.useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].categoryId);
    }
  }, [categories, selectedCategoryId]);

  const filteredItems = selectedCategoryId
    ? allItems.filter((item) => item.categoryId === selectedCategoryId)
    : allItems;

  const selectedCategory = categories.find((c) => c.categoryId === selectedCategoryId);

  const getLowStockCount = (catId: string) => {
    return allItems.filter(
      (item) => item.categoryId === catId && item.currentStockCount < item.minimumStockLevel
    ).length;
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="flex gap-4">
          <Skeleton className="h-64 w-48" />
          <Skeleton className="h-64 flex-1" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Package className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-display text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground text-sm">
            Track stock levels and manage inventory items
          </p>
        </div>
      </div>

      {categories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No inventory categories found.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Contact an administrator to set up inventory categories.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex gap-4 items-start">
          {/* Category Sidebar */}
          <Card className="w-52 shrink-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display">Categories</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="space-y-1">
                  {categories.map((cat) => {
                    const lowStock = getLowStockCount(cat.categoryId);
                    const isSelected = selectedCategoryId === cat.categoryId;
                    return (
                      <button
                        key={cat.categoryId}
                        onClick={() => setSelectedCategoryId(cat.categoryId)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between gap-1 ${
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted text-foreground'
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        {lowStock > 0 && (
                          <span
                            className={`text-xs rounded-full px-1.5 py-0.5 shrink-0 ${
                              isSelected
                                ? 'bg-primary-foreground/20 text-primary-foreground'
                                : 'bg-destructive/10 text-destructive'
                            }`}
                          >
                            {lowStock}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Items Table */}
          <div className="flex-1 min-w-0">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-display">
                    {selectedCategory?.name ?? 'All Items'}
                  </CardTitle>
                  <Badge variant="outline">{filteredItems.length} items</Badge>
                </div>
                {selectedCategory?.description && (
                  <p className="text-sm text-muted-foreground">{selectedCategory.description}</p>
                )}
              </CardHeader>
              <CardContent className="p-0">
                {filteredItems.length === 0 ? (
                  <div className="py-12 text-center">
                    <Package className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">No items in this category.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                            Item
                          </th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                            Stock
                          </th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                            Supplier
                          </th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                            Expiry
                          </th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                            Order Status
                          </th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                            Price
                          </th>
                          {isAdmin && (
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                              Actions
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredItems.map((item) => {
                          const lowStock = item.currentStockCount < item.minimumStockLevel;
                          const expired = isExpired(item.expiryDate);
                          const expiringSoon = isExpiringSoon(item.expiryDate);

                          return (
                            <tr
                              key={item.itemId}
                              className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                            >
                              <td className="px-4 py-3">
                                <div>
                                  <p className="font-medium text-foreground">{item.name}</p>
                                  {item.size && (
                                    <p className="text-xs text-muted-foreground">{item.size}</p>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`font-semibold ${
                                      lowStock ? 'text-destructive' : 'text-foreground'
                                    }`}
                                  >
                                    {String(item.currentStockCount)}
                                  </span>
                                  <span className="text-muted-foreground text-xs">
                                    / {String(item.minimumStockLevel)} min
                                  </span>
                                  {lowStock && (
                                    <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-muted-foreground">
                                {item.supplier || '—'}
                              </td>
                              <td className="px-4 py-3">
                                {item.expiryDate ? (
                                  <span
                                    className={
                                      expired
                                        ? 'text-destructive font-medium'
                                        : expiringSoon
                                        ? 'text-amber-600 font-medium'
                                        : 'text-muted-foreground'
                                    }
                                  >
                                    {formatDate(item.expiryDate)}
                                    {expired && ' (Expired)'}
                                    {!expired && expiringSoon && ' (Soon)'}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <OrderStatusBadge status={item.orderStatus} />
                              </td>
                              <td className="px-4 py-3 text-muted-foreground">
                                {item.price != null ? `£${item.price.toFixed(2)}` : '—'}
                              </td>
                              {isAdmin && (
                                <td className="px-4 py-3">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingItem(item)}
                                    className="h-7 w-7 p-0"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <EditInventoryItemModal
          item={editingItem}
          open={!!editingItem}
          onClose={() => setEditingItem(null)}
        />
      )}
    </div>
  );
}
