import React, { useState, useEffect } from 'react';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { 
  Search, 
  ArrowLeft,
  Save,
  Send,
  Building,
  Edit,
  Trash2,
  Plus,
  FileText,
  File,
  AlertTriangle,
  X
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { StandardDatePicker } from '../../../components/common/StandardDatePicker';
import { 
  searchProcurement,
  getProcurementDetail,
  getBidDraft,
  saveBidDraft,
  initiateBid,
  uploadAttachment
} from '../../../api/bid';
import { 
  BidForm, 
  SupplierCandidate, 
  Attachment, 
  ProcurementSearchResult
} from '../../../types/bid';

// Mock data for initial state or fallback
const initialFormState: BidForm = {
  bidTitle: '',
  deadline: '',
  description: '',
  notificationMethods: ['email'],
  suppliers: [], // Initially empty, will be populated from selected procurement
  emailRecipients: '',
  emailSubject: '',
  emailBody: `尊敬的供应商，

您好！我们诚挚邀请贵公司参与"办公设备采购项目"的投标。

项目概况：
采购内容: [自动填充]
预算金额: [自动填充]
投标截止: [自动填充]

投标要求：
[自动填充描述]

请点击以下链接提交您的投标文件：
http://[内网地址]/submit/PR-2024-001

如有任何疑问，请随时与我们联系。

此致
采购部`,
  attachments: [],
  status: 'draft'
};

const CreateBid: React.FC = () => {
  useDocumentTitle('新建投标 - 投标管理');
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // If editing draft

  // Form State
  const [formData, setFormData] = useState<BidForm>(initialFormState);
  const [selectedProcurement, setSelectedProcurement] = useState<ProcurementSearchResult | null>(null);
  
  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ProcurementSearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load draft if ID exists
  useEffect(() => {
    if (id) {
      const loadDraft = async () => {
        setLoading(true);
        try {
          const draft = await getBidDraft(id);
          if (draft) {
            setFormData(draft);
            if (draft.procurementId) {
              // Simulate loading procurement details for the drafted one
              setSelectedProcurement({
                id: draft.procurementId,
                name: draft.procurementName || '',
                code: 'PR-2024-001', // Mock
                budget: draft.budget || 0,
                content: '加载中...',
                status: '已评审'
              });
            }
          }
        } catch (error) {
          console.error("Failed to load draft", error);
        } finally {
          setLoading(false);
        }
      };
      loadDraft();
    }
  }, [id]);

  // Search Procurement
  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.length > 0) {
      try {
        const results = await searchProcurement(term);
        setSearchResults(results);
        setShowSearchResults(true);
      } catch (error) {
        console.error("Search failed", error);
      }
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleFocus = async () => {
    if (searchTerm.length === 0) {
      try {
        const results = await searchProcurement('');
        setSearchResults(results.slice(0, 5));
        setShowSearchResults(true);
      } catch (error) {
        console.error("Failed to load recent procurements", error);
      }
    } else {
       if (searchResults.length > 0) {
           setShowSearchResults(true);
       }
    }
  };

  const selectProcurement = async (item: ProcurementSearchResult) => {
    try {
      // Fetch details to get suppliers
      const detail = await getProcurementDetail(item.id);
      
      // Map backend supplier list to frontend format
      const suppliers: SupplierCandidate[] = (detail.supplierList || []).map((s: any) => ({
        id: s.supplierId,
        supplierId: s.supplierId,
        name: s.supplierName,
        email: s.email,
        selected: true // Default to selected
      }));

      // Update selected item with suppliers for internal state if needed
      // Note: selectedProcurement state only needs basic info for display card
      setSelectedProcurement(item);
      
      const recipients = suppliers
        .filter(s => s.selected)
        .map(s => s.email)
        .join(', ');

      setFormData(prev => ({
        ...prev,
        procurementId: item.id,
        procurementName: item.name,
        budget: item.budget,
        emailSubject: `【投标邀请】${item.name}`, // Auto-fill subject
        suppliers: suppliers,
        emailRecipients: recipients
      }));
      setSearchTerm('');
      setShowSearchResults(false);
    } catch (error) {
      console.error("Failed to load procurement details", error);
      alert("无法加载采购申请详情");
    }
  };

  const removeProcurement = () => {
    setSelectedProcurement(null);
    setFormData(prev => ({
      ...prev,
      procurementId: undefined,
      procurementName: undefined,
      budget: undefined,
      suppliers: [],
      emailRecipients: ''
    }));
  };

  // Handlers
  const handleInputChange = (field: keyof BidForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleNotification = (method: 'email' | 'sms') => {
    setFormData(prev => {
      const current = prev.notificationMethods;
      if (current.includes(method)) {
        return { ...prev, notificationMethods: current.filter(m => m !== method) };
      } else {
        return { ...prev, notificationMethods: [...current, method] };
      }
    });
  };

  const toggleSupplier = (id: number) => {
    setFormData(prev => {
      const newSuppliers = prev.suppliers.map(s => 
        s.id === id ? { ...s, selected: !s.selected } : s
      );
      // Update recipients string based on selection
      const recipients = newSuppliers
        .filter(s => s.selected)
        .map(s => s.email)
        .join(', ');
        
      return { 
        ...prev, 
        suppliers: newSuppliers,
        emailRecipients: recipients
      };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        // Integration Point: Upload attachment
        // const result = await uploadAttachment(file);
        // setFormData(prev => ({ ...prev, attachments: [...prev.attachments, result] }));
        
        // Mock upload
        const newFile: Attachment = {
          name: file.name,
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          url: URL.createObjectURL(file),
          type: file.type
        };
        setFormData(prev => ({ ...prev, attachments: [...prev.attachments, newFile] }));
      } catch (error) {
        console.error("Upload failed", error);
      }
    }
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    if (!selectedProcurement) {
      alert('请选择采购申请');
      return false;
    }
    if (!formData.bidTitle) {
      alert('请输入投标标题');
      return false;
    }
    if (!formData.deadline) {
      alert('请选择截止时间');
      return false;
    }
    if (new Date(formData.deadline) <= new Date()) {
      alert('截止时间必须是未来日期');
      return false;
    }
    if (!formData.description) {
      alert('请输入投标描述');
      return false;
    }
    return true;
  };

  const handleSubmit = async (isDraft: boolean) => {
    if (!isDraft && !validateForm()) return;

    setSubmitting(true);
    try {
      // Get current user info (mocked or from storage)
      const currentUser = {
        id: 'U002', // Mock logged in user
        name: '采购专员' // Mock logged in user name
      };

      const payload = { 
        ...formData, 
        status: isDraft ? 'draft' : 'evaluating',
        createUserId: currentUser.id,
        createUserName: currentUser.name
      } as BidForm;
      
      if (isDraft) {
        // Integration Point: Save draft
        await saveBidDraft(payload);
        alert('草稿保存成功');
      } else {
        // Integration Point: Initiate bid
        await initiateBid(payload);
        alert('投标发起成功');
        navigate('/bid/list');
      }
    } catch (error) {
      console.error("Operation failed", error);
      alert('操作失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col relative bg-gray-50">
      {/* 1. Page Title */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">新建投标</h2>
          <p className="text-sm text-gray-500 mt-0.5">创建新的投标项目并发起供应商邀请</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* 2. Breadcrumb */}
        <div className="bg-gray-50 px-8 py-4 border-b border-gray-200">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center text-sm">
              <a href="#" onClick={() => navigate('/bid/list')} className="text-gray-600 hover:text-blue-600 transition-colors">投标管理</a>
              <span className="text-gray-400 mx-2">{'>'}</span>
              <span className="text-gray-900 font-medium">新建投标</span>
            </div>
          </div>
        </div>

        {/* 3. Main Form Section */}
        <div className="px-8 py-8">
          <div className="max-w-5xl mx-auto space-y-6">
            
            {/* Step 1: Select Procurement */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-5 border-b border-gray-200 flex items-center">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">1</div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">选择采购申请</h3>
                  <p className="text-sm text-gray-500 mt-0.5">从已评审通过的采购申请中选择</p>
                </div>
              </div>
              <div className="p-6">
                {!selectedProcurement ? (
                  <div className="mb-4 relative">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      搜索并选择采购申请 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input 
                        type="text" 
                        placeholder="输入采购申请编号或名称搜索..." 
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        onFocus={handleFocus}
                      />
                    </div>
                    {/* Search Results Dropdown */}
                    {showSearchResults && searchResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {searchResults.map(item => (
                          <div 
                            key={item.id} 
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                            onClick={() => selectProcurement(item)}
                          >
                            <div className="font-medium text-gray-900">{item.name}</div>
                            <div className="text-xs text-gray-500 flex justify-between mt-1">
                              <span>{item.code}</span>
                              <span>¥{item.budget.toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-sm font-semibold text-gray-900">{selectedProcurement.name}</h4>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          {selectedProcurement.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-3">采购编号: {selectedProcurement.code} | 预算: ¥{selectedProcurement.budget.toLocaleString()}</p>
                      <p className="text-xs text-gray-700">采购内容: {selectedProcurement.content}</p>
                    </div>
                    <button onClick={removeProcurement} className="text-gray-400 hover:text-red-600 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Bid Info */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-5 border-b border-gray-200 flex items-center">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">2</div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">填写投标信息</h3>
                  <p className="text-sm text-gray-500 mt-0.5">完善投标项目的基本信息</p>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      投标标题 <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="例如: 办公设备采购投标" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.bidTitle}
                      onChange={(e) => handleInputChange('bidTitle', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      截止时间 <span className="text-red-500">*</span>
                    </label>
                    <StandardDatePicker 
                      className="w-full"
                      showTime
                      format="YYYY-MM-DD HH:mm"
                      value={formData.deadline ? dayjs(formData.deadline) : null}
                      onChange={(date, dateString) => handleInputChange('deadline', date ? (date as any).format('YYYY-MM-DDTHH:mm') : '')}
                      placeholder=""
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    投标描述 <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    rows={6} 
                    placeholder="请详细描述投标项目的要求、标准、交付时间等关键信息..." 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-2 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    此描述将在邮件中发送给供应商，请确保信息完整准确
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    通知方式
                  </label>
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.notificationMethods.includes('email')}
                        onChange={() => toggleNotification('email')}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">邮件通知</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.notificationMethods.includes('sms')}
                        onChange={() => toggleNotification('sms')}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">短信通知</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Preview and Initiate */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-5 border-b border-gray-200 flex items-center">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">3</div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">预览并发起</h3>
                  <p className="text-sm text-gray-500 mt-0.5">确认供应商名单和邮件内容</p>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    候选供应商 ({formData.suppliers.filter(s => s.selected).length})
                  </label>
                  {formData.suppliers.length === 0 ? (
                    <div className="p-8 text-center bg-gray-50 border border-gray-200 border-dashed rounded-lg text-gray-500">
                      请先选择采购申请以获取关联供应商列表
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {formData.suppliers.map(supplier => (
                        <div key={supplier.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-blue-100`}>
                              <Building className="text-blue-600 w-4 h-4" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{supplier.name}</p>
                              <p className="text-xs text-gray-500">{supplier.email}</p>
                            </div>
                          </div>
                          <input 
                            type="checkbox" 
                            checked={supplier.selected}
                            onChange={() => toggleSupplier(supplier.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    邮件编辑
                  </label>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-center space-x-2 mb-3">
                        <label className="text-xs font-semibold text-gray-700 w-16">收件人:</label>
                        <div className="flex-1 relative">
                          <input 
                            type="text" 
                            value={formData.emailRecipients}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-gray-100 focus:outline-none"
                          />
                          <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600">
                            <Edit className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <label className="text-xs font-semibold text-gray-700 w-16">主题:</label>
                        <div className="flex-1 relative">
                          <input 
                            type="text" 
                            value={formData.emailSubject}
                            onChange={(e) => handleInputChange('emailSubject', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600">
                            <Edit className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <textarea 
                        rows={14} 
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        value={formData.emailBody}
                        onChange={(e) => handleInputChange('emailBody', e.target.value)}
                      />
                    </div>

                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-xs font-semibold text-gray-700">附件文档 ({formData.attachments.length})</label>
                        <label className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer flex items-center">
                          <input type="file" className="hidden" onChange={handleFileUpload} />
                          <Plus className="w-3 h-3 mr-1" />
                          添加附件
                        </label>
                      </div>
                      <div className="space-y-2">
                        {formData.attachments.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg">
                            <div className="flex items-center">
                              <div className="w-7 h-7 bg-gray-100 rounded flex items-center justify-center">
                                <FileText className="text-gray-600 w-4 h-4" />
                              </div>
                              <div className="ml-2">
                                <p className="text-xs font-medium text-gray-900">{file.name}</p>
                                <p className="text-xs text-gray-500">{file.size}</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => removeAttachment(idx)}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
                  <AlertTriangle className="text-yellow-600 w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="ml-3">
                    <h4 className="text-sm font-semibold text-yellow-900 mb-1">发起前确认</h4>
                    <p className="text-xs text-yellow-800">请仔细检查供应商名单、邮件内容和附件。投标一旦发起，将立即发送邮件通知给所选供应商，且无法撤回。</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Footer Actions */}
            <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky bottom-6 z-10">
              <button 
                onClick={() => navigate('/bid/list')}
                className="flex items-center px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回列表
              </button>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => handleSubmit(true)}
                  disabled={submitting}
                  className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  保存草稿
                </button>
                <button 
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                  className="flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                >
                  <Send className="w-4 h-4 mr-2" />
                  发起投标
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBid;
