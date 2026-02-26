import React, { useState } from 'react';
import { useGetResources, useAddResource, useUpdateResource, useDeleteResource, useIsCallerAdmin } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lock, Plus, Trash2, Edit, Key, DollarSign, FileText, MoreHorizontal, AlertTriangle } from 'lucide-react';
import { generateId, dateToNanoseconds } from '../lib/utils';
import { ResourceCategory } from '../backend';
import type { Resource } from '../backend';
import { toast } from 'sonner';

const CATEGORY_LABELS: Record<ResourceCategory, string> = {
  [ResourceCategory.logins]: 'Logins',
  [ResourceCategory.prices]: 'Prices',
  [ResourceCategory.forms]: 'Forms',
  [ResourceCategory.other]: 'Other',
};

const CATEGORY_COLORS: Record<ResourceCategory, string> = {
  [ResourceCategory.logins]: 'bg-blue-500/20 text-blue-400',
  [ResourceCategory.prices]: 'bg-green-500/20 text-green-400',
  [ResourceCategory.forms]: 'bg-purple-500/20 text-purple-400',
  [ResourceCategory.other]: 'bg-secondary text-muted-foreground',
};

export default function ResourcesPage() {
  const { data: resources, isLoading } = useGetResources();
  const { data: isAdmin } = useIsCallerAdmin();
  const addResource = useAddResource();
  const updateResource = useUpdateResource();
  const deleteResource = useDeleteResource();

  const [showModal, setShowModal] = useState(false);
  const [editRes, setEditRes] = useState<Resource | null>(null);
  const [form, setForm] = useState({ title: '', category: ResourceCategory.other, content: '', isRestricted: false });

  const resetForm = () => setForm({ title: '', category: ResourceCategory.other, content: '', isRestricted: false });

  const openEdit = (res: Resource) => {
    setEditRes(res);
    setForm({ title: res.title, category: res.category, content: res.content, isRestricted: res.isRestricted });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editRes) {
        await updateResource.mutateAsync({ ...editRes, title: form.title, category: form.category, content: form.content, isRestricted: form.isRestricted });
        toast.success('Resource updated');
        setEditRes(null);
      } else {
        await addResource.mutateAsync({
          id: generateId(),
          title: form.title,
          category: form.category,
          content: form.content,
          isRestricted: form.isRestricted,
          createdAt: dateToNanoseconds(new Date()),
        });
        toast.success('Resource added');
        setShowModal(false);
      }
      resetForm();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save resource');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this resource?')) return;
    try {
      await deleteResource.mutateAsync(id);
      toast.success('Resource deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete resource');
    }
  };

  const ResModal = ({ onClose }: { onClose: () => void }) => (
    <Dialog open={true} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">{editRes ? 'Edit Resource' : 'Add Resource'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <Label className="text-foreground text-sm">Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-input border-border text-foreground mt-1" required />
          </div>
          <div>
            <Label className="text-foreground text-sm">Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as ResourceCategory })}>
              <SelectTrigger className="bg-input border-border text-foreground mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {Object.values(ResourceCategory).map((cat) => (
                  <SelectItem key={cat} value={cat}>{CATEGORY_LABELS[cat]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-foreground text-sm">Content</Label>
            <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="bg-input border-border text-foreground mt-1" rows={4} placeholder="Resource content, credentials, or information..." required />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="restricted" checked={form.isRestricted} onChange={(e) => setForm({ ...form, isRestricted: e.target.checked })} className="accent-primary" />
            <Label htmlFor="restricted" className="text-foreground text-sm cursor-pointer">Restricted (admin/manager only)</Label>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-border text-foreground">Cancel</Button>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={addResource.isPending || updateResource.isPending}>
              {(addResource.isPending || updateResource.isPending) ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Secure Resources</h2>
          <p className="text-muted-foreground">Internal resources for authorised staff only</p>
        </div>
        {isAdmin && (
          <Button onClick={() => { resetForm(); setShowModal(true); }} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus size={16} className="mr-2" />
            Add Resource
          </Button>
        )}
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-yellow-400 text-sm">Confidential Information</p>
          <p className="text-yellow-400/80 text-sm mt-0.5">
            This information is strictly confidential and for authorised staff only. Do not share or distribute any content from this page.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(resources || []).map((res) => (
            <div key={res.id} className="bg-card border border-border rounded-xl p-5 hover:border-primary transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Lock size={16} className="text-primary flex-shrink-0" />
                  <h3 className="font-semibold text-foreground">{res.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  {res.isRestricted && <Badge className="text-xs bg-destructive/20 text-destructive">Restricted</Badge>}
                  <Badge className={`text-xs ${CATEGORY_COLORS[res.category]}`}>{CATEGORY_LABELS[res.category]}</Badge>
                </div>
              </div>
              <p className="text-sm font-mono bg-secondary rounded-lg p-2 break-all select-all text-foreground mb-3">
                {res.content}
              </p>
              {isAdmin && (
                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(res)} className="text-muted-foreground hover:text-foreground">
                    <Edit size={14} className="mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(res.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 size={14} className="mr-1" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          ))}
          {(resources || []).length === 0 && (
            <div className="col-span-2 text-center py-12 text-muted-foreground">
              <Lock size={40} className="mx-auto mb-3 opacity-30" />
              <p>No resources yet</p>
            </div>
          )}
        </div>
      )}

      {showModal && <ResModal onClose={() => setShowModal(false)} />}
      {editRes && <ResModal onClose={() => setEditRes(null)} />}
    </div>
  );
}
