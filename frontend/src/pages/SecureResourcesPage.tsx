import { useState } from 'react';
import { useGetResources, useDeleteResource, useIsCallerAdmin } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Lock, Plus, Pencil, Trash2, Key, DollarSign, FileText, MoreHorizontal, AlertTriangle } from 'lucide-react';
import { ResourceCategory } from '../backend';
import type { Resource } from '../backend';
import AddResourceModal from '../components/resources/AddResourceModal';
import EditResourceModal from '../components/resources/EditResourceModal';
import { toast } from 'sonner';

const categoryConfig: Record<ResourceCategory, { label: string; icon: React.ReactNode; color: string }> = {
  [ResourceCategory.logins]: { label: 'Logins', icon: <Key className="w-3 h-3" />, color: 'bg-blue-500/20 text-blue-400' },
  [ResourceCategory.prices]: { label: 'Prices', icon: <DollarSign className="w-3 h-3" />, color: 'bg-green-500/20 text-green-400' },
  [ResourceCategory.forms]: { label: 'Forms', icon: <FileText className="w-3 h-3" />, color: 'bg-purple-500/20 text-purple-400' },
  [ResourceCategory.other]: { label: 'Other', icon: <MoreHorizontal className="w-3 h-3" />, color: 'bg-secondary text-muted-foreground' },
};

export default function SecureResourcesPage() {
  // Pass undefined instead of null — the hook signature accepts ResourceCategory | undefined
  const { data: resources, isLoading } = useGetResources(undefined);
  const { data: isAdmin } = useIsCallerAdmin();
  const deleteResource = useDeleteResource();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  const grouped = Object.values(ResourceCategory).reduce((acc, cat) => {
    acc[cat] = (resources || []).filter((r) => r.category === cat);
    return acc;
  }, {} as Record<ResourceCategory, Resource[]>);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    try {
      await deleteResource.mutateAsync(id);
      toast.success('Resource deleted');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete resource');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Secure Resources</h1>
          <p className="text-muted-foreground">Internal resources for staff use only</p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Resource
          </Button>
        )}
      </div>

      {/* Confidentiality Notice */}
      <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
        <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-yellow-400 text-sm">Confidential Information</p>
          <p className="text-yellow-400/80 text-sm mt-0.5">
            The information on this page is strictly confidential and for authorised staff only.
            Do not share, screenshot, or distribute any content from this page.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(categoryConfig).map(([cat, config]) => {
            const items = grouped[cat as ResourceCategory] || [];
            if (items.length === 0 && !isAdmin) return null;
            return (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${config.color}`}>
                    {config.icon}
                    {config.label}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground pl-2">
                    No {config.label.toLowerCase()} resources yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {items.map((resource) => (
                      <Card key={resource.id} className="bg-card border-border hover:border-primary transition-colors">
                        <CardHeader className="pb-2 pt-4 px-4">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-sm font-semibold text-foreground">
                              {resource.title}
                            </CardTitle>
                            {isAdmin && (
                              <div className="flex gap-1 shrink-0">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="w-6 h-6 text-muted-foreground hover:text-foreground"
                                  onClick={() => setEditingResource(resource)}
                                >
                                  <Pencil className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="w-6 h-6 text-muted-foreground hover:text-destructive"
                                  onClick={() => handleDelete(resource.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                          <p className="text-sm font-mono bg-secondary rounded p-2 break-all select-all text-foreground">
                            {resource.content}
                          </p>
                          {resource.isRestricted && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-yellow-400">
                              <Lock className="w-3 h-3" />
                              <span>Restricted</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showAddModal && <AddResourceModal onClose={() => setShowAddModal(false)} />}
      {editingResource && (
        <EditResourceModal
          resource={editingResource}
          onClose={() => setEditingResource(null)}
        />
      )}
    </div>
  );
}
