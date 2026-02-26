import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Package, ChevronRight, Trash2 } from 'lucide-react';
import { EXPERIENCE_OPTIONS, generateId, dateToNanoseconds } from '../lib/utils';
import { toast } from 'sonner';

type StockStatus = 'requested' | 'ordered' | 'delivered';

interface StockRequest {
  id: string;
  item: string;
  experience: string;
  quantity: number;
  comment: string;
  status: StockStatus;
  createdAt: number;
}

const STATUS_COLORS: Record<StockStatus, string> = {
  requested: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  ordered: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const STATUS_LABELS: Record<StockStatus, string> = {
  requested: 'Requested',
  ordered: 'Ordered',
  delivered: 'Delivered',
};

const COLUMNS: StockStatus[] = ['requested', 'ordered', 'delivered'];

export default function StockRequestsPage() {
  const [requests, setRequests] = useState<StockRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [form, setForm] = useState({ item: '', experience: '', quantity: 1, comment: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.item || !form.experience) {
      toast.error('Please fill in all required fields');
      return;
    }
    const newRequest: StockRequest = {
      id: generateId(),
      item: form.item,
      experience: form.experience,
      quantity: form.quantity,
      comment: form.comment,
      status: 'requested',
      createdAt: Date.now(),
    };
    setRequests((prev) => [newRequest, ...prev]);
    setForm({ item: '', experience: '', quantity: 1, comment: '' });
    setShowForm(false);
    toast.success('Stock request submitted');
  };

  const updateStatus = (id: string, status: StockStatus) => {
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    toast.success(`Moved to ${STATUS_LABELS[status]}`);
  };

  const deleteRequest = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    toast.success('Request deleted');
  };

  const handleDragStart = (id: string) => setDragId(id);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent, status: StockStatus) => {
    e.preventDefault();
    if (dragId) {
      updateStatus(dragId, status);
      setDragId(null);
    }
  };

  const getNextStatus = (current: StockStatus): StockStatus | null => {
    if (current === 'requested') return 'ordered';
    if (current === 'ordered') return 'delivered';
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Stock Requests</h2>
          <p className="text-muted-foreground">Submit and track stock requests</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus size={16} className="mr-2" />
          New Request
        </Button>
      </div>

      {/* Request Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4">New Stock Request</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground text-sm">Item Name *</Label>
                <Input
                  value={form.item}
                  onChange={(e) => setForm({ ...form, item: e.target.value })}
                  placeholder="e.g. Coca Cola, Crisps..."
                  className="bg-input border-border text-foreground mt-1"
                  required
                />
              </div>
              <div>
                <Label className="text-foreground text-sm">Experience / Building *</Label>
                <Select value={form.experience} onValueChange={(v) => setForm({ ...form, experience: v })}>
                  <SelectTrigger className="bg-input border-border text-foreground mt-1">
                    <SelectValue placeholder="Select experience or building..." />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border max-h-60">
                    {EXPERIENCE_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-foreground text-sm">Quantity *</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })}
                  className="bg-input border-border text-foreground mt-1"
                  required
                />
              </div>
              <div>
                <Label className="text-foreground text-sm">Comment</Label>
                <Textarea
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  placeholder="Any additional notes..."
                  className="bg-input border-border text-foreground mt-1"
                  rows={2}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-border text-foreground">Cancel</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">Submit Request</Button>
            </div>
          </form>
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((status) => {
          const colRequests = requests.filter((r) => r.status === status);
          return (
            <div
              key={status}
              className="bg-card border border-border rounded-xl p-4 min-h-[300px]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">{STATUS_LABELS[status]}</h3>
                <Badge className={`text-xs ${STATUS_COLORS[status]}`}>{colRequests.length}</Badge>
              </div>
              <div className="space-y-3">
                {colRequests.map((req) => {
                  const nextStatus = getNextStatus(req.status);
                  return (
                    <div
                      key={req.id}
                      draggable
                      onDragStart={() => handleDragStart(req.id)}
                      className="bg-secondary border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-primary transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-foreground text-sm">{req.item}</p>
                          <p className="text-xs text-muted-foreground">{req.experience}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">×{req.quantity}</span>
                          <Button size="sm" variant="ghost" onClick={() => deleteRequest(req.id)} className="w-6 h-6 p-0 text-muted-foreground hover:text-destructive">
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </div>
                      {req.comment && (
                        <p className="text-xs text-muted-foreground mb-2 italic">"{req.comment}"</p>
                      )}
                      {nextStatus && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(req.id, nextStatus)}
                          className="w-full text-xs border-border text-foreground hover:bg-secondary mt-1"
                        >
                          Move to {STATUS_LABELS[nextStatus]}
                          <ChevronRight size={12} className="ml-1" />
                        </Button>
                      )}
                    </div>
                  );
                })}
                {colRequests.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed border-border rounded-lg">
                    Drop items here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
