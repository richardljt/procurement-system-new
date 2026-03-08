import React, { useState, useEffect } from 'react';
import { 
  Save, X, Info, FileText, Lightbulb, Link as LinkIcon, 
  DollarSign, AlertTriangle, Building, Search, Star, 
  MapPin, Phone, CreditCard, User, Check, UserCheck, 
  ArrowLeft, Paperclip, Plus, Eye, Route as RouteIcon, Trash
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FileRecord } from '../../../api/common';
import { 
  createProcurementRequest,
  ExchangeRate,
  getExchangeRates,
  getPreApplications,
  getSuppliers,
  getProcurementById,
  PreApplication,
  ProcurementRequest,
  Supplier
} from '../../../api/procurement';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';

const CreateProcurement: React.FC = () => {
  useDocumentTitle('创建采购申请');
  const navigate = useNavigate();
  const [supplierType, setSupplierType] = useState<'multiple' | 'single'>('multiple');
  const [amount, setAmount] = useState<string>('');
  // const [currency, setCurrency] = useState('CNY'); // Removed global currency
  const [showBudgetWarning, setShowBudgetWarning] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // File Upload State
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [singleSourceFiles, setSingleSourceFiles] = useState<File[]>([]);
  const [existingAttachmentFiles, setExistingAttachmentFiles] = useState<FileRecord[]>([]);
  const [existingSingleSourceFiles, setExistingSingleSourceFiles] = useState<FileRecord[]>([]);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const singleSourceFileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, module: 'attachment' | 'single_source') => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      if (module === 'attachment') {
        setAttachmentFiles(prev => [...prev, ...newFiles]);
      } else {
        setSingleSourceFiles(prev => [...prev, ...newFiles]);
      }
    }
    if (event.target.value) event.target.value = '';
  };

  const removeFile = (fileName: string, module: 'attachment' | 'single_source') => {
    if (module === 'attachment') {
      setAttachmentFiles(prev => prev.filter(f => f.name !== fileName));
    } else {
      setSingleSourceFiles(prev => prev.filter(f => f.name !== fileName));
    }
  };
  
  const removeExistingFile = (fileId: number, module: 'attachment' | 'single_source') => {
      // This function would ideally call an API to delete the file.
      // For now, we'll just remove it from the view.
      // Note: This is not implemented in the backend yet.
      if (module === 'attachment') {
          setExistingAttachmentFiles(prev => prev.filter(f => f.fileId !== fileId));
      } else {
          setExistingSingleSourceFiles(prev => prev.filter(f => f.fileId !== fileId));
      }
      alert('注意：删除现有文件功能尚未完全实现！');
  }
  
  // Parse query params to check for edit mode
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if (id) {
        setEditingId(parseInt(id));
        loadDraft(parseInt(id));
    }
  }, [location.search]);

  const loadDraft = async (id: number) => {
    try {
        const data = await getProcurementById(id);
        if (data) {
            setTitle(data.title || '');
            setDepartment(data.department || '技术研发部');
            // Reverse procurement type mapping
            let typeName = '固定资产采购';
            switch(data.procurementType) {
                case 'FIXED_ASSET': typeName = '固定资产采购'; break;
                case 'OFFICE_SUPPLY': typeName = '办公用品采购'; break;
                case 'SERVICE': typeName = '服务采购'; break;
                case 'ENGINEERING': typeName = '工程采购'; break;
                default: typeName = '其他';
            }
            setProcurementType(typeName);
            setUrgency(data.urgencyLevel || 'NORMAL');
            setDeliveryAddress(data.deliveryAddress || '');
            setBackgroundDesc(data.backgroundDesc || '');
            setSupplierType(data.supplierSelectionType === 'SINGLE' ? 'single' : 'multiple');
            setSingleSourceReason(data.singleSourceReason || '');
            
            // Handle Items
            if (data.items && data.items.length > 0) {
                setBudgetItems(data.items.map(item => ({
                    id: item.itemId || Date.now(),
                    name: item.itemName,
                    amount: item.amount.toString(),
                    currency: item.currency
                })));
            }
            
            // Pre-App is handled by useEffect
            
            // Handle Suppliers
            if (data.supplierIds) {
                setSelectedSupplierIds(data.supplierIds);
            }
            
            // Handle Files
            if (data.attachments) {
                setExistingAttachmentFiles(data.attachments);
            }
            if (data.singleSourceAttachments) {
                setExistingSingleSourceFiles(data.singleSourceAttachments);
            }
        }
    } catch (error) {
        console.error("Failed to load draft", error);
        alert("加载草稿失败");
    }
  };

  // Data States
  const [preApplications, setPreApplications] = useState<PreApplication[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [selectedPreApp, setSelectedPreApp] = useState<PreApplication | null>(null);
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<number[]>([]); 
  
  // Re-run pre-app selection when preApplications are loaded and we have a draft with preAppId
  useEffect(() => {
    if (editingId && preApplications.length > 0 && !selectedPreApp) {
         getProcurementById(editingId).then(data => {
             if (data && data.preApplicationId) {
                 const app = preApplications.find(p => p.preApplicationId === data.preApplicationId);
                 if (app) setSelectedPreApp(app);
             }
         });
    }
  }, [preApplications, editingId]);

  // Supplier Modal State
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [tempSelectedSupplierIds, setTempSelectedSupplierIds] = useState<number[]>([]);
  const [supplierSearchTerm, setSupplierSearchTerm] = useState('');
  
  // Budget Items State
  const [budgetItems, setBudgetItems] = useState<{id: number, name: string, amount: string, currency: string}[]>([
    { id: Date.now(), name: '', amount: '', currency: 'CNY' }
  ]);

  // Form States
  const [department, setDepartment] = useState('技术研发部');
  const [title, setTitle] = useState('');
  const [procurementType, setProcurementType] = useState('固定资产采购');
  const [urgency, setUrgency] = useState('NORMAL');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [backgroundDesc, setBackgroundDesc] = useState('');
  const [singleSourceReason, setSingleSourceReason] = useState('');


  const currencySymbols: Record<string, string> = {
    'CNY': '¥', 'USD': '$', 'EUR': '€', 'JPY': '¥', 'HKD': 'HK$'
  };

  useEffect(() => {
    // Load Data
    const loadData = async () => {
      try {
        const preApps = await getPreApplications();
        setPreApplications(preApps);
        
        // Use getSuppliers to fetch APPROVED suppliers (default behavior of list endpoint)
        const supps = await getSuppliers(); 
        setSuppliers(supps || []);

        const rates = await getExchangeRates();
        setExchangeRates(rates);
      } catch (error) {
        console.error("Failed to load data", error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (selectedPreApp) {
      const numAmount = parseFloat(amount) || 0;
      const remaining = selectedPreApp.remainingBudget - numAmount;
      setShowBudgetWarning(remaining < 0);
    }
  }, [amount, selectedPreApp]);
  
  // Budget Item Handlers - HKD Total
  useEffect(() => {
    const calculateTotalHKD = () => {
        return budgetItems.reduce((sum, item) => {
            const itemAmount = parseFloat(item.amount) || 0;
            // Find exchange rate to HKD
            let rate = 1;
            if (item.currency !== 'HKD') {
                const rateObj = exchangeRates.find(r => r.sourceCurrency === item.currency && r.targetCurrency === 'HKD');
                rate = rateObj ? rateObj.rate : 1;
            }
            return sum + (itemAmount * rate);
        }, 0);
    };
    const total = calculateTotalHKD();
    setAmount(total.toFixed(2));
  }, [budgetItems, exchangeRates]);

  const addBudgetItem = () => {
    setBudgetItems([...budgetItems, { id: Date.now(), name: '', amount: '', currency: 'CNY' }]);
  };

  const removeBudgetItem = (id: number) => {
    if (budgetItems.length > 1) {
      setBudgetItems(budgetItems.filter(item => item.id !== id));
    }
  };

  const updateBudgetItem = (id: number, field: 'name' | 'amount' | 'currency', value: string) => {
    setBudgetItems(budgetItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const openSupplierModal = () => {
    // Reload suppliers to ensure we have the latest approved list
    getSuppliers().then(data => setSuppliers(data || [])).catch(console.error);
    setTempSelectedSupplierIds([...selectedSupplierIds]);
    setSupplierSearchTerm('');
    setShowSupplierModal(true);
  };

  const toggleTempSupplier = (id: number) => {
    if (tempSelectedSupplierIds.includes(id)) {
      setTempSelectedSupplierIds(tempSelectedSupplierIds.filter(sid => sid !== id));
    } else {
      setTempSelectedSupplierIds([...tempSelectedSupplierIds, id]);
    }
  };

  const confirmSupplierSelection = () => {
    setSelectedSupplierIds(tempSelectedSupplierIds);
    setShowSupplierModal(false);
  };

  const removeSupplier = (id: number) => {
    setSelectedSupplierIds(selectedSupplierIds.filter(sid => sid !== id));
  };

  const handleSubmit = () => {
    if (!amount || !backgroundDesc || !title) {
      alert("请填写必填项");
      return;
    }
    setShowApprovalModal(true);
  };

  const confirmSubmit = async () => {
    let typeCode = 'OTHER';
    switch(procurementType) {
        case '固定资产采购': typeCode = 'FIXED_ASSET'; break;
        case '办公用品采购': typeCode = 'OFFICE_SUPPLY'; break;
        case '服务采购': typeCode = 'SERVICE'; break;
        case '工程采购': typeCode = 'ENGINEERING'; break;
        default: typeCode = 'OTHER';
    }

    const requestPayload = {
      department,
      applicantName: '张明',
      title,
      procurementType: typeCode,
      urgencyLevel: urgency,
      deliveryAddress,
      amount: parseFloat(amount),
      currency: 'HKD',
      items: budgetItems.map(item => ({
          itemName: item.name,
          amount: parseFloat(item.amount),
          currency: item.currency
      })),
      backgroundDesc,
      status: 'APPROVING',
      supplierSelectionType: supplierType === 'multiple' ? 'MULTIPLE' : 'SINGLE',
      singleSourceReason: supplierType === 'single' ? singleSourceReason : undefined,
      preApplicationId: selectedPreApp?.preApplicationId,
      supplierIds: selectedSupplierIds,
      procurementRequestId: editingId || undefined,
      // Note: existing files are already on the request object on the backend
      // We only need to send the new ones.
    };

    const formData = new FormData();
    formData.append('request', new Blob([JSON.stringify(requestPayload)], { type: "application/json" }));

    attachmentFiles.forEach(file => {
      formData.append('files', file);
    });

    singleSourceFiles.forEach(file => {
      formData.append('singleSourceFiles', file);
    });

    try {
      await createProcurementRequest(formData);
      alert('采购申请已提交！');
      setShowApprovalModal(false);
      navigate('/');
    } catch (error) {
      console.error("Submission failed", error);
      alert("提交失败，请重试");
    }
  };

  const handleSaveDraft = async () => {
    if (!title) {
        alert("保存草稿需至少填写采购标题");
        return;
    }
    
    let typeCode = 'OTHER';
    switch(procurementType) {
        case '固定资产采购': typeCode = 'FIXED_ASSET'; break;
        case '办公用品采购': typeCode = 'OFFICE_SUPPLY'; break;
        case '服务采购': typeCode = 'SERVICE'; break;
        case '工程采购': typeCode = 'ENGINEERING'; break;
        default: typeCode = 'OTHER';
    }

    const requestPayload = {
        department,
        applicantName: '张明',
        title,
        procurementType: typeCode,
        urgencyLevel: urgency,
        deliveryAddress,
        amount: parseFloat(amount) || 0,
        currency: 'HKD',
        items: budgetItems.map(item => ({
            itemName: item.name,
            amount: parseFloat(item.amount) || 0,
            currency: item.currency
        })),
        backgroundDesc: backgroundDesc || '草稿',
        status: 'DRAFT',
        supplierSelectionType: supplierType === 'multiple' ? 'MULTIPLE' : 'SINGLE',
        singleSourceReason: supplierType === 'single' ? singleSourceReason : undefined,
        preApplicationId: selectedPreApp?.preApplicationId,
        supplierIds: selectedSupplierIds,
        procurementRequestId: editingId || undefined,
    };

    const formData = new FormData();
    formData.append('request', new Blob([JSON.stringify(requestPayload)], { type: "application/json" }));

    attachmentFiles.forEach(file => {
      formData.append('files', file);
    });

    singleSourceFiles.forEach(file => {
      formData.append('singleSourceFiles', file);
    });

    try {
        await createProcurementRequest(formData);
        alert('草稿已保存！');
        navigate('/');
    } catch (error) {
        console.error("Save draft failed", error);
        alert("保存草稿失败，请重试");
    }
  };

  return (
    <div className="p-8">
      {/* Header and Basic Info */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-1">新建采购申请</h1>
            <p className="text-sm text-gray-500">请填写完整的采购申请信息，提交后将进入审批流程</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleSaveDraft}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
            >
              <Save className="mr-2 w-4 h-4" />保存草稿
            </button>
            <button onClick={() => navigate('/')} className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center">
              <X className="mr-2 w-4 h-4" />取消
            </button>
          </div>
        </div>
      </div>

      <div id="form-section" className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <Info className="text-blue-600 w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">基本信息</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">采购标题 <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={50}
                placeholder="请输入采购标题（最多50字）" 
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
              <p className="text-xs text-gray-500 mt-1 text-right">{title.length}/50</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">申请部门 <span className="text-red-500">*</span></label>
              <select 
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>技术研发部</option>
                <option>市场营销部</option>
                <option>财务部</option>
                <option>人力资源部</option>
                <option>行政部</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">申请人 <span className="text-red-500">*</span></label>
              <input type="text" value="张明" readOnly className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">采购类型 <span className="text-red-500">*</span></label>
              <select 
                value={procurementType}
                onChange={(e) => setProcurementType(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>固定资产采购</option>
                <option>办公用品采购</option>
                <option>服务采购</option>
                <option>工程采购</option>
                <option>其他</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">紧急程度 <span className="text-red-500">*</span></label>
              <select 
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="NORMAL">中等</option>
                <option value="URGENT">紧急</option>
                <option value="LOW">一般</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">交付地址 <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="请输入交付地址" 
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
        </div>

        {/* Background */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <FileText className="text-purple-600 w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">采购背景和说明</h2>
            <span className="ml-2 text-red-500">*</span>
          </div>
          
          <div className="mb-2">
            <textarea 
              value={backgroundDesc}
              onChange={(e) => setBackgroundDesc(e.target.value)}
              className="w-full h-64 p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请详细描述采购背景、需求来源、使用目的及预期效果..."
            ></textarea>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center mb-2">
               <h3 className="text-sm font-medium text-gray-700">附件上传</h3>
               <span className="text-xs text-gray-500 ml-2">(支持图片、文档等格式)</span>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
               <input 
                 type="file" 
                 multiple 
                 onChange={(e) => handleFileSelect(e, 'attachment')}
                 className="hidden" 
                 ref={fileInputRef}
               />
               <div className="flex flex-col items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                 <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2 hover:bg-blue-200 transition-colors">
                    <Plus className="w-5 h-5 text-blue-600" />
                 </div>
                 <p className="text-sm text-gray-600 font-medium">点击上传文件</p>
                 <p className="text-xs text-gray-400 mt-1">支持拖拽上传</p>
               </div>
               
               { (existingAttachmentFiles.length > 0 || attachmentFiles.length > 0) && (
                 <div className="mt-4 space-y-2 border-t border-gray-200 pt-3">
                   {/* Render existing files */}
                   {existingAttachmentFiles.map((file) => (
                     <div key={file.fileId} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                        <div className="flex items-center overflow-hidden">
                           <FileText className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                           <span className="text-sm text-gray-700 truncate">{file.originalFileName}</span>
                           <span className="text-xs text-gray-400 ml-2 flex-shrink-0">({(file.fileSize / 1024).toFixed(1)} KB)</span>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeExistingFile(file.fileId, 'attachment'); }}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                           <X className="w-4 h-4" />
                        </button>
                     </div>
                   ))}
                   {/* Render new files */}
                   {attachmentFiles.map((file, index) => (
                     <div key={index} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                        <div className="flex items-center overflow-hidden">
                           <FileText className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                           <span className="text-sm text-gray-700 truncate">{file.name}</span>
                           <span className="text-xs text-gray-400 ml-2 flex-shrink-0">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeFile(file.name, 'attachment'); }}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                           <X className="w-4 h-4" />
                        </button>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-2 flex items-center">
            <Lightbulb className="w-3 h-3 mr-1" />
            提示：请详细说明采购需求的背景、目的、必要性及预期效果
          </p>
        </div>

        {/* Pre-application */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <LinkIcon className="text-green-600 w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">关联事前申请</h2>
            </div>
            <div className="relative">
                <select 
                    className="px-4 py-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 font-medium flex items-center appearance-none pr-8 cursor-pointer"
                    onChange={(e) => {
                        const id = parseInt(e.target.value);
                        const app = preApplications.find(p => p.preApplicationId === id);
                        if(app) {
                            setSelectedPreApp(app);
                            setBudgetItems([{
                                id: Date.now(),
                                name: app.description || '事前申请预算',
                                amount: app.remainingBudget.toString(),
                                currency: app.currency || 'HKD'
                            }]);
                        }
                    }}
                    value={selectedPreApp?.preApplicationId || ''}
                >
                    <option value="" disabled>选择事前申请</option>
                    {preApplications.map(app => (
                        <option key={app.preApplicationId} value={app.preApplicationId}>
                            {app.applicationCode} - {app.description}
                        </option>
                    ))}
                </select>
                <Plus className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600 pointer-events-none" />
            </div>
          </div>

          {selectedPreApp ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <div className="flex items-center mb-2">
                    <span className="text-sm font-semibold text-gray-800">事前申请单号：</span>
                    <span className="text-sm text-blue-600 font-medium ml-2">{selectedPreApp.applicationCode}</span>
                    <span className="ml-3 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">{selectedPreApp.status}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-600 mb-2">
                    <span>申请日期：{selectedPreApp.applyDate}</span>
                    <span className="mx-2">|</span>
                    <span>批准日期：{selectedPreApp.approvalDate}</span>
                    </div>
                    <p className="text-sm text-gray-700">{selectedPreApp.description}</p>
                </div>
                <button className="text-gray-400 hover:text-red-500" onClick={() => setSelectedPreApp(null)}>
                    <X className="w-4 h-4" />
                </button>
                </div>
                
                <div className="border-t border-blue-200 pt-3">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">费用明细</h3>
                <div className="bg-white rounded-lg border border-blue-200 overflow-hidden">
                    <table className="w-full">
                    <thead className="bg-blue-50 border-b border-blue-200">
                        <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">费用项目</th>
                        <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">预算金额</th>
                        <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">已使用</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">剩余金额</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        <tr>
                        <td className="px-4 py-2 text-sm text-gray-700">总预算</td>
                        <td className="px-4 py-2 text-sm text-gray-700 text-center">{currencySymbols[selectedPreApp.currency || 'HKD']}{selectedPreApp.totalBudget.toFixed(2)}</td>
                        <td className="px-4 py-2 text-sm text-gray-700 text-center">{currencySymbols[selectedPreApp.currency || 'HKD']}{selectedPreApp.usedBudget.toFixed(2)}</td>
                        <td className="px-4 py-2 text-sm font-medium text-green-600 text-right">{currencySymbols[selectedPreApp.currency || 'HKD']}{selectedPreApp.remainingBudget.toFixed(2)}</td>
                        </tr>
                    </tbody>
                    </table>
                </div>
                </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                请先选择一个关联的事前申请
            </div>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-start">
              <Info className="text-blue-500 mt-0.5 mr-2 w-4 h-4" />
              <p className="text-xs text-gray-600">关联事前申请后，本次采购金额将从事前申请的预算中扣除。请确保采购金额不超过剩余预算。</p>
            </div>
          </div>
        </div>

        {/* Amount Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
              <DollarSign className="text-orange-600 w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">采购金额</h2>
            <span className="ml-2 text-red-500">*</span>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-end">
               <div className="text-right">
                  <span className="text-sm text-gray-500 block mb-1">采购总金额 (HKD折算)</span>
                  <div className="text-2xl font-bold text-blue-600">
                    HK${parseFloat(amount || '0').toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </div>
               </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">费用项名称</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">币种</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-96">金额</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {budgetItems.map((item) => (
                            <tr key={item.id}>
                                <td className="p-2">
                                    <input 
                                        type="text"
                                        value={item.name}
                                        onChange={(e) => updateBudgetItem(item.id, 'name', e.target.value)}
                                        placeholder="例如：服务器硬件采购"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </td>
                                <td className="p-2">
                                    <select
                                        value={item.currency}
                                        onChange={(e) => updateBudgetItem(item.id, 'currency', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="CNY">CNY</option>
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                        <option value="JPY">JPY</option>
                                        <option value="HKD">HKD</option>
                                    </select>
                                </td>
                                <td className="p-2">
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">{currencySymbols[item.currency]}</span>
                                        <input 
                                            type="number"
                                            value={item.amount}
                                            onChange={(e) => updateBudgetItem(item.id, 'amount', e.target.value)}
                                            placeholder="0.00"
                                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </td>
                                <td className="p-2 text-center">
                                    <button 
                                        onClick={() => removeBudgetItem(item.id)}
                                        className={`p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors ${budgetItems.length === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        disabled={budgetItems.length === 1}
                                    >
                                        <Trash className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-center">
                    <button 
                        onClick={addBudgetItem}
                        className="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-100 rounded-md transition-colors font-medium"
                    >
                        <Plus className="w-4 h-4 mr-1" /> 添加费用项
                    </button>
                </div>
            </div>
          </div>

          {selectedPreApp && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">事前申请剩余预算：</span>
                <span className="text-lg font-semibold text-blue-600">{currencySymbols[selectedPreApp.currency || 'HKD']}{selectedPreApp.remainingBudget.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">本次申请金额：</span>
                <span className="text-lg font-semibold text-gray-800">HK${(parseFloat(amount) || 0).toFixed(2)}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">申请后剩余预算：</span>
                <span className={`text-lg font-semibold ${showBudgetWarning ? 'text-red-600' : 'text-green-600'}`}>
                    {currencySymbols[selectedPreApp.currency || 'HKD']}{(selectedPreApp.remainingBudget - (parseFloat(amount) || 0)).toFixed(2)}
                </span>
                </div>
            </div>
          )}

          {showBudgetWarning && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="text-red-500 mt-0.5 mr-2 w-4 h-4" />
                <div>
                  <p className="text-sm font-medium text-red-700 mb-1">预算超支警告</p>
                  <p className="text-xs text-red-600">本次申请金额超出事前申请的剩余预算，请调整采购金额或选择其他事前申请。</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Supplier Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
              <Building className="text-indigo-600 w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">候选供应商选择</h2>
            <span className="ml-2 text-red-500">*</span>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">供应商类型</label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="radio" 
                  name="supplier-type" 
                  checked={supplierType === 'multiple'} 
                  onChange={() => setSupplierType('multiple')}
                  className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500" 
                />
                <span className="ml-2 text-sm text-gray-700">多个候选供应商（竞争性采购）</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input 
                  type="radio" 
                  name="supplier-type" 
                  checked={supplierType === 'single'} 
                  onChange={() => setSupplierType('single')}
                  className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500" 
                />
                <span className="ml-2 text-sm text-gray-700">单一来源供应商</span>
              </label>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">选择候选供应商</label>
              <button 
                onClick={openSupplierModal}
                className="px-3 py-1.5 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 font-medium flex items-center"
              >
                <Search className="mr-2 w-4 h-4" />从供应商库选择
              </button>
            </div>
            
            <div className="space-y-3">
              {suppliers.filter(s => selectedSupplierIds.includes(s.supplierId)).length === 0 && (
                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 text-sm">
                  暂无已选供应商，请点击上方按钮添加
                </div>
              )}
              {suppliers.filter(s => selectedSupplierIds.includes(s.supplierId)).map(supplier => (
                  <div key={supplier.supplierId} className="border border-blue-400 bg-blue-50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start flex-1">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className="text-sm font-semibold text-gray-800">{supplier.supplierName}</h3>
                            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">优质供应商</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                            <div className="flex items-center">
                              <CreditCard className="w-4 h-4 text-gray-400 mr-1" />
                              <span>统一社会信用代码：{supplier.creditCode}</span>
                            </div>
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 text-gray-400 mr-1" />
                              <span>联系电话：{supplier.contactPhone}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                              <span>{supplier.address}</span>
                            </div>
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 mr-1" />
                              <span>合作评分：{supplier.rating}/5.0</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                              {(supplier.tags || '').split(',').filter(Boolean).map((tag, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{tag}</span>
                              ))}
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeSupplier(supplier.supplierId)}
                        className="text-gray-400 hover:text-red-600 ml-3 p-1 rounded-md hover:bg-red-50 transition-colors"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
              ))}
            </div>
          </div>

          {supplierType === 'single' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">单一来源采购说明 <span className="text-red-500">*</span></label>
              <textarea 
                rows={4} 
                value={singleSourceReason}
                onChange={(e) => setSingleSourceReason(e.target.value)}
                placeholder="请详细说明选择单一来源供应商的理由，如：独家代理、专利产品、技术唯一性等" 
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
              <p className="text-xs text-gray-500 mt-2 flex items-center">
                <Info className="mr-1 w-3 h-3" />
                单一来源采购需要提供充分的理由说明，并需要额外的审批流程
              </p>

              <div className="mt-4">
                <div className="flex items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-700">附件上传</h3>
                  <span className="text-xs text-gray-500 ml-2">(支持图片、文档等格式)</span>
                </div>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                  <input 
                    type="file" 
                    multiple 
                    onChange={(e) => handleFileSelect(e, 'single_source')}
                    className="hidden" 
                    ref={singleSourceFileInputRef}
                  />
                  <div className="flex flex-col items-center justify-center cursor-pointer" onClick={() => singleSourceFileInputRef.current?.click()}>
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2 hover:bg-blue-200 transition-colors">
                        <Plus className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-600 font-medium">点击上传文件</p>
                    <p className="text-xs text-gray-400 mt-1">支持拖拽上传</p>
                  </div>
                  
                  { (existingSingleSourceFiles.length > 0 || singleSourceFiles.length > 0) && (
                    <div className="mt-4 space-y-2 border-t border-gray-200 pt-3">
                      {/* Render existing files */}
                      {existingSingleSourceFiles.map((file) => (
                        <div key={file.fileId} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                            <div className="flex items-center overflow-hidden">
                              <FileText className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                              <span className="text-sm text-gray-700 truncate">{file.originalFileName}</span>
                              <span className="text-xs text-gray-400 ml-2 flex-shrink-0">({(file.fileSize / 1024).toFixed(1)} KB)</span>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); removeExistingFile(file.fileId, 'single_source'); }}
                              className="text-gray-400 hover:text-red-500 p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                        </div>
                      ))}
                      {/* Render new files */}
                      {singleSourceFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                            <div className="flex items-center overflow-hidden">
                              <FileText className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                              <span className="text-sm text-gray-700 truncate">{file.name}</span>
                              <span className="text-xs text-gray-400 ml-2 flex-shrink-0">({(file.size / 1024).toFixed(1)} KB)</span>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); removeFile(file.name, 'single_source'); }}
                              className="text-gray-400 hover:text-red-500 p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-start">
              <Lightbulb className="text-yellow-500 mt-0.5 mr-2 w-4 h-4" />
              <div>
                <p className="text-xs font-medium text-gray-700 mb-1">选择建议</p>
                <p className="text-xs text-gray-600">• 多个候选供应商：系统将组织竞争性采购，仅需部门主管审批</p>
                <p className="text-xs text-gray-600">• 单一来源供应商：需要部门主管和直属行领导双重审批</p>
              </div>
            </div>
          </div>
        </div>

        {/* Approval Preview */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <RouteIcon className="text-blue-600 w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">预计审批流程</h2>
            </div>
            <span className={`px-3 py-1 ${supplierType === 'multiple' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'} text-xs rounded-full font-medium`}>
              {supplierType === 'multiple' ? '多个候选供应商' : '单一来源供应商'}
            </span>
          </div>
          
          <div className="relative pl-4">
              <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-gray-200"></div>
              
              <div className="space-y-8">
                  {/* Node 1: Submitter */}
                  <div className="flex items-start relative">
                      <div className="z-10 flex items-center justify-center w-10 h-10 bg-green-100 rounded-full border-4 border-white shadow-sm">
                          <User className="text-green-600 w-5 h-5" />
                      </div>
                      <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                              <h3 className="text-sm font-semibold text-gray-800">提交申请</h3>
                              <span className="text-xs text-gray-500">{new Date().toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center mt-1">
                            <span className="text-sm text-gray-600 mr-2">申请人：张明</span>
                            <span className="px-2 py-0.5 bg-green-50 text-green-600 text-xs rounded border border-green-100">当前</span>
                          </div>
                      </div>
                  </div>
                  
                  {/* Node 2: Dept Manager */}
                  <div className="flex items-start relative">
                      <div className="z-10 flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full border-4 border-white shadow-sm">
                          <UserCheck className="text-gray-400 w-5 h-5" />
                      </div>
                      <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                              <h3 className="text-sm font-semibold text-gray-800">部门主管审批</h3>
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded border border-gray-200">待审批</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">审批人：李经理（技术研发部主管）</p>
                      </div>
                  </div>

                  {/* Node 3: VP (Conditional) */}
                  {supplierType === 'single' && (
                      <div className="flex items-start relative">
                          <div className="z-10 flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full border-4 border-white shadow-sm">
                              <UserCheck className="text-gray-400 w-5 h-5" />
                          </div>
                          <div className="ml-4 flex-1">
                              <div className="flex items-center justify-between">
                                  <h3 className="text-sm font-semibold text-gray-800">直属行领导审批</h3>
                                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded border border-gray-200">待审批</span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">审批人：王副总裁（分管领导）</p>
                          </div>
                      </div>
                  )}

                  {/* Node 4: End */}
                   <div className="flex items-start relative">
                      <div className="z-10 flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full border-4 border-white shadow-sm">
                          <Check className="text-gray-400 w-5 h-5" />
                      </div>
                      <div className="ml-4 flex-1">
                          <h3 className="text-sm font-semibold text-gray-800">流程结束</h3>
                          <p className="text-xs text-gray-500 mt-1">审批通过后，将自动进入采购流程</p>
                      </div>
                  </div>
              </div>
          </div>
        </div>

        <div className="mt-4 bg-white border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <Info className="text-blue-500 mt-0.5 mr-2 w-4 h-4" />
              <div>
                <p className="text-xs font-medium text-gray-700 mb-1">温馨提示</p>
                <p className="text-xs text-gray-600">• 提交后无法修改，请仔细核对信息</p>
                <p className="text-xs text-gray-600">• 审批人将通过系统和邮件收到通知</p>
                <p className="text-xs text-gray-600">• 您可以在"我的申请"中查看审批进度</p>
              </div>
            </div>
          </div>

        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button onClick={() => navigate('/')} className="px-6 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 font-medium flex items-center">
            <ArrowLeft className="mr-2 w-4 h-4" />返回
          </button>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleSaveDraft}
              className="px-6 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 font-medium flex items-center"
            >
              <Save className="mr-2 w-4 h-4" />保存草稿
            </button>
            <button onClick={handleSubmit} className="px-6 py-2.5 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 font-medium shadow-sm flex items-center">
              <Paperclip className="mr-2 w-4 h-4" />提交申请
            </button>
          </div>
        </div>
      </div>

      {/* Supplier Selection Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 rounded-t-lg">
              <h2 className="text-lg font-semibold text-gray-800">选择供应商</h2>
              <button 
                onClick={() => setShowSupplierModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  value={supplierSearchTerm}
                  onChange={(e) => setSupplierSearchTerm(e.target.value)}
                  placeholder="搜索供应商名称、标签..." 
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <div className="space-y-3">
                {suppliers
                  .filter(s => 
                    (s.supplierName && s.supplierName.toLowerCase().includes(supplierSearchTerm.toLowerCase())) || 
                    (s.tags && s.tags.toLowerCase().includes(supplierSearchTerm.toLowerCase()))
                  )
                  .map(supplier => (
                    <div 
                      key={supplier.supplierId} 
                      className={`bg-white border rounded-lg p-4 cursor-pointer transition-all ${
                        tempSelectedSupplierIds.includes(supplier.supplierId) 
                          ? 'border-blue-500 ring-1 ring-blue-500 shadow-sm' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => toggleTempSupplier(supplier.supplierId)}
                    >
                      <div className="flex items-start">
                        <div className="pt-1 mr-3">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                            tempSelectedSupplierIds.includes(supplier.supplierId)
                              ? 'bg-blue-600 border-blue-600'
                              : 'bg-white border-gray-300'
                          }`}>
                            {tempSelectedSupplierIds.includes(supplier.supplierId) && (
                              <Check className="w-3.5 h-3.5 text-white" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <h3 className="text-sm font-semibold text-gray-800 mr-2">{supplier.supplierName}</h3>
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded border border-blue-100 font-medium">优质供应商</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {(supplier.tags || '').split(',').filter(Boolean).map((tag, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{tag}</span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                            <div className="flex items-center">
                              <CreditCard className="w-3.5 h-3.5 text-gray-400 mr-1.5" />
                              <span>{supplier.creditCode}</span>
                            </div>
                            <div className="flex items-center">
                              <Phone className="w-3.5 h-3.5 text-gray-400 mr-1.5" />
                              <span>{supplier.contactPhone}</span>
                            </div>
                            <div className="flex items-center col-span-2">
                              <MapPin className="w-3.5 h-3.5 text-gray-400 mr-1.5" />
                              <span className="truncate">{supplier.address}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-white rounded-b-lg flex justify-between items-center">
              <span className="text-sm text-gray-600">
                已选择 <span className="font-semibold text-blue-600">{tempSelectedSupplierIds.length}</span> 家供应商
              </span>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowSupplierModal(false)}
                  className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 font-medium"
                >
                  取消
                </button>
                <button 
                  onClick={confirmSupplierSelection}
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 font-medium shadow-sm"
                >
                  确认选择
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between rounded-t-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
                  <RouteIcon className="text-white text-lg w-6 h-6" />
                </div>
                <h2 className="text-xl font-semibold text-white">确认审批流程</h2>
              </div>
              <button onClick={() => setShowApprovalModal(false)} className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors">
                <X className="text-xl w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <Info className="text-blue-500 text-lg mt-0.5 mr-3 w-5 h-5" />
                  <div>
                    <p className="text-sm font-medium text-gray-800 mb-1">申请信息确认</p>
                    <div className="space-y-1 text-xs text-gray-600">
                      <p>• 申请部门：技术研发部</p>
                      <p>• 采购金额：<span className="font-semibold text-blue-600">HK${(parseFloat(amount) || 0).toFixed(2)}</span></p>
                      <p>• 候选供应商：<span className="font-semibold">{selectedSupplierIds.length}家</span></p>
                      <p>• 供应商类型：<span className="font-semibold">{supplierType === 'multiple' ? '多个候选供应商' : '单一来源供应商'}</span></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Content - Simplified Flow */}
              <div className="mb-6">
                 {/* Reusing logic from preview or simple confirmation text */}
                 <p className="text-sm text-gray-600">确认提交后，系统将立即启动审批流程。请确认所有信息填写无误。</p>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button onClick={() => setShowApprovalModal(false)} className="px-6 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 font-medium flex items-center">
                  <X className="mr-2 w-4 h-4" />取消
                </button>
                <button onClick={confirmSubmit} className="px-6 py-2.5 text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-md hover:from-blue-700 hover:to-indigo-700 font-medium shadow-lg flex items-center">
                  <Check className="mr-2 w-4 h-4" />确认提交
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateProcurement;
