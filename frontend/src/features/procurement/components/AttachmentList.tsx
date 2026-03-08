
import React from 'react';
import { File, Eye, Download } from 'lucide-react';
import { FileRecord } from '../../../api/common';

interface AttachmentListProps {
  files: FileRecord[];
  title?: string;
  onPreview: (file: FileRecord) => void;
  onDownload: (file: FileRecord) => void;
}

const AttachmentList: React.FC<AttachmentListProps> = ({ files, title = '附件列表', onPreview, onDownload }) => {
  if (!files || files.length === 0) {
    return (
      <div className="mt-4 border-t border-gray-200 pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">{title}</label>
        <div className="col-span-2 text-center py-4 text-gray-500 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-300">
          暂无附件
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{title}</label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {files.map(file => (
          <div key={file.fileId} className="flex items-center p-3 border border-gray-200 rounded-lg bg-gray-50">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <File className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{file.originalFileName}</p>
              <p className="text-xs text-gray-500">{(file.fileSize / 1024).toFixed(1)} KB</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPreview(file)}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="预览"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDownload(file)}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="下载"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttachmentList;
