import React, { useState, useEffect, useRef } from 'react';
import { Package, Plus, Archive, ChevronDown, Loader2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  useGetStockRequestsByStatus,
  useCreateStockRequest,
  useUpdateStockRequestStatus,
  useArchiveDeliveredRequests,
  useGetCallerUserProfile,
} from '../hooks/useQueries';
import { StockRequestStatus } from '../backend';
import type { StockRequest } from '../backend';

const EXPERIENCES = [
  'Milton General',
  'The Happy Institute',
  'The Dollhouse',
  'Wizard Of Oz',
  "St George's General",
  'Break The Bank',
  'Marvellous Magic School',
  'Riddled',
  'Hell House',
  "The Don's Revenge",
  'Whodunit',
  'Battle Masters',
  'FEC General',
  'Time Raiders',
  'Laser Quest',
  'Retro Arcade',
  '7 Sins',
  'CSI Disco',
  'CSI Mafia',
  'Karaoke Lounge',
  'Karaoke Disco',
  'Like TV Game Show',
  'Splatter Room',
];

const COLUMN_CONFIG = [
  {
    status: StockRequestStatus.requested,
    label: 'Requested',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgLight: 'bg-yellow-50',
    border: 'border-yellow-200',
  },
  {
    status: StockRequestStatus.ordered,
    label: 'Ordered',
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgLight: 'bg-blue-50',
    border: 'border-blue-200',
  },
  {
    status: StockRequestStatus.delivered,
    label: 'Delivered',
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgLight: 'bg-green-50',
    border: 'border-green-200',
  },
];

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

interface StockRequestCardProps {
  request: StockRequest;
  onStatusChange: (id: bigint, status: StockRequestStatus) => void;
  isUpdating: boolean;
  onDragStart: (e: React.DragEvent, id: bigint) => void;
}

function StockRequestCard({ request, onStatusChange, isUpdating, onDragStart }: StockRequestCardProps) {
  const otherStatuses = COLUMN_CONFIG.filter((c) => c.status !== request.status);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, request.id)}
      className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <GripVertical className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0 group-hover:text-gray-400" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm leading-tight truncate">{request.itemName}</p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{request.experience}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" disabled={isUpdating}>
              {isUpdating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white">
            {otherStatuses.map((col) => (
              <DropdownMenuItem
                key={col.status}
                onClick={() => onStatusChange(request.id, col.status)}
              >
                Move to {col.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-2 flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className="text-xs px-1.5 py-0">
          Qty: {request.quantity.toString()}
        </Badge>
        <span className="text-xs text-gray-400">{formatTimestamp(request.createdTimestamp)}</span>
      </div>

      {request.notes && (
        <p className="mt-2 text-xs text-gray-600 bg-gray-50 rounded p-1.5 line-clamp-2">
          {request.notes}
        </p>
      )}

      <p className="mt-1.5 text-xs text-gray-400">By: {request.submitterName}</p>
    </div>
  );
}

interface KanbanColumnProps {
  config: (typeof COLUMN_CONFIG)[0];
  requests: StockRequest[];
  isLoading: boolean;
  onStatusChange: (id: bigint, status: StockRequestStatus) => void;
  isUpdating: boolean;
  onDragStart: (e: React.DragEvent, id: bigint) => void;
  onDrop: (e: React.DragEvent, status: StockRequestStatus) => void;
}

function KanbanColumn({
  config,
  requests,
  isLoading,
  onStatusChange,
  isUpdating,
  onDragStart,
  onDrop,
}: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div
      className={`flex flex-col rounded-xl border-2 transition-colors ${
        isDragOver ? 'border-primary bg-primary/5' : 'border-gray-200 bg-gray-50'
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        setIsDragOver(false);
        onDrop(e, config.status);
      }}
    >
      <div className="flex items-center gap-2 p-3 border-b border-gray-200">
        <div className={`w-2.5 h-2.5 rounded-full ${config.color}`} />
        <h3 className="font-semibold text-gray-800 text-sm">{config.label}</h3>
        <span className="ml-auto bg-white border border-gray-200 text-gray-600 text-xs font-medium rounded-full px-2 py-0.5">
          {isLoading ? '…' : requests.length}
        </span>
      </div>

      <div className="flex flex-col gap-2 p-3 min-h-[200px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : requests.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-gray-400 text-xs text-center">
            No items here
          </div>
        ) : (
          requests.map((req) => (
            <StockRequestCard
              key={req.id.toString()}
              request={req}
              onStatusChange={onStatusChange}
              isUpdating={isUpdating}
              onDragStart={onDragStart}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface StockRequestsPageProps {
  onNavigate?: (page: string) => void;
}

export default function StockRequestsPage({ onNavigate }: StockRequestsPageProps) {
  const { data: userProfile } = useGetCallerUserProfile();

  // Form state
  const [itemName, setItemName] = useState('');
  const [experience, setExperience] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Drag state
  const draggedId = useRef<bigint | null>(null);

  // Queries
  const { data: requested = [], isLoading: loadingRequested } = useGetStockRequestsByStatus(
    StockRequestStatus.requested
  );
  const { data: ordered = [], isLoading: loadingOrdered } = useGetStockRequestsByStatus(
    StockRequestStatus.ordered
  );
  const { data: delivered = [], isLoading: loadingDelivered } = useGetStockRequestsByStatus(
    StockRequestStatus.delivered
  );

  // Mutations
  const createMutation = useCreateStockRequest();
  const updateStatusMutation = useUpdateStockRequestStatus();
  const archiveMutation = useArchiveDeliveredRequests();

  // Auto-archive on mount
  useEffect(() => {
    archiveMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !experience) return;

    await createMutation.mutateAsync({
      itemName: itemName.trim(),
      experience,
      quantity: BigInt(Math.max(1, parseInt(quantity) || 1)),
      notes: notes.trim(),
      submitterName: userProfile?.name ?? 'Unknown',
    });

    setItemName('');
    setExperience('');
    setQuantity('1');
    setNotes('');
    setShowForm(false);
  };

  const handleStatusChange = (id: bigint, newStatus: StockRequestStatus) => {
    updateStatusMutation.mutate({ id, newStatus });
  };

  const handleDragStart = (e: React.DragEvent, id: bigint) => {
    draggedId.current = id;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStatus: StockRequestStatus) => {
    e.preventDefault();
    if (draggedId.current !== null) {
      handleStatusChange(draggedId.current, targetStatus);
      draggedId.current = null;
    }
  };

  const columnData = [
    { config: COLUMN_CONFIG[0], requests: requested, isLoading: loadingRequested },
    { config: COLUMN_CONFIG[1], requests: ordered, isLoading: loadingOrdered },
    { config: COLUMN_CONFIG[2], requests: delivered, isLoading: loadingDelivered },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Package className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Stock Requests</h1>
            <p className="text-sm text-gray-500">Manage escape room and building stock requests</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate?.('stock-requests-archive')}
            className="flex items-center gap-2"
          >
            <Archive className="w-4 h-4" />
            View Archive
          </Button>
          <Button
            size="sm"
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Request
          </Button>
        </div>
      </div>

      {/* Submission Form */}
      {showForm && (
        <Card className="mb-6 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Submit Stock Request</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="itemName">Item Name *</Label>
                <Input
                  id="itemName"
                  placeholder="e.g. Padlock, UV torch, Rope..."
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="experience">Experience / Building *</Label>
                <Select value={experience} onValueChange={setExperience} required>
                  <SelectTrigger id="experience" className="bg-white">
                    <SelectValue placeholder="Select experience or building" />
                  </SelectTrigger>
                  <SelectContent className="bg-white max-h-64">
                    {EXPERIENCES.map((exp) => (
                      <SelectItem key={exp} value={exp}>
                        {exp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes">Comment</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="resize-none"
                />
              </div>

              <div className="md:col-span-2 flex items-center gap-3 pt-1">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || !itemName.trim() || !experience}
                  className="flex items-center gap-2"
                >
                  {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Submit Request
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                {createMutation.isError && (
                  <p className="text-sm text-red-600">Failed to submit. Please try again.</p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columnData.map(({ config, requests, isLoading }) => (
          <KanbanColumn
            key={config.status}
            config={config}
            requests={requests}
            isLoading={isLoading}
            onStatusChange={handleStatusChange}
            isUpdating={updateStatusMutation.isPending}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
          />
        ))}
      </div>

      {/* Info note about auto-archive */}
      <p className="mt-4 text-xs text-gray-400 text-center">
        Items in "Delivered" are automatically moved to the archive after 7 days.
      </p>
    </div>
  );
}
