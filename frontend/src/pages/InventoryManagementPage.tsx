import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, Edit, Warehouse, AlertTriangle } from 'lucide-react';
import { INVENTORY_LOCATIONS, type InventoryLocation } from '../lib/utils';
import { toast } from 'sonner';

interface InventoryItem {
  id: string;
  name: string;
  quantities: Record<InventoryLocation, number>;
  expiryDates: Record<InventoryLocation, string>;
}

function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

const isExpiringSoon = (dateStr: string): boolean => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
};

const isExpired = (dateStr: string): boolean => {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
};

export default function InventoryManagementPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState({
    name: '',
    quantities: { Bar: 0, 'FEC Cafe': 0, 'Battle Masters': 0 } as Record<InventoryLocation, number>,
    expiryDates: { Bar: '', 'FEC Cafe': '', 'Battle Masters': '' } as Record<InventoryLocation, string>,
  });

  const resetForm = () => setForm({
    name: '',
    quantities: { Bar: 0, 'FEC Cafe': 0, 'Battle Masters': 0 },
    expiryDates: { Bar: '', 'FEC Cafe': '', 'Battle Masters': '' },
  });

  const openEdit = (item: InventoryItem) => {
    setEditItem(item);
    setForm({ name: item.name, quantities: { ...item.quantities }, expiryDates: { ...item.expiryDates } });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Item name required'); return; }
    if (editItem) {
      setItems((prev) => prev.map((i) => i.id === editItem.id ? { ...editItem, name: form.name, quantities: { ...form.quantities }, expiryDates: { ...form.expiryDates } } : i));
      toast.success('Item updated');
      setEditItem(null);
    } else {
      setItems((prev) => [...prev, { id: generateId(), name: form.name, quantities: { ...form.quantities }, expiryDates: { ...form.expiryDates } }]);
      toast.success('Item added');
      setShowModal(false);
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success('Item deleted');
  };

  const updateQuantity = (itemId: string, location: InventoryLocation, qty: number) => {
    setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, quantities: { ...i.quantities, [location]: qty } } : i));
  };

  const updateExpiry = (itemId: string, location: InventoryLocation, date: string) => {
    setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, expiryDates: { ...i.expiryDates, [location]: date } } : i));
  };

  const getTotal = (item: InventoryItem) =>
    INVENTORY_LOCATIONS.reduce((sum, loc) => sum + (item.quantities[loc] || 0), 0);

  const ItemModal = ({ onClose }: { onClose: () => void }) => (
    <Dialog open={true} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">{editItem ? 'Edit Item' : 'Add Stock Item'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <Label className="text-foreground text-sm">Item Name *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-input border-border text-foreground mt-1" placeholder="e.g. Coca Cola, Crisps..." required />
          </div>
          {INVENTORY_LOCATIONS.map((loc) => (
            <div key={loc} className="border border-border rounded-lg p-3">
              <p className="font-medium text-foreground text-sm mb-2">{loc}</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-muted-foreground text-xs">Quantity</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.quantities[loc]}
                    onChange={(e) => setForm({ ...form, quantities: { ...form.quantities, [loc]: parseInt(e.target.value) || 0 } })}
                    className="bg-input border-border text-foreground mt-1"
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Expiry Date</Label>
                  <Input
                    type="date"
                    value={form.expiryDates[loc]}
                    onChange={(e) => setForm({ ...form, expiryDates: { ...form.expiryDates, [loc]: e.target.value } })}
                    className="bg-input border-border text-foreground mt-1"
                  />
                </div>
              </div>
            </div>
          ))}
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-border text-foreground">Cancel</Button>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );

  const LocationTable = ({ location }: { location: InventoryLocation | 'all' }) => {
    const displayItems = location === 'all' ? items : items.filter((i) => i.quantities[location as InventoryLocation] > 0 || i.expiryDates[location as InventoryLocation]);
    return (
      <div className="space-y-3">
        {displayItems.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Warehouse size={40} className="mx-auto mb-3 opacity-30" />
            <p>No stock items yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Item</th>
                  {location === 'all' ? (
                    <>
                      {INVENTORY_LOCATIONS.map((loc) => (
                        <th key={loc} className="text-center py-2 px-3 text-muted-foreground font-medium">{loc}</th>
                      ))}
                      <th className="text-center py-2 px-3 text-primary font-semibold">Total</th>
                    </>
                  ) : (
                    <>
                      <th className="text-center py-2 px-3 text-muted-foreground font-medium">Quantity</th>
                      <th className="text-center py-2 px-3 text-muted-foreground font-medium">Expiry Date</th>
                    </>
                  )}
                  <th className="text-right py-2 px-3 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayItems.map((item) => (
                  <tr key={item.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                    <td className="py-2 px-3 font-medium text-foreground">{item.name}</td>
                    {location === 'all' ? (
                      <>
                        {INVENTORY_LOCATIONS.map((loc) => (
                          <td key={loc} className="py-2 px-3 text-center">
                            <input
                              type="number"
                              min={0}
                              value={item.quantities[loc]}
                              onChange={(e) => updateQuantity(item.id, loc, parseInt(e.target.value) || 0)}
                              className="w-16 text-center bg-input border border-border rounded px-1 py-0.5 text-foreground text-sm"
                            />
                          </td>
                        ))}
                        <td className="py-2 px-3 text-center font-bold text-primary">{getTotal(item)}</td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 px-3 text-center">
                          <input
                            type="number"
                            min={0}
                            value={item.quantities[location as InventoryLocation]}
                            onChange={(e) => updateQuantity(item.id, location as InventoryLocation, parseInt(e.target.value) || 0)}
                            className="w-20 text-center bg-input border border-border rounded px-2 py-1 text-foreground text-sm"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="date"
                              value={item.expiryDates[location as InventoryLocation]}
                              onChange={(e) => updateExpiry(item.id, location as InventoryLocation, e.target.value)}
                              className="bg-input border border-border rounded px-2 py-1 text-foreground text-sm"
                            />
                            {item.expiryDates[location as InventoryLocation] && isExpired(item.expiryDates[location as InventoryLocation]) && (
                              <Badge className="text-xs bg-destructive/20 text-destructive">Expired</Badge>
                            )}
                            {item.expiryDates[location as InventoryLocation] && !isExpired(item.expiryDates[location as InventoryLocation]) && isExpiringSoon(item.expiryDates[location as InventoryLocation]) && (
                              <Badge className="text-xs bg-yellow-500/20 text-yellow-400">Soon</Badge>
                            )}
                          </div>
                        </td>
                      </>
                    )}
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(item)} className="w-7 h-7 p-0 text-muted-foreground hover:text-foreground">
                          <Edit size={13} />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)} className="w-7 h-7 p-0 text-muted-foreground hover:text-destructive">
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Inventory Management</h2>
          <p className="text-muted-foreground">Food & drink stock levels across all locations</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true); }} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus size={16} className="mr-2" />
          Add Item
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="bg-secondary border border-border">
          <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Central Stock</TabsTrigger>
          {INVENTORY_LOCATIONS.map((loc) => (
            <TabsTrigger key={loc} value={loc} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{loc}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Central Stock (All Locations)</h3>
            <LocationTable location="all" />
          </div>
        </TabsContent>
        {INVENTORY_LOCATIONS.map((loc) => (
          <TabsContent key={loc} value={loc} className="mt-4">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4">{loc} Stock</h3>
              <LocationTable location={loc} />
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {showModal && <ItemModal onClose={() => setShowModal(false)} />}
      {editItem && <ItemModal onClose={() => setEditItem(null)} />}
    </div>
  );
}
