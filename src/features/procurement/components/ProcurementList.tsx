import React, { useEffect, useState } from 'react';
import { 
  FileText, Clock, Check, X, Search, 
  Hash, Calendar, Building, DollarSign, 
  Eye, Route as RouteIcon, Pen, Trash, 
  ListCheck, Clock as ClockIcon, RotateCcw,
  ChevronLeft, ChevronRight, Undo, AlertTriangle, CheckCircle, XCircle
} from 'lucide-react';
import { getProcurementList, getProcurementStats, ProcurementRequest, ProcurementStats } from '../../../api/procurement';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';

const ProcurementList: React.FC = () => {
  useDocumentTitle('采购列表');
  const navigate = useNavigate();
  const [procurementList, setProcurementList] = useState<ProcurementRequest[]>([]);
  const [stats, setStats] = useState<ProcurementStats>({ total: 0, approving: 0, approved: 0, rejected: 0 });
  const [filters, setFilters] = useState({
    status: '',
    procurementType: '',
    urgencyLevel: '',
    startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    keyword: ''
  });

  const fetchData = async (queryFilters?: any) => {
    try {
      const [listData, statsData] = await Promise.all([
        getProcurementList(queryFilters || {}),
        getProcurementStats(queryFilters || {})
      ]);
      
      if (Array.isArray(listData)) {
        setProcurementList(listData);
      } else {
        console.error("Received invalid data format:", listData);
        setProcurementList([]);
      }
      
      if (statsData) {
        setStats(statsData);
      }
    } catch (error) {
      console.error("Failed to fetch procurement data", error);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [filters.status, filters.procurementType, filters.urgencyLevel, filters.startDate, filters.endDate]);

  const handleSearch = () => {
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => {
        if (typeof v === 'string') {
          return v.trim() !== '' && v !== '全部状态' && v !== '全部类型' && v !== '全部';
        }
        return v !== null && v !== undefined;
      })
    );
    
    const apiFilters: any = { ...activeFilters };
    if (apiFilters.keyword) {
      apiFilters.keyword = apiFilters.keyword.trim();
    }
    if (apiFilters.status === '草稿') apiFilters.status = 'DRAFT';
    if (apiFilters.status === '审批中') apiFilters.status = 'APPROVING';
    if (apiFilters.status === '已通过') apiFilters.status = 'APPROVED';
    if (apiFilters.status === '已驳回') apiFilters.status = 'REJECTED';
    
    // Procurement Type stored as Chinese string in DB, so no conversion needed
    if (apiFilters.procurementType === '固定资产采购') apiFilters.procurementType = 'FIXED_ASSET';
    if (apiFilters.procurementType === '办公用品采购') apiFilters.procurementType = 'OFFICE_SUPPLY';
    if (apiFilters.procurementType === '服务采购') apiFilters.procurementType = 'SERVICE';
    if (apiFilters.procurementType === '工程采购') apiFilters.procurementType = 'ENGINEERING';
    
    if (apiFilters.urgencyLevel === '紧急') apiFilters.urgencyLevel = 'URGENT';
    if (apiFilters.urgencyLevel === '中等') apiFilters.urgencyLevel = 'NORMAL';
    if (apiFilters.urgencyLevel === '一般') apiFilters.urgencyLevel = 'LOW';

    fetchData(apiFilters);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'APPROVING': return <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded">审批中</span>;
      case 'APPROVED': return <span className="px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded">已通过</span>;
      case 'REJECTED': return <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded">已驳回</span>;
      case 'DRAFT': return <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">草稿</span>;
      default: return null;
    }
  };

  const getProcurementTypeBadge = (type: string) => {
    switch(type) {
      case 'FIXED_ASSET': return '固定资产采购';
      case 'OFFICE_SUPPLY': return '办公用品采购';
      case 'SERVICE': return '服务采购';
      case 'ENGINEERING': return '工程采购';
      default: return type;
    }
  };

  return (
    <div className="p-8">
      <div id="page-header" className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-1">我的申请</h1>
            <p className="text-sm text-gray-500">管理和跟踪您的所有采购申请</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 font-medium flex items-center">
              <span className="mr-2">📥</span> 导出列表
            </button>
            <button onClick={() => navigate('/create')} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 font-medium shadow-sm flex items-center">
              <span className="mr-2">➕</span> 新建申请
            </button>
          </div>
        </div>

        <div id="stats-cards" className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase">全部申请</span>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="text-blue-600 w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats?.total || 0}</p>
            <p className="text-xs text-gray-500 mt-1">本月新增 {stats?.total || 0} 个</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase">审批中</span>
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="text-orange-600 w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-orange-600">{stats?.approving || 0}</p>
            <p className="text-xs text-gray-500 mt-1">平均耗时 2.3 天</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase">已通过</span>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Check className="text-green-600 w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats?.approved || 0}</p>
            <p className="text-xs text-gray-500 mt-1">通过率 87.5%</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase">已驳回</span>
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <X className="text-red-600 w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-red-600">{stats?.rejected || 0}</p>
            <p className="text-xs text-gray-500 mt-1">需要重新提交</p>
          </div>
        </div>

        <div id="filter-section" className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-end space-x-4">
            <div className="flex-1 grid grid-cols-6 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">申请状态</label>
                <select 
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">全部状态</option>
                  <option value="草稿">草稿</option>
                  <option value="审批中">审批中</option>
                  <option value="已通过">已通过</option>
                  <option value="已驳回">已驳回</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">采购类型</label>
                <select 
                  value={filters.procurementType}
                  onChange={(e) => setFilters({...filters, procurementType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">全部类型</option>
                  <option value="固定资产采购">固定资产采购</option>
                  <option value="办公用品采购">办公用品采购</option>
                  <option value="服务采购">服务采购</option>
                  <option value="工程采购">工程采购</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">紧急程度</label>
                <select 
                  value={filters.urgencyLevel}
                  onChange={(e) => setFilters({...filters, urgencyLevel: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">全部</option>
                  <option value="紧急">紧急</option>
                  <option value="中等">中等</option>
                  <option value="一般">一般</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">申请日期</label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="date" 
                    value={filters.startDate}
                    onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  />
                  <span className="text-gray-500">-</span>
                  <input 
                    type="date" 
                    value={filters.endDate}
                    onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">搜索</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={filters.keyword}
                    onChange={(e) => setFilters({...filters, keyword: e.target.value})}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="标题、背景、单号..." 
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>
            </div>
            <button 
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              查询
            </button>
          </div>
        </div>
      </div>

      <div id="applications-list" className="space-y-4">
        {procurementList.map((item, index) => (
          <div key={item.procurementRequestId || index} className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-base font-semibold text-gray-800">{item.title || '无标题申请'}</h3>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                    <span className="flex items-center"><Hash className="w-3 h-3 mr-1" />{item.requestCode}</span>
                    <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" />{item.createTime?.substring(0, 10)}</span>
                    <span className="flex items-center"><Building className="w-3 h-3 mr-1" />{item.department}</span>
                    <span className="flex items-center"><DollarSign className="w-3 h-3 mr-1" />¥{item.amount.toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.backgroundDesc || '无描述'}</p>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{getProcurementTypeBadge(item.procurementType)}</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded">{item.supplierCount || 0}个候选供应商</span>
                    {item.preApplicationId && <span className="px-2 py-0.5 bg-purple-100 text-purple-600 text-xs rounded">关联事前申请</span>}
                    {getStatusBadge(item.status)}
                  </div>
                </div>
                <div className="ml-6 flex flex-col items-end justify-end">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => navigate(`/detail/${item.procurementRequestId}`)}
                      className="px-3 py-1.5 text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 font-medium flex items-center"
                    >
                      <Eye className="w-3 h-3 mr-1" />查看详情
                    </button>
                    {item.status === 'APPROVING' && (
                      <button 
                        onClick={() => navigate(`/approval/${item.procurementRequestId}`)}
                        className="px-3 py-1.5 text-xs text-purple-600 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 font-medium flex items-center"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />审批
                      </button>
                    )}
                    {item.status === 'DRAFT' || item.status === 'REJECTED' ? (
                      <button 
                        onClick={() => navigate(`/create?id=${item.procurementRequestId}`)}
                        className="px-3 py-1.5 text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded-md hover:bg-orange-100 font-medium flex items-center"
                      >
                        <Undo className="w-3 h-3 mr-1" />{item.status === 'DRAFT' ? '继续编辑' : '重新提交'}
                      </button>
                    ) : (item.status === 'APPROVED' || item.status === 'REVIEW_PASSED') ? (
                      <button 
                        onClick={() => navigate(`/procurement/process/${item.procurementRequestId}`)}
                        className="px-3 py-1.5 text-xs text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 font-medium flex items-center"
                      >
                        <RouteIcon className="w-3 h-3 mr-1" />查看流程
                      </button>
                    ) : (
                      <button 
                        disabled
                        className="px-3 py-1.5 text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-md font-medium flex items-center cursor-not-allowed"
                      >
                        <RouteIcon className="w-3 h-3 mr-1" />查看流程
                      </button>
                    )}
                    {item.status === 'DRAFT' && (
                      <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md">
                        <Trash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6 text-xs">
                    <div className="flex items-center text-gray-600">
                      {item.status === 'REJECTED' ? <XCircle className="w-3 h-3 mr-1.5 text-red-600" /> : <CheckCircle className="w-3 h-3 mr-1.5 text-green-600" />}
                      <span>{item.approvalStage || '审批流程中'}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <ListCheck className="w-3 h-3 mr-1.5 text-gray-400" />
                      <span>审批进度：{item.approvalCurrentStep || 0}/{item.approvalTotalSteps || 1}</span>
                    </div>
                    {item.rejectionReason && (
                      <div className="flex items-center text-red-600">
                        <AlertTriangle className="w-3 h-3 mr-1.5" />
                        <span>{item.rejectionReason}</span>
                      </div>
                    )}
                    <div className="flex items-center text-gray-600">
                      <RotateCcw className="w-3 h-3 mr-1.5 text-gray-400" />
                      <span>最后更新：{item.lastUpdateTime?.substring(0, 16) || item.createTime?.substring(0, 16)}</span>
                    </div>
                  </div>
                  <div className="w-48 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${item.status === 'REJECTED' ? 'bg-red-500' : item.status === 'APPROVED' ? 'bg-green-500' : 'bg-orange-500'}`} 
                      style={{ width: `${item.approvalProgress || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div id="pagination" className="mt-8 flex items-center justify-between flex-wrap gap-4">
        <div className="text-sm text-gray-600 whitespace-nowrap">
          显示 <span className="font-medium">1-{procurementList.length}</span> 条，共 <span className="font-medium">{procurementList.length}</span> 条记录
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors" disabled>
            <ChevronLeft className="w-4 h-4 mr-1" />上一页
          </button>
          <button className="px-3 py-2 text-sm text-white bg-blue-600 border border-blue-600 rounded-md shadow-sm">1</button>
          <button className="flex items-center px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm transition-colors">
            下一页<ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProcurementList;
