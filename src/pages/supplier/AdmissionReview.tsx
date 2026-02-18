import React, { useState, useEffect } from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Search, Filter, Clock, CheckCircle, XCircle, FileText, ChevronRight, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSupplierReviews, Supplier, approveSupplier, rejectSupplier } from '../../api/procurement';

const AdmissionReview: React.FC = () => {
  useDocumentTitle('入库审核 - 供应商管理');
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'PENDING' | 'PROCESSED'>('PENDING');
  const [reviews, setReviews] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await getSupplierReviews(activeTab);
      setReviews(data || []);
    } catch (error) {
      console.error("Failed to fetch reviews", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [activeTab]);

  const handleApprove = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (window.confirm('确认通过该供应商的入库申请吗？')) {
      setProcessingId(id);
      try {
        await approveSupplier(id);
        fetchReviews(); // Refresh list
      } catch (error) {
        console.error("Failed to approve", error);
        alert("操作失败");
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleReject = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (window.confirm('确认驳回该供应商的入库申请吗？')) {
      setProcessingId(id);
      try {
        await rejectSupplier(id);
        fetchReviews(); // Refresh list
      } catch (error) {
        console.error("Failed to reject", error);
        alert("操作失败");
      } finally {
        setProcessingId(null);
      }
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            待审批
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            已通过
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            已驳回
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">入库审核</h1>
          <p className="text-gray-500 mt-1">审核供应商入库申请</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('PENDING')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'PENDING'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              待处理
            </button>
            <button
              onClick={() => setActiveTab('PROCESSED')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'PROCESSED'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              已完成
            </button>
          </nav>
        </div>

        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex space-x-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="搜索申请单号/供应商名称" 
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
            <button className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-50 flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              筛选
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-gray-500">加载中...</div>
        ) : reviews.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {reviews.map((review) => (
              <div 
                key={review.supplierId} 
                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => navigate(`/supplier/admission/detail/${review.supplierId}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-medium text-gray-900 mr-3">{review.supplierName}</h3>
                      {getStatusBadge(review.status)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500 mt-3">
                      <div>
                        <span className="text-gray-400 block text-xs mb-1">申请单号</span>
                        {review.applicationNo}
                      </div>
                      <div>
                        <span className="text-gray-400 block text-xs mb-1">地区</span>
                        {review.region === 'HK' ? '香港' : '内地'}
                      </div>
                      <div>
                        <span className="text-gray-400 block text-xs mb-1">联系人</span>
                        {review.contactName}
                      </div>
                      <div>
                        <span className="text-gray-400 block text-xs mb-1">申请时间</span>
                        {review.createTime?.substring(0, 10)}
                      </div>
                    </div>
                  </div>
                  
                  {activeTab === 'PENDING' && (
                    <div className="flex items-center space-x-3 ml-6">
                      <button
                        onClick={(e) => review.supplierId && handleReject(e, review.supplierId)}
                        disabled={processingId === review.supplierId}
                        className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        驳回
                      </button>
                      <button
                        onClick={(e) => review.supplierId && handleApprove(e, review.supplierId)}
                        disabled={processingId === review.supplierId}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
                      >
                        通过
                      </button>
                    </div>
                  )}
                  
                  {activeTab === 'PROCESSED' && (
                    <div className="flex items-center text-gray-400">
                      <span className="text-sm mr-2">查看详情</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-900">暂无审核任务</p>
            <p className="text-sm text-gray-500 mt-1">当前没有需要处理的入库申请</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdmissionReview;
