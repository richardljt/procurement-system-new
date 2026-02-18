import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { 
  ArrowLeft, RefreshCw, Download, Bell, AlertTriangle, 
  CheckCircle, Clock, FileText, User, Search, Filter,
  ChevronRight, StopCircle, MoreHorizontal
} from 'lucide-react';
import { 
  getBidMonitoring, 
  refreshBidMonitoring, 
  terminateBid, 
  remindSuppliers, 
  exportBidMonitoring 
} from '../../api/bid';
import { BidMonitoring as BidMonitoringType } from '../../types/bid';

const BidMonitoringPage: React.FC = () => {
  useDocumentTitle('投标监控');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [data, setData] = useState<BidMonitoringType | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);
  const [terminateReason, setTerminateReason] = useState('');
  
  // Fetch Data
  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await getBidMonitoring(id);
      setData(res);
    } catch (error) {
      console.error("Failed to load bid monitoring data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // Auto Refresh
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh && id) {
      interval = setInterval(async () => {
        try {
            const res = await refreshBidMonitoring(id);
            setData(res);
        } catch (e) {
            console.error("Auto refresh failed", e);
        }
      }, 30000); // 30s
    }
    return () => clearInterval(interval);
  }, [autoRefresh, id]);

  const handleRefresh = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await refreshBidMonitoring(id);
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  const handleTerminate = async () => {
    if (!id || !terminateReason.trim()) return;
    try {
      await terminateBid(id, terminateReason);
      setIsTerminateModalOpen(false);
      loadData();
      alert("投标已终止");
    } catch (error) {
      console.error("Terminate failed", error);
      alert("终止失败");
    }
  };

  const handleExport = async () => {
    if (!id) return;
    try {
      const blob = await exportBidMonitoring(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bid-monitoring-${id}.xlsx`;
      a.click();
    } catch (error) {
      console.error("Export failed", error);
    }
  };

  const handleRemindAll = async () => {
    if (!id) return;
    try {
      await remindSuppliers(id);
      alert("已发送提醒");
    } catch (error) {
      console.error("Remind failed", error);
    }
  };

  if (loading && !data) {
    return <div className="p-8 text-center text-gray-500">加载中...</div>;
  }

  if (!data) {
    return <div className="p-8 text-center text-gray-500">未找到相关数据</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Breadcrumb */}
      <div className="bg-white px-6 py-3 border-b border-gray-200 flex items-center text-sm text-gray-500">
        <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/bid/list')}>投标管理</span>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-gray-900 font-medium">投标监控 - {data.bidId}</span>
      </div>

      <div className="flex-1 p-6 space-y-6">
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl text-white shadow-lg p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-1/3 -translate-y-1/3"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center space-x-3">
                <span className="bg-white/20 px-2 py-1 rounded text-xs font-medium backdrop-blur-sm">
                  {data.bidId}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium backdrop-blur-sm ${
                  data.status === 'ongoing' ? 'bg-green-500/20 text-green-100' : 'bg-gray-500/20'
                }`}>
                  {data.status === 'ongoing' ? '进行中' : data.status}
                </span>
                {data.status === 'ongoing' && (
                  <span className="flex items-center bg-orange-500/20 text-orange-100 px-2 py-1 rounded text-xs font-medium backdrop-blur-sm">
                    <Clock className="w-3 h-3 mr-1" />
                    剩余 {data.countdown}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">{data.title}</h1>
                <p className="text-blue-100 text-sm line-clamp-1 opacity-90">
                  {/* Assuming description is not in monitoring DTO yet, but per prototype usually is */}
                  {/* {data.description} */}
                  年度核心供应商招标项目，旨在筛选优质合作伙伴...
                </p>
              </div>
            </div>

            <div className="mt-6 md:mt-0 flex flex-col items-end">
              <div className="text-right">
                <div className="text-sm text-blue-200 mb-1">距离截标还剩</div>
                <div className="text-4xl font-mono font-bold tracking-wider">
                  {data.countdown}
                </div>
                <div className="text-xs text-blue-200 mt-1">
                  截止时间: {new Date(data.deadline).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-5 gap-4 mt-8 pt-6 border-t border-white/10">
            {[
              { label: '邀请供应商', value: data.stats.invited },
              { label: '已提交', value: data.stats.submitted },
              { label: '进行中', value: data.stats.inProgress },
              { label: '未提交', value: data.stats.notSubmitted },
              { label: '提交完成率', value: data.stats.completionRate }
            ].map((stat, i) => (
              <div key={i} className="text-center md:text-left">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-blue-200 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <button onClick={handleRefresh} className="flex items-center px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-700 transition-colors">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              实时刷新
            </button>
            <button onClick={handleExport} className="flex items-center px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-700 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              导出数据
            </button>
            <button onClick={handleRemindAll} className="flex items-center px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-700 transition-colors">
              <Bell className="w-4 h-4 mr-2" />
              批量提醒
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">自动刷新</span>
              <button 
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoRefresh ? 'bg-blue-600' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoRefresh ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="h-6 w-px bg-gray-200 mx-2"></div>
            <button 
              onClick={() => setIsTerminateModalOpen(true)}
              className="flex items-center px-3 py-2 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 text-sm font-medium text-red-600 transition-colors"
            >
              <StopCircle className="w-4 h-4 mr-2" />
              终止投标
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Suppliers Table */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">供应商投标状态</h3>
                <p className="text-xs text-gray-500 mt-1">实时监控各供应商的应答进度</p>
              </div>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input type="text" placeholder="搜索供应商..." className="pl-9 pr-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <button className="p-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-600">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">供应商信息</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">提交状态</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">完成度</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商务/价格</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">提交时间</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.suppliers.map((supplier, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold mr-3">
                            {supplier.name.substring(0, 1)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                            <div className="text-xs text-gray-500">{supplier.contact}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          supplier.status === 'Submitted' ? 'bg-green-100 text-green-800' : 
                          supplier.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {supplier.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-middle">
                        <div className="w-full max-w-[100px]">
                          <div className="flex justify-between text-xs mb-1">
                            <span>{supplier.completion}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${supplier.completion}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                         <div className="flex space-x-2">
                           <span className={`w-2 h-2 rounded-full ${supplier.businessPart === 'uploaded' ? 'bg-green-500' : 'bg-gray-300'}`} title="商务部分"></span>
                           <span className={`w-2 h-2 rounded-full ${supplier.pricePart === 'uploaded' ? 'bg-green-500' : 'bg-gray-300'}`} title="价格部分"></span>
                         </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {supplier.submitTime || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">详情</button>
                        {supplier.status !== 'Submitted' && (
                          <button className="text-orange-600 hover:text-orange-900">提醒</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination Placeholder */}
            <div className="p-4 border-t border-gray-200 flex justify-center">
                <div className="text-sm text-gray-500">分页控件占位</div>
            </div>
          </div>

          {/* Right: Activity Logs */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col h-[600px]">
             <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">实时活动日志</h3>
                <p className="text-xs text-gray-500 mt-1">所有关键操作记录</p>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {data.logs.map((log, idx) => (
                  <div key={idx} className="flex space-x-3">
                    <div className="flex-shrink-0 mt-1">
                       <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                         {log.type === 'submit' ? <CheckCircle className="w-4 h-4 text-green-500" /> : 
                          log.type === 'warn' ? <AlertTriangle className="w-4 h-4 text-orange-500" /> :
                          <FileText className="w-4 h-4 text-blue-500" />}
                       </div>
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg p-3 text-sm">
                       <div className="flex justify-between items-start mb-1">
                         <span className="font-medium text-gray-900">{log.title}</span>
                         <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{new Date(log.time).toLocaleTimeString()}</span>
                       </div>
                       <p className="text-gray-600 mb-2">{log.description}</p>
                       <div className="flex items-center text-xs text-gray-500">
                         <User className="w-3 h-3 mr-1" />
                         {log.user}
                       </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* Terminate Modal */}
      {isTerminateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mb-4 mx-auto">
                <StopCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-center text-gray-900 mb-2">终止投标</h3>
              <p className="text-sm text-center text-gray-500 mb-6">
                您确定要提前终止本次投标吗？此操作不可撤销，且会通知所有参与供应商。
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">终止原因 <span className="text-red-500">*</span></label>
                <textarea
                  value={terminateReason}
                  onChange={(e) => setTerminateReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 min-h-[100px]"
                  placeholder="请输入详细的终止原因..."
                />
              </div>
              
              <div className="bg-red-50 p-3 rounded-md mb-6">
                <h4 className="text-xs font-semibold text-red-800 mb-1">警告：</h4>
                <ul className="list-disc list-inside text-xs text-red-700 space-y-1">
                  <li>所有未提交的投标将被取消</li>
                  <li>已提交的数据将被归档</li>
                  <li>将发送通知邮件给所有受邀供应商</li>
                </ul>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setIsTerminateModalOpen(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleTerminate}
                  disabled={!terminateReason.trim()}
                  className={`flex-1 py-2 rounded-md text-white font-medium ${
                    terminateReason.trim() ? 'bg-red-600 hover:bg-red-700' : 'bg-red-300 cursor-not-allowed'
                  }`}
                >
                  确认终止
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BidMonitoringPage;
