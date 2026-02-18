import React, { useState, useEffect } from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Save, Send, Trash2, FileText, Upload, AlertCircle
} from 'lucide-react';
import { createSupplierApplication, getSupplierById, Supplier } from '../../api/procurement';

interface Attachment {
  name: string;
  url: string;
}

interface AttachmentGroup {
  type: 'CR' | 'BRO' | 'VIOLATION_HK' | 'BUSINESS_LICENSE' | 'VIOLATION_MAINLAND';
  files: Attachment[];
}

interface SupplierApplyData {
  supplierName: string;
  address: string;
  region: 'HK' | 'MAINLAND';
  contactName: string;
  phone: string;
  email: string;
  attachments: AttachmentGroup[];
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

const SupplierApplyForm: React.FC = () => {
  useDocumentTitle('供应商入库申请 - 供应商管理');
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isReadOnly = location.pathname.includes('/detail/');
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  console.log('SupplierApplyForm rendering, id:', id);

  // Initial form state
  const [formData, setFormData] = useState<SupplierApplyData>({
    supplierName: '',
    address: '',
    region: 'HK',
    contactName: '',
    phone: '',
    email: '',
    attachments: []
  });

  // Load data for edit mode
  useEffect(() => {
    if (id) {
      console.log('Loading data for edit mode, id:', id);
      const loadData = async () => {
        try {
          const app = await getSupplierById(Number(id));
          if (app) {
            setFormData({
              supplierName: app.supplierName,
              address: app.address || '',
              region: app.region || 'HK',
              contactName: app.contactName || '',
              phone: app.contactPhone || app.phone || '',
              email: app.email || '',
              attachments: app.attachments ? JSON.parse(app.attachments) : []
            });
          }
        } catch (error) {
           console.error("Failed to load supplier", error);
        }
      };
      loadData();
    }
  }, [id]);

  // Update attachments structure when region changes
  useEffect(() => {
    setFormData(prev => {
      const newAttachments = [...prev.attachments];
      
      if (prev.region === 'HK') {
        // Ensure HK specific attachment types exist
        const hkTypes: AttachmentGroup['type'][] = ['CR', 'BRO', 'VIOLATION_HK'];
        hkTypes.forEach(type => {
          if (!newAttachments.find(a => a.type === type)) {
            newAttachments.push({ type, files: [] });
          }
        });
      } else {
        // Ensure Mainland specific attachment types exist
        const mainlandTypes: AttachmentGroup['type'][] = ['BUSINESS_LICENSE', 'VIOLATION_MAINLAND'];
        mainlandTypes.forEach(type => {
          if (!newAttachments.find(a => a.type === type)) {
            newAttachments.push({ type, files: [] });
          }
        });
      }
      
      return { ...prev, attachments: newAttachments };
    });
  }, [formData.region]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileUpload = (type: AttachmentGroup['type'], e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(file => ({
        name: file.name,
        url: URL.createObjectURL(file) // Mock URL
      }));

      setFormData(prev => ({
        ...prev,
        attachments: prev.attachments.map(group => 
          group.type === type 
            ? { ...group, files: [...group.files, ...newFiles] }
            : group
        )
      }));
      
      // Clear attachment error if any
      if (errors[`attachment_${type}`]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[`attachment_${type}`];
          return newErrors;
        });
      }
    }
  };

  const removeFile = (type: AttachmentGroup['type'], index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.map(group => 
        group.type === type 
          ? { ...group, files: group.files.filter((_, i) => i !== index) }
          : group
      )
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.supplierName.trim()) newErrors.supplierName = '供应商名称不能为空';
    if (!formData.region) newErrors.region = '请选择地区';
    if (!formData.contactName.trim()) newErrors.contactName = '联系人姓名不能为空';
    
    if (!formData.phone.trim()) {
      newErrors.phone = '手机号不能为空';
    } else if (!/^\d{8,11}$/.test(formData.phone)) {
      newErrors.phone = '请输入有效的手机号';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = '公司邮箱不能为空';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }

    // Validate attachments
    const requiredTypes = formData.region === 'HK' 
      ? ['CR', 'BRO', 'VIOLATION_HK'] 
      : ['BUSINESS_LICENSE', 'VIOLATION_MAINLAND'];

    requiredTypes.forEach(type => {
      const group = formData.attachments.find(a => a.type === type);
      if (!group || group.files.length === 0) {
        newErrors[`attachment_${type}`] = '请上传此文件';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (isDraft: boolean) => {
    if (!isDraft && !validateForm()) {
      return;
    }

    setLoading(true);
    try {
       // Construct the supplier object for API
       const supplierPayload: Supplier = {
         supplierId: id ? Number(id) : undefined,
         supplierName: formData.supplierName,
         address: formData.address,
         region: formData.region,
         contactName: formData.contactName,
         contactPhone: formData.phone, // Map phone to contactPhone
         email: formData.email,
         status: isDraft ? 'DRAFT' : 'PENDING_APPROVAL',
         applicationNo: id ? undefined : `SUP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`, // Generate only for new
         attachments: JSON.stringify(formData.attachments.filter(group => {
            if (formData.region === 'HK') {
              return ['CR', 'BRO', 'VIOLATION_HK'].includes(group.type);
            } else {
              return ['BUSINESS_LICENSE', 'VIOLATION_MAINLAND'].includes(group.type);
            }
         }))
       };
       
       // If editing, preserve existing applicationNo if possible, but API doesn't return it in getSupplierById if not mapped? 
       // It is mapped in interface.
       
       await createSupplierApplication(supplierPayload);

      await new Promise(resolve => setTimeout(resolve, 500));
      alert(isDraft ? '草稿已保存' : '申请已提交');
      navigate('/supplier/admission/apply');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // Render attachment section directly in the component body or as a helper function
  // Here we keep it as a helper but ensure it uses the state correctly
  const renderAttachmentTypes = formData.region === 'HK' 
      ? ['CR', 'BRO', 'VIOLATION_HK'] as const
      : ['BUSINESS_LICENSE', 'VIOLATION_MAINLAND'] as const;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">供应商入库申请</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8 space-y-8">
          
          {/* Section 1: Basic Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center">
              <span className="w-1 h-5 bg-blue-600 rounded mr-2"></span>
              基本信息
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="text-red-500 mr-1">*</span>供应商名称
                </label>
                <input
                  type="text"
                  name="supplierName"
                  value={formData.supplierName}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.supplierName ? 'border-red-500' : 'border-gray-300'
                  } ${isReadOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                  placeholder="请输入供应商全称"
                />
                {errors.supplierName && (
                  <p className="mt-1 text-xs text-red-500">{errors.supplierName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="text-red-500 mr-1">*</span>地区
                </label>
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
                    isReadOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="HK">香港 (Hong Kong)</option>
                  <option value="MAINLAND">内地 (Mainland)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  地址
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    isReadOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                  }`}
                  placeholder="请输入详细地址"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center">
              <span className="w-1 h-5 bg-blue-600 rounded mr-2"></span>
              联系信息
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="text-red-500 mr-1">*</span>联系人姓名
                </label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.contactName ? 'border-red-500' : 'border-gray-300'
                  } ${isReadOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                  placeholder="请输入姓名"
                />
                {errors.contactName && (
                  <p className="mt-1 text-xs text-red-500">{errors.contactName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="text-red-500 mr-1">*</span>手机号
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  } ${isReadOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                  placeholder="请输入手机号"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="text-red-500 mr-1">*</span>公司邮箱
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } ${isReadOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                  placeholder="example@company.com"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Material Upload */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center">
              <span className="w-1 h-5 bg-blue-600 rounded mr-2"></span>
              材料上传
            </h2>
            
            <div className="space-y-6">
              {renderAttachmentTypes.map(type => {
                const group = formData.attachments.find(a => a.type === type) || { type, files: [] };
                return (
                  <div key={type} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        <span className="text-red-500 mr-1">*</span>
                        {getAttachmentLabel(type)}
                      </label>
                      <div className="relative">
                        {!isReadOnly && (
                          <>
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
                          </>
                        )}
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
                              <a 
                                href={file.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-xs"
                              >
                                预览
                              </a>
                              {!isReadOnly && (
                                <button
                                  type="button"
                                  onClick={() => removeFile(type, index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-4 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded">
                        暂无文件
                      </div>
                    )}
                    
                    {errors[`attachment_${type}`] && (
                      <p className="mt-1 text-xs text-red-500 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors[`attachment_${type}`]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-white hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            {isReadOnly ? '返回' : '取消'}
          </button>
          {!isReadOnly && (
            <>
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={loading}
                className="px-6 py-2.5 bg-white border border-blue-200 text-blue-700 font-medium rounded-lg hover:bg-blue-50 hover:shadow-sm transition-all flex items-center focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <Save className="w-4 h-4 mr-2" />
                保存草稿
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {loading ? '提交中...' : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    提交审批
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierApplyForm;
