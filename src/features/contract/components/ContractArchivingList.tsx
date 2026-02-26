import React, { useEffect, useState } from 'react';
import { 
  FileText, Search, Calendar, Building, DollarSign, 
  ChevronLeft, ChevronRight, FileSignature, Upload
} from 'lucide-react';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { 
  getContractArchivingList, 
  saveContractArchiving, 
  getContract,
  ContractArchivingItem, 
  Contract 
} from '../../../api/contract';
import { uploadFile } from '../../../api/common';
import { StandardDatePicker } from '../../../components/common/StandardDatePicker';
import dayjs from 'dayjs';

const ContractArchivingList: React.FC = () => {
  useDocumentTitle('合同归档管理');
  const [list, setList] = useState<ContractArchivingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentContract, setCurrentContract] = useState<Contract | null>(null);
  const [currentItem, setCurrentItem] = useState<ContractArchivingItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getContractArchivingList(keyword);
      setList(data || []);
    } catch (error) {
      console.error("Failed to fetch contract archiving list", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = () => {
    fetchData();
  };

  const handleOpenModal = (item: ContractArchivingItem) => {
    setCurrentItem(item);
    // Initialize form
    setCurrentContract({
      contractId: item.contractId,
      procurementRequestId: item.procurementRequestId,
      contractName: item.contractName || item.procurementTitle + ' - 合同',
      contractCode: item.procurementRequestCode + '-C01', // Default code
      status: item.contractStatus,
      signingDate: item.signingDate || new Date().toISOString(),
      amount: item.amount,
      // Default empty fields for new entry
      signerName: '',
      signerContact: '',
      vendorSignerName: '',
      vendorSignerContact: '',
      attachmentUrl: ''
    });
    
    // If editing existing, we might want to fetch details if not fully in list, 
    // but list DTO seems to have basic info. 
    // Actually, DTO doesn't have signer info. 
    // So if contractId exists, we should probably fetch it, or if backend returns it in DTO (it doesn't currently).
    // I should update DTO or fetch detail. 
    // For now, I'll fetch detail if contractId exists.
    if (item.contractId) {
        // Fetch detail logic here if needed. 
        // Since I didn't export getContract in api/contract.ts properly or implemented it fully in service to return all fields in DTO.
        // Let's rely on what we have or add a fetch.
        // I added getContract in api/contract.ts.
        getContract(item.contractId!).then(res => {
            if(res) {
                setCurrentContract(res);
            }
        });
    }
    
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentContract(null);
    setCurrentItem(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentContract) return;

    setSaving(true);
    try {
      await saveContractArchiving(currentContract);
      setIsModalOpen(false);
      fetchData(); // Refresh list
    } catch (error) {
      console.error("Failed to save contract", error);
      alert("保存失败");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof Contract, value: any) => {
    if (!currentContract) return;
    setCurrentContract({ ...currentContract, [field]: value });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentContract) return;

    setUploading(true);
    try {
      const url = await uploadFile(file);
      setCurrentContract({ ...currentContract, attachmentUrl: url });
    } catch (error) {
      console.error("File upload failed", error);
      alert("文件上传失败，请重试");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-1">合同归档管理</h1>
        <p className="text-sm text-gray-500">管理采购项目的合同录入与归档</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6 flex justify-between items-center">
        <div className="relative w-96">
          <input 
            type="text" 
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="搜索采购单号、标题..." 
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        </div>
        <button 
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
        >
          查询
        </button>
      </div>

      {/* List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">采购申请</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金额</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">申请人/部门</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">评标状态</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">合同状态</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {list.map((item) => (
              <tr key={item.procurementRequestId} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{item.procurementTitle}</div>
                  <div className="text-xs text-gray-500">{item.procurementRequestCode}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <DollarSign className="w-3 h-3 mr-1 text-gray-400" />
                    {item.amount?.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.applicantName}</div>
                  <div className="text-xs text-gray-500 flex items-center">
                    <Building className="w-3 h-3 mr-1" />{item.department}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.evaluationCompleted ? (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      评标完成
                    </span>
                  ) : (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      进行中/未开始
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.contractStatus === 'ENTERED' ? (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      已录入
                    </span>
                  ) : (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      待录入
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {item.evaluationCompleted ? (
                    <button 
                      onClick={() => handleOpenModal(item)}
                      className="text-blue-600 hover:text-blue-900 flex items-center justify-end ml-auto"
                    >
                      <FileSignature className="w-4 h-4 mr-1" />
                      {item.contractStatus === 'ENTERED' ? '编辑合同' : '录入签署合同'}
                    </button>
                  ) : (
                    <span className="text-gray-400 cursor-not-allowed flex items-center justify-end ml-auto">
                      <FileSignature className="w-4 h-4 mr-1" />
                      录入签署合同
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {list.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  暂无数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && currentContract && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={handleCloseModal}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FileSignature className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      {currentContract.status === 'ENTERED' ? '编辑合同信息' : '录入签署合同'}
                    </h3>
                    <div className="mt-4">
                      <form id="contractForm" onSubmit={handleSave} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">合同名称</label>
                            <input
                              type="text"
                              required
                              value={currentContract.contractName || ''}
                              onChange={(e) => handleInputChange('contractName', e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">合同编号</label>
                            <input
                              type="text"
                              value={currentContract.contractCode || ''}
                              onChange={(e) => handleInputChange('contractCode', e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">签署时间</label>
                            <StandardDatePicker
                              value={currentContract.signingDate ? dayjs(currentContract.signingDate) : null}
                              onChange={(date: any) => handleInputChange('signingDate', date?.toISOString())}
                              className="w-full"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">甲方签署人</label>
                            <input
                              type="text"
                              value={currentContract.signerName || ''}
                              onChange={(e) => handleInputChange('signerName', e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">甲方联系方式</label>
                            <input
                              type="text"
                              value={currentContract.signerContact || ''}
                              onChange={(e) => handleInputChange('signerContact', e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">乙方(厂商)签署人</label>
                            <input
                              type="text"
                              value={currentContract.vendorSignerName || ''}
                              onChange={(e) => handleInputChange('vendorSignerName', e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">乙方联系方式</label>
                            <input
                              type="text"
                              value={currentContract.vendorSignerContact || ''}
                              onChange={(e) => handleInputChange('vendorSignerContact', e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>

                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">合同附件 (影音件)</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md relative">
                              {uploading && (
                                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                                  <div className="text-blue-600 font-medium">上传中...</div>
                                </div>
                              )}
                              <div className="space-y-1 text-center">
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600">
                                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                    <span>上传文件</span>
                                    <input 
                                      id="file-upload" 
                                      name="file-upload" 
                                      type="file" 
                                      className="sr-only" 
                                      onChange={handleFileUpload}
                                      accept=".pdf,.png,.jpg,.jpeg,.mp4"
                                    />
                                  </label>
                                  <p className="pl-1">或拖拽文件到此处</p>
                                </div>
                                <p className="text-xs text-gray-500">支持 PDF, PNG, JPG, MP4</p>
                              </div>
                            </div>
                            {currentContract.attachmentUrl && (
                                <div className="mt-2 flex items-center text-sm text-green-600">
                                  <FileText className="w-4 h-4 mr-1" />
                                  <span>已上传: {currentContract.attachmentUrl}</span>
                                  <a 
                                    href={currentContract.attachmentUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="ml-2 text-blue-600 hover:underline text-xs"
                                  >
                                    查看
                                  </a>
                                </div>
                            )}
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {saving ? '保存中...' : '保存'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractArchivingList;
