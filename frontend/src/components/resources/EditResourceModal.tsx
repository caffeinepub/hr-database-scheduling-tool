import { useState } from 'react';
import { useUpdateResource } from '../../hooks/useQueries';
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
import { ResourceCategory } from '../../backend';
import type { Resource } from '../../backend';
import { toast } from 'sonner';

interface Props {
  resource: Resource;
  onClose: () => void;
}

export default function EditResourceModal({ resource, onClose }: Props) {
  const updateResource = useUpdateResource();

  const [title, setTitle] = useState(resource.title);
  const [category, setCategory] = useState<ResourceCategory>(resource.category);
  const [content, setContent] = useState(resource.content);
  const [isRestricted, setIsRestricted] = useState(resource.isRestricted);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required.');
      return;
    }
    try {
      await updateResource.mutateAsync({
        ...resource,
        title: title.trim(),
        category,
        content: content.trim(),
        isRestricted,
      });
      toast.success('Resource updated successfully!');
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update resource');
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Resource</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ResourceCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ResourceCategory.logins}>Logins</SelectItem>
                <SelectItem value={ResourceCategory.prices}>Prices</SelectItem>
                <SelectItem value={ResourceCategory.forms}>Forms</SelectItem>
                <SelectItem value={ResourceCategory.other}>Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Content / URL</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={isRestricted} onCheckedChange={setIsRestricted} id="isRestricted" />
            <Label htmlFor="isRestricted">Restricted (manager/admin only)</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={updateResource.isPending}>
              {updateResource.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
