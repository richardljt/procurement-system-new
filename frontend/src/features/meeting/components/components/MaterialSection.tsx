import React, { useEffect, useState } from 'react';
import { Card, List, Button, Upload, message, Modal } from 'antd';
import { FileText, Download, Trash2, Eye } from 'lucide-react';
import { getMaterials, uploadMaterial, deleteMaterial, MeetingMaterial } from '../../../../api/review';

interface Props {
  meetingId: number;
  isReadOnly?: boolean;
  currentUser: { id: string; name: string };
}

const MaterialSection: React.FC<Props> = ({ meetingId, isReadOnly, currentUser }) => {
  const [materials, setMaterials] = useState<MeetingMaterial[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewFile, setPreviewFile] = useState<MeetingMaterial | null>(null);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await getMaterials(meetingId);
      if (res) setMaterials(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [meetingId]);

  const handleUpload = async (file: any) => {
    const material: MeetingMaterial = {
      meetingId,
      fileName: file.name,
      filePath: '/mock/path/' + file.name,
      fileSize: file.size,
      uploaderId: currentUser.id,
      uploaderName: currentUser.name
    };

    try {
      await uploadMaterial(material);
      message.success('上传成功');
      fetchMaterials();
    } catch (e) {
      message.error('上传失败');
    }
    return false; // Prevent default upload behavior
  };

  const handleDelete = async (materialId: number) => {
      Modal.confirm({
          title: '删除材料',
          content: '确定要删除该文件吗？',
          onOk: async () => {
              try {
                  await deleteMaterial(materialId);
                  message.success('删除成功');
                  fetchMaterials();
              } catch (e) {
                  message.error('删除失败');
              }
          }
      });
  };

  const handlePreview = (item: MeetingMaterial) => {
      setPreviewFile(item);
      setPreviewVisible(true);
  };

  const renderPreviewContent = () => {
      if (!previewFile) return null;

      const fileExt = previewFile.fileName.split('.').pop()?.toLowerCase();

      if (fileExt === 'pdf') {
          return (
              <div className="h-[600px] w-full bg-gray-100 flex items-center justify-center">
                   <iframe 
                      src={previewFile.filePath} // In real app, this should be a valid URL
                      className="w-full h-full"
                      title="PDF Preview"
                   />
              </div>
          );
      } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExt || '')) {
           return (
              <div className="flex items-center justify-center p-4">
                  <img src={previewFile.filePath} alt="Preview" className="max-w-full max-h-[600px]" />
              </div>
           );
      } else {
          // Fallback for Word, Excel, Text, etc. (Simulated)
          return (
              <div className="h-96 flex items-center justify-center bg-gray-50 border rounded">
                  <div className="text-center">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2">此处为文件预览区域 ({fileExt})</p>
                      <p className="text-xs text-gray-400">当前演示环境仅支持模拟预览，实际需集成 Office Online 或 PDF.js</p>
                      <Button type="primary" className="mt-4" icon={<Download className="w-4 h-4" />}>下载原文件</Button>
                  </div>
              </div>
          );
      }
  };

  const handleDownload = (item: MeetingMaterial) => {
    // Mock download
    // message.success(`开始下载: ${item.fileName}`);
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = item.filePath; // In real scenario, this would be a real URL
    link.download = item.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card title="会议材料" extra={!isReadOnly && (
      <Upload beforeUpload={handleUpload} showUploadList={false}>
        <Button>上传材料</Button>
      </Upload>
    )}>
      <List
        loading={loading}
        grid={{ gutter: 16, column: 1 }}
        dataSource={materials}
        renderItem={item => (
          <List.Item>
             <div className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow bg-white">
                <div className="flex items-start mb-3">
                   <div className="bg-blue-50 p-2 rounded mr-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate mb-1" title={item.fileName}>
                          {item.fileName}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                          {item.uploaderName} • {item.uploadTime ? new Date(item.uploadTime).toLocaleDateString() : ''}
                      </div>
                   </div>
                </div>
                
                <div className="flex items-center space-x-2">
                   <Button 
                      type="primary" 
                      size="small" 
                      className="flex-1 text-xs" 
                      icon={<Eye className="w-3 h-3" />} 
                      onClick={() => handlePreview(item)}
                   >
                      预览
                   </Button>
                   <Button 
                      size="small" 
                      className="flex-1 text-xs bg-gray-100 text-gray-600 border-none hover:bg-gray-200" 
                      icon={<Download className="w-3 h-3" />} 
                      onClick={() => handleDownload(item)}
                   >
                      下载
                   </Button>
                   {!isReadOnly && (
                       <Button 
                          type="text" 
                          size="small" 
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50" 
                          icon={<Trash2 className="w-4 h-4" />} 
                          onClick={() => handleDelete(item.materialId!)} 
                       />
                   )}
                </div>
             </div>
          </List.Item>
        )}
      />

      <Modal 
          title={previewFile?.fileName} 
          open={previewVisible} 
          onCancel={() => setPreviewVisible(false)} 
          footer={null}
          width={800}
          bodyStyle={{ padding: 0 }}
      >
          {renderPreviewContent()}
      </Modal>
    </Card>
  );
};

export default MaterialSection;
