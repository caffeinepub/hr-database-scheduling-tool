import { useState } from 'react';
import { useAddDocument } from '../../hooks/useQueries';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { generateId, dateToNanoseconds } from '../../lib/utils';
import { DocumentCategory } from '../../backend';
import { toast } from 'sonner';

interface Props {
  onClose: () => void;
}

export default function AddDocumentModal({ onClose }: Props) {
  const addDocument = useAddDocument();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<DocumentCategory>(DocumentCategory.other);
  const [fileUrl, setFileUrl] = useState('');
  const [content, setContent] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDocument.mutateAsync({
        id: generateId(),
        title,
        description,
        category,
        fileUrl: fileUrl.trim() || undefined,
        content: content.trim() || undefined,
        isVisible,
        uploadedAt: dateToNanoseconds(new Date()),
      });
      toast.success('Document added successfully!');
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to add document');
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Document</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as DocumentCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={DocumentCategory.handbook}>Handbook</SelectItem>
                <SelectItem value={DocumentCategory.policy}>Policy</SelectItem>
                <SelectItem value={DocumentCategory.form}>Form</SelectItem>
                <SelectItem value={DocumentCategory.other}>Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>File URL (optional)</Label>
            <Input
              type="url"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label>Content (optional)</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              placeholder="Inline text content..."
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={isVisible} onCheckedChange={setIsVisible} id="isVisible" />
            <Label htmlFor="isVisible">Visible to employees</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={addDocument.isPending}>
              {addDocument.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Add Document
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
