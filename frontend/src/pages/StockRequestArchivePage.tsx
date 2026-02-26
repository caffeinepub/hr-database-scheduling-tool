import React from 'react';
import { ArrowLeft, Archive, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetArchivedStockRequests } from '../hooks/useQueries';

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

interface StockRequestArchivePageProps {
  onNavigate?: (page: string) => void;
}

export default function StockRequestArchivePage({ onNavigate }: StockRequestArchivePageProps) {
  const { data: archived = [], isLoading, isError } = useGetArchivedStockRequests();

  // Sort by delivered timestamp descending (most recent first)
  const sorted = [...archived].sort((a, b) => {
    const aTime = a.deliveredTimestamp ? Number(a.deliveredTimestamp) : Number(a.createdTimestamp);
    const bTime = b.deliveredTimestamp ? Number(b.deliveredTimestamp) : Number(b.createdTimestamp);
    return bTime - aTime;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate?.('stock-requests')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Stock Requests
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gray-100 rounded-lg">
          <Archive className="w-6 h-6 text-gray-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Request Archive</h1>
          <p className="text-sm text-gray-500">
            Historical deliveries — items are archived 7 days after delivery
          </p>
        </div>
        <Badge variant="outline" className="ml-auto text-sm px-3 py-1">
          {isLoading ? '…' : `${sorted.length} records`}
        </Badge>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-16 text-red-600">
          <p>Failed to load archived requests. Please try again.</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No archived requests yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Delivered items will appear here after 7 days
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-700">Item</TableHead>
                <TableHead className="font-semibold text-gray-700">Experience / Building</TableHead>
                <TableHead className="font-semibold text-gray-700 text-center">Qty</TableHead>
                <TableHead className="font-semibold text-gray-700">Comment</TableHead>
                <TableHead className="font-semibold text-gray-700">Submitted By</TableHead>
                <TableHead className="font-semibold text-gray-700">Date Submitted</TableHead>
                <TableHead className="font-semibold text-gray-700">Date Delivered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((req) => (
                <TableRow key={req.id.toString()} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-gray-900">{req.itemName}</TableCell>
                  <TableCell className="text-gray-600">{req.experience}</TableCell>
                  <TableCell className="text-center text-gray-600">
                    {req.quantity.toString()}
                  </TableCell>
                  <TableCell className="text-gray-500 max-w-xs">
                    <span className="line-clamp-2 text-sm">{req.notes || '—'}</span>
                  </TableCell>
                  <TableCell className="text-gray-600">{req.submitterName}</TableCell>
                  <TableCell className="text-gray-500 text-sm whitespace-nowrap">
                    {formatTimestamp(req.createdTimestamp)}
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm whitespace-nowrap">
                    {req.deliveredTimestamp ? formatTimestamp(req.deliveredTimestamp) : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
