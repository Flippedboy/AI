import { useState } from 'react';
import { FileText, Trash2, FileSpreadsheet, File, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { KnowledgeDocument } from '@shared/api.interface';

interface DocumentCardProps {
  doc: KnowledgeDocument;
  formatFileSize: (bytes: number) => string;
  formatDate: (dateStr: string) => string;
  onDelete: () => void;
}

const typeIcons: Record<string, React.ReactNode> = {
  pdf: <FileText className="size-6 text-red-400" />,
  docx: <FileText className="size-6 text-blue-400" />,
  xlsx: <FileSpreadsheet className="size-6 text-green-400" />,
  txt: <File className="size-6 text-gray-400" />,
};

const statusConfig: Record<string, { label: string; className: string }> = {
  success: { label: '已索引', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  indexing: { label: '处理中', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  failed: { label: '失败', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

const DocumentCard = ({ doc, formatFileSize, formatDate, onDelete }: DocumentCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const status = statusConfig[doc.status] || statusConfig.indexing;

  return (
    <div
      className="glass rounded-xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 hover:border-white/20 group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="size-12 rounded-lg bg-card flex items-center justify-center border border-white/5">
          {typeIcons[doc.type] || <BookOpen className="size-6 text-muted-foreground" />}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className={`size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <h3 className="font-medium text-foreground text-sm mb-2 truncate" title={doc.name}>
        {doc.name}
      </h3>

      <div className="flex items-center gap-2 mb-3">
        <Badge variant="outline" className={`text-xs ${status.className}`}>
          {status.label}
        </Badge>
        <span className="text-xs text-muted-foreground uppercase">{doc.type}</span>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatFileSize(doc.size)}</span>
        <span>{formatDate(doc.createdAt)}</span>
      </div>

      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          引用 <span className="text-foreground">{doc.quoteCount}</span> 次
        </span>
      </div>
    </div>
  );
};

export default DocumentCard;
