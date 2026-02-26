import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useUpdateInventoryItem, useGetAllCategories } from '../../hooks/useQueries';
import type { InventoryItem } from '../../backend';
import { OrderStatus } from '../../backend';

interface EditInventoryItemModalProps {
  item: InventoryItem;
  open: boolean;
  onClose: () => void;
}

function bigintToDateString(val?: bigint): string {
  if (!val) return '';
  const ms = Number(val) / 1_000_000;
  return new Date(ms).toISOString().split('T')[0];
}

function dateStringToBigint(val: string): bigint | undefined {
  if (!val) return undefined;
  return BigInt(new Date(val).getTime()) * 1_000_000n;
}

export default function EditInventoryItemModal({
  item,
  open,
  onClose,
}: EditInventoryItemModalProps) {
  const { data: categories = [] } = useGetAllCategories();
  const updateItem = useUpdateInventoryItem();

  const [name, setName] = useState(item.name);
  const [categoryId, setCategoryId] = useState(item.categoryId);
  const [supplier, setSupplier] = useState(item.supplier);
  const [orderFrequency, setOrderFrequency] = useState(item.orderFrequency);
  const [currentStockCount, setCurrentStockCount] = useState(String(item.currentStockCount));
  const [minimumStockLevel, setMinimumStockLevel] = useState(String(item.minimumStockLevel));
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(item.orderStatus as OrderStatus);
  const [expiryDate, setExpiryDate] = useState(bigintToDateString(item.expiryDate));
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(
    bigintToDateString(item.expectedDeliveryDate)
  );
  const [price, setPrice] = useState(item.price != null ? String(item.price) : '');
  const [size, setSize] = useState(item.size ?? '');

  // Reset form when item changes
  useEffect(() => {
    setName(item.name);
    setCategoryId(item.categoryId);
    setSupplier(item.supplier);
    setOrderFrequency(item.orderFrequency);
    setCurrentStockCount(String(item.currentStockCount));
    setMinimumStockLevel(String(item.minimumStockLevel));
    setOrderStatus(item.orderStatus as OrderStatus);
    setExpiryDate(bigintToDateString(item.expiryDate));
    setExpectedDeliveryDate(bigintToDateString(item.expectedDeliveryDate));
    setPrice(item.price != null ? String(item.price) : '');
    setSize(item.size ?? '');
  }, [item]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Item name is required');
      return;
    }
    if (!categoryId) {
      toast.error('Category is required');
      return;
    }

    const updatedItem: InventoryItem = {
      ...item,
      name: name.trim(),
      categoryId,
      supplier: supplier.trim(),
      orderFrequency: orderFrequency.trim(),
      currentStockCount: BigInt(parseInt(currentStockCount) || 0),
      minimumStockLevel: BigInt(parseInt(minimumStockLevel) || 0),
      orderStatus,
      expiryDate: dateStringToBigint(expiryDate),
      expectedDeliveryDate: dateStringToBigint(expectedDeliveryDate),
      price: price ? parseFloat(price) : undefined,
      size: size.trim() || undefined,
    };

    try {
      await updateItem.mutateAsync(updatedItem);
      toast.success('Item updated successfully');
      onClose();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to update item');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Edit Inventory Item</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1">
            <Label htmlFor="edit-item-name">Item Name *</Label>
            <Input
              id="edit-item-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Item name"
            />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <Label>Category *</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.categoryId} value={cat.categoryId}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Supplier */}
          <div className="space-y-1">
            <Label htmlFor="edit-supplier">Supplier</Label>
            <Input
              id="edit-supplier"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="Supplier name"
            />
          </div>

          {/* Order Frequency */}
          <div className="space-y-1">
            <Label htmlFor="edit-order-freq">Order Frequency</Label>
            <Input
              id="edit-order-freq"
              value={orderFrequency}
              onChange={(e) => setOrderFrequency(e.target.value)}
              placeholder="e.g. Weekly, Monthly"
            />
          </div>

          {/* Stock Counts */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="edit-stock-count">Current Stock</Label>
              <Input
                id="edit-stock-count"
                type="number"
                min="0"
                value={currentStockCount}
                onChange={(e) => setCurrentStockCount(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-min-stock">Minimum Stock Level</Label>
              <Input
                id="edit-min-stock"
                type="number"
                min="0"
                value={minimumStockLevel}
                onChange={(e) => setMinimumStockLevel(e.target.value)}
              />
            </div>
          </div>

          {/* Order Status */}
          <div className="space-y-1">
            <Label>Order Status</Label>
            <Select
              value={orderStatus}
              onValueChange={(v) => setOrderStatus(v as OrderStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={OrderStatus.ok}>OK</SelectItem>
                <SelectItem value={OrderStatus.orderRequired}>Order Required</SelectItem>
                <SelectItem value={OrderStatus.ordered}>Ordered</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price & Size */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="edit-price">Price (£)</Label>
              <Input
                id="edit-price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-size">Size</Label>
              <Input
                id="edit-size"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="e.g. 500ml"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="edit-expiry">Expiry Date</Label>
              <Input
                id="edit-expiry"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-delivery">Expected Delivery</Label>
              <Input
                id="edit-delivery"
                type="date"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={updateItem.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateItem.isPending}>
            {updateItem.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
