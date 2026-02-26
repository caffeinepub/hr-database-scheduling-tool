import React, { useState } from 'react';
import { useGetAllDocuments, useAddDocument, useUpdateDocument, useDeleteDocument, useIsCallerAdmin } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Plus, Trash2, Edit, BookOpen, FileCheck, File, ExternalLink } from 'lucide-react';
import { generateId, dateToNanoseconds } from '../lib/utils';
import { DocumentCategory } from '../backend';
import type { Document } from '../backend';
import { toast } from 'sonner';

const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  [DocumentCategory.handbook]: 'Handbook',
  [DocumentCategory.policy]: 'Policy',
  [DocumentCategory.form]: 'Form',
  [DocumentCategory.other]: 'Other',
};

const CATEGORY_COLORS: Record<DocumentCategory, string> = {
  [DocumentCategory.handbook]: 'bg-blue-500/20 text-blue-400',
  [DocumentCategory.policy]: 'bg-purple-500/20 text-purple-400',
  [DocumentCategory.form]: 'bg-green-500/20 text-green-400',
  [DocumentCategory.other]: 'bg-secondary text-muted-foreground',
};

export default function DocumentsPage() {
  const { data: documents, isLoading } = useGetAllDocuments();
  const { data: isAdmin } = useIsCallerAdmin();
  const addDocument = useAddDocument();
  const updateDocument = useUpdateDocument();
  const deleteDocument = useDeleteDocument();

  const [showModal, setShowModal] = useState(false);
  const [editDoc, setEditDoc] = useState<Document | null>(null);
  const [form, setForm] = useState({ title: '', description: '', category: DocumentCategory.other, content: '', fileUrl: '', isVisible: true });

  const resetForm = () => setForm({ title: '', description: '', category: DocumentCategory.other, content: '', fileUrl: '', isVisible: true });

  const openEdit = (doc: Document) => {
    setEditDoc(doc);
    setForm({
      title: doc.title,
      description: doc.description,
      category: doc.category,
      content: doc.content || '',
      fileUrl: doc.fileUrl || '',
      isVisible: doc.isVisible,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editDoc) {
        await updateDocument.mutateAsync({
          ...editDoc,
          title: form.title,
          description: form.description,
          category: form.category,
          content: form.content || undefined,
          fileUrl: form.fileUrl || undefined,
          isVisible: form.isVisible,
        });
        toast.success('Document updated');
        setEditDoc(null);
      } else {
        await addDocument.mutateAsync({
          id: generateId(),
          title: form.title,
          description: form.description,
          category: form.category,
          content: form.content || undefined,
          fileUrl: form.fileUrl || undefined,
          isVisible: form.isVisible,
          uploadedAt: dateToNanoseconds(new Date()),
        });
        toast.success('Document added');
        setShowModal(false);
      }
      resetForm();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save document');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document?')) return;
    try {
      await deleteDocument.mutateAsync(id);
      toast.success('Document deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete document');
    }
  };

  const DocModal = ({ onClose }: { onClose: () => void }) => (
    <Dialog open={true} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">{editDoc ? 'Edit Document' : 'Add Document'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <Label className="text-foreground text-sm">Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-input border-border text-foreground mt-1" required />
          </div>
          <div>
            <Label className="text-foreground text-sm">Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-input border-border text-foreground mt-1" rows={2} />
          </div>
          <div>
            <Label className="text-foreground text-sm">Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as DocumentCategory })}>
              <SelectTrigger className="bg-input border-border text-foreground mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {Object.values(DocumentCategory).map((cat) => (
                  <SelectItem key={cat} value={cat}>{CATEGORY_LABELS[cat]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-foreground text-sm">Content / URL</Label>
            <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="bg-input border-border text-foreground mt-1" rows={3} placeholder="Document content or URL..." />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="visible" checked={form.isVisible} onChange={(e) => setForm({ ...form, isVisible: e.target.checked })} className="accent-primary" />
            <Label htmlFor="visible" className="text-foreground text-sm cursor-pointer">Visible to all staff</Label>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-border text-foreground">Cancel</Button>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={addDocument.isPending || updateDocument.isPending}>
              {(addDocument.isPending || updateDocument.isPending) ? 'Saving...' : 'Save'}
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
          <h2 className="text-2xl font-bold text-foreground">Company Documents</h2>
          <p className="text-muted-foreground">Staff handbooks, policies, and forms</p>
        </div>
        {isAdmin && (
          <Button onClick={() => { resetForm(); setShowModal(true); }} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus size={16} className="mr-2" />
            Add Document
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(documents || []).map((doc) => (
            <div key={doc.id} className="bg-card border border-border rounded-xl p-5 hover:border-primary transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-primary flex-shrink-0" />
                  <h3 className="font-semibold text-foreground">{doc.title}</h3>
                </div>
                <Badge className={`text-xs ${CATEGORY_COLORS[doc.category]}`}>{CATEGORY_LABELS[doc.category]}</Badge>
              </div>
              {doc.description && <p className="text-sm text-muted-foreground mb-3">{doc.description}</p>}
              {doc.content && (
                <p className="text-xs text-muted-foreground bg-secondary rounded-lg p-2 mb-3 line-clamp-2">{doc.content}</p>
              )}
              {doc.fileUrl && (
                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mb-3">
                  <ExternalLink size={12} />
                  Open Document
                </a>
              )}
              {isAdmin && (
                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(doc)} className="text-muted-foreground hover:text-foreground">
                    <Edit size={14} className="mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(doc.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 size={14} className="mr-1" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          ))}
          {(documents || []).length === 0 && (
            <div className="col-span-2 text-center py-12 text-muted-foreground">
              <FileText size={40} className="mx-auto mb-3 opacity-30" />
              <p>No documents yet</p>
            </div>
          )}
        </div>
      )}

      {showModal && <DocModal onClose={() => setShowModal(false)} />}
      {editDoc && <DocModal onClose={() => setEditDoc(null)} />}
    </div>
  );
}
