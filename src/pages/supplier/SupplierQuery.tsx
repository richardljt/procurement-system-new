import React, { useState, useEffect } from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Search, Filter, Phone, MapPin, Star, CreditCard, ChevronRight, Edit, History, X, Upload, FileText, Trash2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSuppliers, Supplier, updateSupplier, getSupplierHistory, SupplierHistory } from '../../api/procurement';

interface Attachment {
  name: string;
  url: string;
}

interface AttachmentGroup {
  type: 'CR' | 'BRO' | 'VIOLATION_HK' | 'BUSINESS_LICENSE' | 'VIOLATION_MAINLAND';
  files: Attachment[];
}

const getAttachmentLabel = (type: string) => {
  switch (type) {
    case 'CR': return 'CR文件';
    case 'BRO': return 'BRO文件';
    case 'VIOLATION_HK': return '违法违规证明 (香港)';
    case 'BUSINESS_LICENSE': return '工商登记信息';
    case 'VIOLATION_MAINLAND': return '违法违规证明 (内地)';
    default: return type;
  }
};

const SupplierQuery: React.FC = () => {
  useDocumentTitle('供应商查询 - 供应商管理');
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [changeReason, setChangeReason] = useState('');
  const [editForm, setEditForm] = useState<Partial<Supplier>>({});
  const [attachments, setAttachments] = useState<AttachmentGroup[]>([]);
  const [attachmentErrors, setAttachmentErrors] = useState<Record<string, string>>({});

  // History Modal State
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyList, setHistoryList] = useState<SupplierHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Update attachments structure when region changes in edit form
  useEffect(() => {
    if (!isEditModalOpen) return;
    
    setAttachments(prev => {
      const newAttachments = [...prev];
      const region = editForm.region || 'HK';
      
      if (region === 'HK') {
        const hkTypes: AttachmentGroup['type'][] = ['CR', 'BRO', 'VIOLATION_HK'];
        hkTypes.forEach(type => {
          if (!newAttachments.find(a => a.type === type)) {
            newAttachments.push({ type, files: [] });
          }
        });
      } else {
        const mainlandTypes: AttachmentGroup['type'][] = ['BUSINESS_LICENSE', 'VIOLATION_MAINLAND'];
        mainlandTypes.forEach(type => {
          if (!newAttachments.find(a => a.type === type)) {
            newAttachments.push({ type, files: [] });
          }
        });
      }
      return newAttachments;
    });
  }, [editForm.region, isEditModalOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getSuppliers();
      setSuppliers(data || []);
    } catch (error) {
      console.error("Failed to load suppliers", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (e: React.MouseEvent, supplier: Supplier) => {
    e.stopPropagation();
    setEditingSupplier(supplier);
    setEditForm({ ...supplier });
    
    // Parse attachments
    try {
      const parsedAttachments = supplier.attachments ? JSON.parse(supplier.attachments) : [];
      setAttachments(parsedAttachments);
    } catch (e) {
      console.error("Failed to parse attachments", e);
      setAttachments([]);
    }
    
    setChangeReason('');
    setAttachmentErrors({});
    setIsEditModalOpen(true);
  };

  const handleFileUpload = (type: AttachmentGroup['type'], e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(file => ({
        name: file.name,
        url: URL.createObjectURL(file)
      }));

      setAttachments(prev => prev.map(group => 
        group.type === type 
          ? { ...group, files: [...group.files, ...newFiles] }
          : group
      ));
      
      // Clear error
      if (attachmentErrors[`attachment_${type}`]) {
        setAttachmentErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[`attachment_${type}`];
          return newErrors;
        });
      }
    }
  };

  const removeFile = (type: AttachmentGroup['type'], index: number) => {
    setAttachments(prev => prev.map(group => 
      group.type === type 
        ? { ...group, files: group.files.filter((_, i) => i !== index) }
        : group
    ));
  };

  const handleHistoryClick = async (e: React.MouseEvent, supplier: Supplier) => {
    e.stopPropagation();
    setIsHistoryModalOpen(true);
    setHistoryLoading(true);
    try {
      if (supplier.supplierId) {
        const history = await getSupplierHistory(supplier.supplierId);
        setHistoryList(history || []);
      }
    } catch (error) {
      console.error("Failed to load history", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleUpdateSubmit = async () => {
    if (!editingSupplier || !changeReason.trim()) {
      alert("请输入变更原因");
      return;
    }
    
    try {
      // Filter attachments based on region
      const finalAttachments = attachments.filter(group => {
         if (editForm.region === 'HK') {
           return ['CR', 'BRO', 'VIOLATION_HK'].includes(group.type);
         } else {
           return ['BUSINESS_LICENSE', 'VIOLATION_MAINLAND'].includes(group.type);
         }
      });

      await updateSupplier({
        ...editingSupplier,
        ...editForm,
        attachments: JSON.stringify(finalAttachments),
        changeReason: changeReason
      } as any);
      setIsEditModalOpen(false);
      loadData(); // Reload list
      alert("更新成功");
    } catch (error) {
      console.error("Failed to update supplier", error);
      alert("更新失败");
    }
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = !searchTerm || 
      supplier.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier.tags && supplier.tags.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRegion = !regionFilter || supplier.region === regionFilter;
    
    return matchesSearch && matchesRegion;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">供应商查询</h1>
          <p className="text-gray-500 mt-1">查询和管理所有已入库的供应商信息</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Search & Filter */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex space-x-2 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索供应商名称、标签、统一社会信用代码..." 
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select 
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">全部地区</option>
              <option value="HK">香港</option>
              <option value="MAINLAND">内地</option>
            </select>
          </div>
          <div className="text-sm text-gray-500">
            共找到 <span className="font-semibold text-gray-900">{filteredSuppliers.length}</span> 家供应商
          </div>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-gray-500">加载中...</div>
        ) : filteredSuppliers.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredSuppliers.map((supplier) => (
              <div 
                key={supplier.supplierId} 
                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer group"
                onClick={() => navigate(`/supplier/admission/detail/${supplier.supplierId}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-medium text-gray-900 mr-3 group-hover:text-blue-600 transition-colors">
                        {supplier.supplierName}
                      </h3>
                      {supplier.region === 'HK' ? (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded border border-purple-200 font-medium mr-2">香港</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded border border-indigo-200 font-medium mr-2">内地</span>
                      )}
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded border border-green-200 font-medium">
                        {supplier.status === 'APPROVED' ? '已入库' : supplier.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-2 gap-x-6 text-sm text-gray-600 mt-3">
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="truncate" title={supplier.creditCode}>{supplier.creditCode || '-'}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                        <span>{supplier.contactPhone}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="truncate" title={supplier.address}>{supplier.address}</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-2" />
                        <span>{supplier.rating}/5.0</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center space-x-2">
                      {(supplier.tags || '').split(',').filter(Boolean).map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{tag}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-400 self-center ml-4 space-x-2">
                    <button
                      onClick={(e) => handleHistoryClick(e, supplier)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      title="变更历史"
                    >
                      <History className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => handleEditClick(e, supplier)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      title="编辑供应商"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <ChevronRight className="w-5 h-5 group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <Search className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-900">未找到相关供应商</p>
            <p className="text-sm text-gray-500 mt-1">请尝试调整搜索关键词或筛选条件</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">编辑供应商信息</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-8">
              
              {/* Basic Info */}
              <div>
                <h4 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center">
                  <span className="w-1 h-4 bg-blue-600 rounded mr-2"></span>
                  基本信息
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">供应商名称</label>
                    <input
                      type="text"
                      value={editForm.supplierName || ''}
                      onChange={(e) => setEditForm({...editForm, supplierName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">地区</label>
                    <select
                      value={editForm.region || 'HK'}
                      onChange={(e) => setEditForm({...editForm, region: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="HK">香港 (Hong Kong)</option>
                      <option value="MAINLAND">内地 (Mainland)</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">地址</label>
                    <input
                      type="text"
                      value={editForm.address || ''}
                      onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">统一社会信用代码 (管理字段)</label>
                    <input
                      type="text"
                      value={editForm.creditCode || ''}
                      onChange={(e) => setEditForm({...editForm, creditCode: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">标签 (管理字段)</label>
                    <input
                      type="text"
                      value={editForm.tags || ''}
                      onChange={(e) => setEditForm({...editForm, tags: e.target.value})}
                      placeholder="多个标签用逗号分隔"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center">
                  <span className="w-1 h-4 bg-blue-600 rounded mr-2"></span>
                  联系信息
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">联系人姓名</label>
                    <input
                      type="text"
                      value={editForm.contactName || ''}
                      onChange={(e) => setEditForm({...editForm, contactName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
                    <input
                      type="text"
                      value={editForm.contactPhone || ''}
                      onChange={(e) => setEditForm({...editForm, contactPhone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">公司邮箱</label>
                    <input
                      type="email"
                      value={editForm.email || ''}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Attachments */}
              <div>
                <h4 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center">
                  <span className="w-1 h-4 bg-blue-600 rounded mr-2"></span>
                  材料上传
                </h4>
                <div className="space-y-4">
                  {(editForm.region === 'HK' 
                      ? ['CR', 'BRO', 'VIOLATION_HK'] as const
                      : ['BUSINESS_LICENSE', 'VIOLATION_MAINLAND'] as const
                  ).map(type => {
                    const group = attachments.find(a => a.type === type) || { type, files: [] };
                    return (
                      <div key={type} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-3">
                          <label className="block text-sm font-medium text-gray-700">
                            {getAttachmentLabel(type)}
                          </label>
                          <div className="relative">
                            <input
                              type="file"
                              multiple
                              onChange={(e) => handleFileUpload(type, e)}
                              className="hidden"
                              id={`file-upload-${type}`}
                            />
                            <label
                              htmlFor={`file-upload-${type}`}
                              className="cursor-pointer inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                            >
                              <Upload className="w-4 h-4 mr-1.5" />
                              上传文件
                            </label>
                          </div>
                        </div>

                        {group.files.length > 0 ? (
                          <ul className="space-y-2">
                            {group.files.map((file, index) => (
                              <li key={index} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200 text-sm">
                                <div className="flex items-center text-gray-600 truncate mr-3">
                                  <FileText className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                                  <span className="truncate" title={file.name}>{file.name}</span>
                                </div>
                                <div className="flex items-center space-x-2 flex-shrink-0">
                                  <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-xs">
                                    预览
                                  </a>
                                  <button type="button" onClick={() => removeFile(type, index)} className="text-red-500 hover:text-red-700">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-center py-4 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded">
                            暂无文件
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <label className="block text-sm font-medium text-red-600 mb-1">变更原因 (必填)</label>
                <textarea
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  placeholder="请输入本次信息变更的原因..."
                  rows={3}
                  className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-red-50"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleUpdateSubmit}
                className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
              >
                保存变更
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">供应商变更历史</h3>
              <button onClick={() => setIsHistoryModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-0 overflow-y-auto flex-1">
              {historyLoading ? (
                <div className="p-12 text-center text-gray-500">加载中...</div>
              ) : historyList.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">变更时间</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作人</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">变更类型</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">变更原因</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {historyList.map((history) => (
                      <tr key={history.historyId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(history.operateTime).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {history.operatorName || history.operatorId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            history.changeType === 'UPDATE' ? 'bg-blue-100 text-blue-800' : 
                            history.changeType === 'CREATE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {history.changeType === 'UPDATE' ? '更新信息' : history.changeType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={history.changeReason}>
                          {history.changeReason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center text-gray-500">暂无变更记录</div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50 text-right">
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierQuery;