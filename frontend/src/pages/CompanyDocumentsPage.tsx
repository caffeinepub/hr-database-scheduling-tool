import { useState } from 'react';
import { useGetAllDocuments, useDeleteDocument, useIsCallerAdmin } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Plus, ExternalLink, Pencil, Trash2, BookOpen, FileCheck, File } from 'lucide-react';
import { DocumentCategory } from '../backend';
import type { Document } from '../backend';
import AddDocumentModal from '../components/documents/AddDocumentModal';
import EditDocumentModal from '../components/documents/EditDocumentModal';
import { toast } from 'sonner';

const categoryConfig: Record<DocumentCategory, { label: string; icon: React.ReactNode; color: string }> = {
  [DocumentCategory.handbook]: { label: 'Handbook', icon: <BookOpen className="w-3 h-3" />, color: 'bg-blue-100 text-blue-800 border-blue-200' },
  [DocumentCategory.policy]: { label: 'Policy', icon: <FileCheck className="w-3 h-3" />, color: 'bg-purple-100 text-purple-800 border-purple-200' },
  [DocumentCategory.form]: { label: 'Form', icon: <FileText className="w-3 h-3" />, color: 'bg-green-100 text-green-800 border-green-200' },
  [DocumentCategory.other]: { label: 'Other', icon: <File className="w-3 h-3" />, color: 'bg-gray-100 text-gray-800 border-gray-200' },
};

export default function CompanyDocumentsPage() {
  const { data: documents, isLoading } = useGetAllDocuments();
  const { data: isAdmin } = useIsCallerAdmin();
  const deleteDocument = useDeleteDocument();

  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);

  const filtered = (documents || []).filter(
    (d) => selectedCategory === 'all' || d.category === selectedCategory
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await deleteDocument.mutateAsync(id);
      toast.success('Document deleted');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete document');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Company Documents</h1>
          <p className="text-muted-foreground">Access staff handbooks, policies, and forms</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Document
          </Button>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
        >
          All
        </Button>
        {Object.entries(categoryConfig).map(([cat, config]) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat as DocumentCategory)}
          >
            {config.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No documents found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => {
            const catConfig = categoryConfig[doc.category];
            return (
              <Card key={doc.id} className="flex flex-col hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border mb-2 ${catConfig.color}`}>
                        {catConfig.icon}
                        {catConfig.label}
                      </span>
                      <CardTitle className="text-base leading-tight">{doc.title}</CardTitle>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-1 shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-7 h-7"
                          onClick={() => setEditingDocument(doc)}
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-7 h-7 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(doc.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-3">
                  {doc.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{doc.description}</p>
                  )}
                  {doc.content && (
                    <p className="text-sm text-foreground/80 bg-muted/40 rounded p-2 line-clamp-3">{doc.content}</p>
                  )}
                  {doc.fileUrl && (
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto"
                    >
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        <ExternalLink className="w-3 h-3" />
                        Open Document
                      </Button>
                    </a>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {showAddModal && <AddDocumentModal onClose={() => setShowAddModal(false)} />}
      {editingDocument && (
        <EditDocumentModal document={editingDocument} onClose={() => setEditingDocument(null)} />
      )}
    </div>
  );
}
