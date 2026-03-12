import React, { useState, useEffect } from 'react';
import { 
  Info, FileText, Link as LinkIcon, 
  DollarSign, Building, Star, 
  MapPin, Phone, CreditCard, Check, UserCheck, 
  ArrowLeft, Route as RouteIcon, X
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { 
  getPreApplications, 
  getSuppliers, 
  getProcurementById,
  PreApplication,
  Supplier,
  ProcurementRequest,
  ProcessTask
} from '../../../api/procurement';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import AttachmentList from './AttachmentList';

const ProcurementDetail: React.FC = () => {
  useDocumentTitle('采购详情');
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [supplierType, setSupplierType] = useState<'multiple' | 'single'>('multiple');
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState('CNY');
  
  // Data States
  
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedPreApp, setSelectedPreApp] = useState<PreApplication | null>(null);
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<number[]>([]);
  const [procurementRequest, setProcurementRequest] = useState<ProcurementRequest | null>(null);
  const [processTasks, setProcessTasks] = useState<ProcessTask[]>([]);
  
  // Form States
  const [department, setDepartment] = useState('');
  const [title, setTitle] = useState('');
  const [procurementType, setProcurementType] = useState('');
  const [urgency, setUrgency] = useState('');
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
        const [preApps, supps] = await Promise.all([
            getPreApplications(),
            getSuppliers()
        ]);
        
        setSuppliers(supps);

        if (id) {
            const detail = await getProcurementById(parseInt(id));
            if (detail) {
                setProcurementRequest(detail); // Set the whole object
                setTitle(detail.title || '');
                setDepartment(detail.department);
                setProcurementType(detail.procurementType);
                setUrgency(detail.urgencyLevel);
                setDeliveryAddress(detail.deliveryAddress);
                setBackgroundDesc(detail.backgroundDesc);
                setAmount(detail.amount.toString());
                setCurrency(detail.currency);
                setSupplierType(detail.supplierSelectionType === 'SINGLE' ? 'single' : 'multiple');
                setSingleSourceReason(detail.singleSourceReason || '');
                setSelectedSupplierIds(detail.supplierIds || []);
                
                if (detail.preApplicationId) {
                    const app = preApps.find(p => p.preApplicationId === detail.preApplicationId);
                    if (app) setSelectedPreApp(app);
                }

                if (detail.processTasks) {
                    setProcessTasks(detail.processTasks);
                }
            }
        }
      } catch (error) {
        console.error("Failed to load data", error);
      }
    };
    loadData();
  }, [id]);

  const handlePreview = (file: { originalFileName: string, filePath: string }) => {
    // Check if it's a real URL or a mock path
    if (file.filePath && (file.filePath.startsWith('http') || file.filePath.startsWith('blob:'))) {
        window.open(file.filePath, '_blank');
    } else {
        window.open(`http://localhost:8082${file.filePath}`.replace(/\\/g, '/'), '_blank');
    }
  };

  const handleDownload = (file: { originalFileName: string, filePath: string }) => {
     const link = document.createElement('a');
     link.href = `http://localhost:8082${file.filePath}`.replace(/\\/g, '/');
     link.setAttribute('download', file.originalFileName);
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-1">采购申请详情</h1>
            <p className="text-sm text-gray-500">查看采购申请的详细信息和审批进度</p>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">采购标题</label>
              <input 
                type="text" 
                value={title}
                disabled
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-600" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">申请部门</label>
              <input type="text" value={department} disabled className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">申请人</label>
              <input type="text" value="张明" readOnly className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">采购类型</label>
              <input type="text" value={procurementType} disabled className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">紧急程度</label>
              <input 
                type="text" 
                value={urgency === 'URGENT' ? '紧急' : urgency === 'LOW' ? '一般' : '中等'} 
                disabled 
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-600" 
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">交付地址</label>
              <input 
                type="text" 
                value={deliveryAddress}
                disabled
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-600" />
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
          </div>
          
          <div className="mb-2">
            <textarea 
              value={backgroundDesc}
              disabled
              className="w-full h-64 p-4 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
            ></textarea>
          </div>

          <AttachmentList 
            files={procurementRequest?.attachments || []} 
            title="相关附件" 
            onPreview={handlePreview}
            onDownload={handleDownload}
          />
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
                无关联事前申请
            </div>
          )}
        </div>

        {/* Amount Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
              <DollarSign className="text-orange-600 w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">采购金额</h2>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">币种</label>
              <input type="text" value={currency} disabled className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-600" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">采购金额</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{currencySymbols[currency]}</span>
                <input 
                  type="text" 
                  value={amount}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-600" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Supplier Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
              <Building className="text-indigo-600 w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">候选供应商选择</h2>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">供应商类型</label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input 
                  type="radio" 
                  checked={supplierType === 'multiple'} 
                  disabled
                  className="w-4 h-4 text-blue-600" 
                />
                <span className="ml-2 text-sm text-gray-700">多个候选供应商（竞争性采购）</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="radio" 
                  checked={supplierType === 'single'} 
                  disabled
                  className="w-4 h-4 text-blue-600" 
                />
                <span className="ml-2 text-sm text-gray-700">单一来源供应商</span>
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">已选供应商</label>
            <div className="space-y-3">
              {suppliers.filter(s => selectedSupplierIds.includes(s.supplierId)).map(supplier => (
                  <div key={supplier.supplierId} className="border border-blue-400 bg-blue-50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start flex-1">
                        <div className="ml-3 flex-1">
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
                              <LinkIcon className="w-4 h-4 text-gray-400 mr-1" />
                              <span>邮箱：{supplier.email || '-'}</span>
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
                              {(supplier.tags || '').split(',').filter(t => t.trim()).map((tag, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{tag}</span>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
              ))}
            </div>
          </div>

          {supplierType === 'single' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">单一来源采购说明</label>
              <textarea 
                rows={4} 
                value={singleSourceReason}
                disabled
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-600"></textarea>
              <AttachmentList 
                files={procurementRequest?.singleSourceAttachments || []}
                title="单一来源证明材料"
                onPreview={handlePreview}
                onDownload={handleDownload}
              />
            </div>
          )}
        </div>

        {/* Approval Flow */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <RouteIcon className="text-blue-600 w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">审批流程</h2>
          </div>
          
          <div className="relative pl-4">
              <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-gray-200"></div>
              
              <div className="space-y-8">
                  {processTasks.length > 0 ? processTasks.map((task) => (
                      <div key={task.taskId} className="flex items-start relative">
                          <div className={`z-10 flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow-sm ${
                              task.status === 'APPROVED' ? 'bg-green-100' : 
                              task.status === 'REJECTED' ? 'bg-red-100' : 'bg-gray-100'
                          }`}>
                              {task.status === 'APPROVED' ? <Check className="text-green-600 w-5 h-5" /> : 
                               task.status === 'REJECTED' ? <X className="text-red-600 w-5 h-5" /> :
                               <UserCheck className="text-gray-400 w-5 h-5" />}
                          </div>
                          <div className="ml-4 flex-1">
                              <div className="flex items-center justify-between">
                                  <h3 className="text-sm font-semibold text-gray-800">{task.nodeName}</h3>
                                  {task.handleTime && <span className="text-xs text-gray-500">{new Date(task.handleTime).toLocaleString()}</span>}
                              </div>
                              <div className="flex items-center mt-1">
                                <span className="text-sm text-gray-600 mr-2">审批人：{task.approverName}</span>
                                <span className={`px-2 py-0.5 text-xs rounded border ${
                                    task.status === 'APPROVED' ? 'bg-green-50 text-green-600 border-green-100' : 
                                    task.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-100' : 
                                    task.status === 'PENDING' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-gray-50 text-gray-500 border-gray-200'
                                }`}>
                                    {task.status === 'APPROVED' ? '已通过' : 
                                     task.status === 'REJECTED' ? '已驳回' : 
                                     task.status === 'PENDING' ? '审批中' : '待审批'}
                                </span>
                              </div>
                              {task.comment && (
                                  <p className="text-xs text-gray-500 mt-1 bg-gray-50 p-2 rounded">
                                      意见：{task.comment}
                                  </p>
                              )}
                          </div>
                      </div>
                  )) : (
                      <div className="text-center text-gray-500 py-4">暂无流程信息</div>
                  )}
              </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button onClick={() => navigate('/')} className="px-6 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 font-medium flex items-center">
            <ArrowLeft className="mr-2 w-4 h-4" />返回
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProcurementDetail;
