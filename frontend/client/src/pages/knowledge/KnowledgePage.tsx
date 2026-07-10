import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Upload, Trash2, FileText, Database, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { knowledge } from '@/api';
import { parseDocument } from '@/utils/capability';
import type { KnowledgeDocument, KnowledgeStatus } from '@shared/api.interface';
import DocumentCard from './DocumentCard';

const KnowledgePage = () => {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<KnowledgeStatus | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingDoc, setDeletingDoc] = useState<KnowledgeDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocuments = useCallback(async (searchKeyword?: string) => {
    try {
      const result = await knowledge.getKnowledgeDocuments({
        keyword: searchKeyword,
        pageSize: 50,
      });
      setDocuments(result.items);
      setTotal(result.total);
    } catch (error) {
      logger.error('加载文档列表失败', error);
      toast.error('加载文档列表失败');
    }
  }, []);

  const loadStatus = useCallback(async () => {
    try {
      const result = await knowledge.getKnowledgeStatus();
      setStatus(result);
    } catch (error) {
      logger.error('加载向量库状态失败', error);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
    loadStatus();
  }, [loadDocuments, loadStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDocuments(keyword);
    }, 300);
    return () => clearTimeout(timer);
  }, [keyword, loadDocuments]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const typeMap: Record<string, 'pdf' | 'docx' | 'xlsx' | 'txt'> = {
      'application/pdf': 'pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'text/plain': 'txt',
    };

    const docType = typeMap[file.type] || 'txt';
    const fileSize = file.size;

    setIsUploading(true);
    try {
      const result = await knowledge.createKnowledgeDocument({
        name: file.name,
        type: docType,
        size: fileSize,
        url: URL.createObjectURL(file),
      });

      toast.success('文档上传成功，正在解析...');
      loadDocuments();
      loadStatus();

      try {
        await parseDocument([URL.createObjectURL(file)]);
        toast.success('文档解析完成');
      } catch (parseError) {
        logger.error('文档解析失败', parseError);
        toast.error('文档解析失败，请重试');
      }

      loadDocuments();
      loadStatus();
    } catch (error) {
      logger.error('上传文档失败', error);
      toast.error('上传文档失败');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteClick = (doc: KnowledgeDocument) => {
    setDeletingDoc(doc);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingDoc) return;

    setIsDeleting(true);
    try {
      await knowledge.deleteKnowledgeDocument(deletingDoc.id);
      toast.success('删除成功');
      setDeleteDialogOpen(false);
      setDeletingDoc(null);
      loadDocuments();
      loadStatus();
    } catch (error) {
      logger.error('删除文档失败', error);
      toast.error('删除失败');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatLastUpdate = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}小时前`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}天前`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索文档名称..."
            className="pl-10 bg-card/50 border-white/10 focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <Button
          onClick={handleUploadClick}
          disabled={isUploading}
          className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5"
        >
          <Upload className="size-4 mr-2" />
          {isUploading ? '上传中...' : '上传文档'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx,.xlsx,.txt"
          onChange={handleFileChange}
        />
      </div>

      {documents.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="size-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
              <FileText className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">暂无文档</h3>
            <p className="text-sm text-muted-foreground">
              {keyword ? '没有找到匹配的文档' : '点击上方按钮上传第一个文档'}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                formatFileSize={formatFileSize}
                formatDate={formatDate}
                onDelete={() => handleDeleteClick(doc)}
              />
            ))}
          </div>
        </div>
      )}

      {status && (
        <div className="mt-6 glass rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Database className="size-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                向量库：<span className="text-foreground font-medium">{status.totalDocs}</span> 篇文档
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="size-4 text-success" />
              <span className="text-sm text-muted-foreground">
                索引成功率：<span className="text-foreground font-medium">{status.indexSuccessRate}%</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                更新于：<span className="text-foreground">{formatLastUpdate(status.lastUpdatedAt)}</span>
              </span>
            </div>
          </div>
          <Badge variant="outline" className="border-primary/30 text-primary">
            共 {total} 个文件
          </Badge>
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-card border-white/10 text-foreground">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              确定要删除文档「{deletingDoc ? deletingDoc.name : ''}」吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="border-white/10"
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? '删除中...' : '确认删除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KnowledgePage;
