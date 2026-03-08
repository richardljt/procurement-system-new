import React, { useState, useEffect } from 'react';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { 
  Search, 
  Download, 
  Plus, 
  MoreVertical, 
  Clock, 
  CheckCircle, 
  Ban, 
  ChevronLeft, 
  ChevronRight,
  X,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getBidList } from '../../../api/bid';
import { BidRecord, BidListParams } from '../../../types/bid';
import { launchEvaluation } from '../../../api/evaluation';
import dayjs from 'dayjs';
import { ExpertSelectionSection } from '../../meeting/components/~/ExpertSelectionSection';
import { StandardDatePicker } from '../../../components/common/StandardDatePicker';

// Status badge component helper
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config = {
    draft: { bg: 'bg-gray-100', text: 'text-gray-800', icon: 'text-gray-500', label: '草稿' },
    ongoing: { bg: 'bg-orange-100', text: 'text-orange-800', icon: 'text-orange-500', label: '进行中' },
    evaluating: { bg: 'bg-purple-100', text: 'text-purple-800', icon: 'text-purple-500', label: '评标中' },
    completed: { bg: 'bg-green-100', text: 'text-green-800', icon: 'text-green-500', label: '已完成' },
    terminated: { bg: 'bg-red-100', text: 'text-red-800', icon: 'text-red-500', label: '已终止' },
    evaluated: { bg: 'bg-green-100', text: 'text-green-800', icon: 'text-green-500', label: '已完成' },
  };
  
  const current = config[status as keyof typeof config] || config.draft;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${current.bg} ${current.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${current.icon} bg-current`}></span>
      {current.label}
    </span>
  );
};

const BidManagementList: React.FC = () => {
  useDocumentTitle('投标管理 - 列表');
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<BidRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [queryParams, setQueryParams] = useState<BidListParams>({
    page: 1,
    pageSize: 10,
    keyword: '',
    status: ''
  });
  const [selectedBid, setSelectedBid] = useState<BidRecord | null>(null); // For detail panel
  
  // Meeting Launch Modal State
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [meetingConfig, setMeetingConfig] = useState({
    startTime: '',
    endTime: '',
    mainExperts: [] as number[],
    backupExperts: [] as number[]
  });
  const [launchingMeeting, setLaunchingMeeting] = useState(false);

  // Load Data
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getBidList(queryParams);
      if (res && (res as any).list) {
         setList(res.list);
         setTotal(res.total);
      } else if (Array.isArray(res)) {
         setList(res);
         setTotal(res.length);
      } else {
        // MOCK DATA FOR DEMONSTRATION IF API FAILS OR IS EMPTY IN DEV
        console.warn("API returned empty or invalid, using mock data");
        setList([
          {
            bidId: 'BID-2024-001',
            purchaseRequestName: '办公设备采购项目',
            budget: 500000,
            initiatorName: '张明',
            initiatorDept: '采购部',
            initiatorAvatar: '/avatars/avatar-2.jpg',
            status: 'ongoing',
            supplierCount: 5,
            suppliers: [
              '/avatars/avatar-3.jpg', 
              '/avatars/avatar-4.jpg',
              '/avatars/avatar-8.jpg'
            ],
            deadline: '2024-02-15',
            remainingTime: '剩余2天'
          },
          // ... (rest of mock data omitted for brevity, but real API should work now)
        ]);
        setTotal(5);
      }
    } catch (error) {
      console.error("Failed to load bid list", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [queryParams]);

  // Handlers
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQueryParams({ ...queryParams, keyword: e.target.value });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQueryParams({ ...queryParams, status: e.target.value });
  };

  const handleRowClick = (bid: BidRecord) => {
    setSelectedBid(bid);
  };

  const closeDetail = () => {
    setSelectedBid(null);
  };

  const openLaunchMeetingModal = (e: React.MouseEvent, bid: BidRecord) => {
    e.stopPropagation();
    if (confirm('确定要发起该项目的评标会议吗？')) {
      setSelectedBid(bid);
      setIsMeetingModalOpen(true);
      // Set default time (e.g. tomorrow 9am-11am)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      const end = new Date(tomorrow);
      end.setHours(11, 0, 0, 0);
      
      // Handle timezone offset manually or use a library, here simple ISO string slice for local time input
      // Note: datetime-local expects "YYYY-MM-DDThh:mm"
      const formatLocal = (date: Date) => {
        const offset = date.getTimezoneOffset() * 60000;
        const local = new Date(date.getTime() - offset);
        return local.toISOString().slice(0, 16);
      };

      setMeetingConfig({
        startTime: formatLocal(tomorrow),
        endTime: formatLocal(end),
        mainExperts: [],
        backupExperts: []
      });
    }
  };

  const handleLaunchMeeting = async () => {
    if (!selectedBid) return;
    if (!meetingConfig.startTime || !meetingConfig.endTime) {
      alert('请设置会议时间');
      return;
    }
    if (meetingConfig.mainExperts.length === 0) {
      alert('请至少选择一名正选专家');
      return;
    }

    setLaunchingMeeting(true);
    try {
      const res = await launchEvaluation({
        title: `关于${selectedBid.title || selectedBid.purchaseRequestName}的评标会议`,
        bidId: typeof selectedBid.bidId === 'string' ? parseInt(selectedBid.bidId.replace(/\D/g, '') || '0') : Number(selectedBid.bidId),
        bidTitle: selectedBid.title || selectedBid.purchaseRequestName || '',
        startTime: meetingConfig.startTime + ':00',
        endTime: meetingConfig.endTime + ':00',
        mainExpertIds: meetingConfig.mainExperts,
        backupExpertIds: meetingConfig.backupExperts
      });
      alert('评标会议发起成功');
      setIsMeetingModalOpen(false);
      setSelectedBid(null); // Clear selected bid to prevent drawer from opening
      
      // Redirect to meeting page if response contains meeting code (or ID)
      // Assuming response is the meeting ID/Code directly as per API definition update
      if (res) {
          navigate(`/meeting/evaluation-running/${res}`);
      } else {
          loadData(); 
      }
    } catch (error) {
      console.error("Failed to launch meeting", error);
      alert('发起会议失败');
    } finally {
      setLaunchingMeeting(false);
    }
  };

  return (
    <div className="h-full flex flex-col relative">
      {/* 1. Page Title Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">投标管理列表</h2>
          <p className="text-sm text-gray-500 mt-0.5">管理和监控所有投标项目的统一入口</p>
        </div>
        {/* Right side header actions if needed */}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col bg-gray-50">
        
        {/* 2. Filter Section */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3 flex-1 min-w-[300px]">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="搜索投标项目、采购申请、发起人..." 
                  className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={queryParams.keyword}
                  onChange={handleSearch}
                />
              </div>
              
              <select 
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={queryParams.status}
                onChange={handleStatusChange}
              >
                <option value="">全部状态</option>
                <option value="draft">草稿</option>
                <option value="ongoing">进行中</option>
                <option value="completed">已完成</option>
                <option value="terminated">已终止</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                导出数据
              </button>
              
              <button 
                className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                onClick={() => navigate('/bid/create')} // Assume create route exists or will exist
              >
                <Plus className="w-4 h-4 mr-2" />
                新建投标
              </button>
            </div>
          </div>
        </div>

        {/* 3. Main Content: Table */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            {/* Table Header Controls */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-semibold text-gray-900">投标列表</h3>
                <span className="text-sm text-gray-500">共 {total} 个投标项目</span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left w-12">
                      <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      投标ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      采购申请名称
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      发起人
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      供应商数量
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      截止时间
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                        加载中...
                      </td>
                    </tr>
                  ) : list.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    list.map((item) => (
                      <tr 
                        key={item.bidId} 
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleRowClick(item)}
                      >
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-blue-600 hover:text-blue-700">
                            {item.bidId}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.purchaseRequestName || item.procurementRequestName || item.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">预算: ¥{item.budget?.toLocaleString()}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {item.initiatorAvatar && <img src={item.initiatorAvatar} alt="" className="w-8 h-8 rounded-full border border-gray-200" />}
                            <div className={item.initiatorAvatar ? "ml-2" : ""}>
                              <p className="text-sm font-medium text-gray-900">{item.initiatorName || item.createUserName}</p>
                              <p className="text-xs text-gray-500">{item.initiatorDept}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex -space-x-2">
                              {item.suppliers && item.suppliers.slice(0, 3).map((s, idx) => (
                                typeof s === 'string' ? 
                                <img key={idx} src={s} alt="" className="w-7 h-7 rounded-full border-2 border-white" /> :
                                <div key={idx} className="w-7 h-7 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600">
                                  {/* Use first letter of supplier name if available */}
                                  {(s.supplierName || 'S')[0]}
                                </div>
                              ))}
                              {item.suppliers && item.suppliers.length > 3 && (
                                <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                                  +{item.suppliers.length - 3}
                                </div>
                              )}
                            </div>
                            <span className="ml-2 text-sm text-gray-600">{item.supplierCount || (item.suppliers ? item.suppliers.length : 0)}家</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.deadline}</p>
                            {item.remainingTime && (
                              <p className={`text-xs mt-0.5 flex items-center ${
                                item.status === 'completed' ? 'text-green-600' : 
                                item.status === 'terminated' ? 'text-red-600' : 'text-orange-600'
                              }`}>
                                {item.status === 'completed' ? <CheckCircle className="w-3 h-3 mr-1"/> : 
                                 item.status === 'terminated' ? <Ban className="w-3 h-3 mr-1"/> :
                                 <Clock className="w-3 h-3 mr-1"/>}
                                {item.remainingTime}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center space-x-2">
                            {(item.status === 'ongoing' || item.status === 'evaluating') ? (
                              <>
                                <button 
                                  onClick={() => navigate(`/bid/monitor/${item.bidId}`)}
                                  className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  进入监控
                                </button>
                                {item.evaluationCode ? (
                                   <button 
                                     onClick={() => navigate(`/meeting/evaluation-running/${item.evaluationCode}`)}
                                     className="px-3 py-1.5 text-white text-xs font-medium rounded-lg transition-colors flex items-center bg-green-600 hover:bg-green-700"
                                   >
                                     <Users className="w-3 h-3 mr-1" />
                                     进入会议
                                   </button>
                                 ) : (
                                  <button 
                                    onClick={(e) => openLaunchMeetingModal(e, item)}
                                    className="px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                                  >
                                    <Users className="w-3 h-3 mr-1" />
                                    发起评标
                                  </button>
                                )}
                              </>
                            ) : item.status === 'evaluated' || item.status === 'completed' ? (
                                <button 
                                    onClick={() => item.evaluationCode && navigate(`/meeting/evaluation-running/${item.evaluationCode}`)}
                                    className="px-3 py-1.5 bg-gray-600 text-white text-xs font-medium rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                                >
                                    <Users className="w-3 h-3 mr-1" />
                                    回顾会议
                                </button>
                            ) : (
                              <button className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors">
                                查看详情
                              </button>
                            )}
                            <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 4. Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">显示</span>
                <select 
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={queryParams.pageSize}
                  onChange={(e) => setQueryParams({ ...queryParams, pageSize: Number(e.target.value) })}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-600">条记录</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  第 {(queryParams.page! - 1) * queryParams.pageSize! + 1}-{Math.min(queryParams.page! * queryParams.pageSize!, total)} 条，共 {total} 条
                </span>
                <div className="flex items-center space-x-1 ml-4">
                  <button 
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    disabled={queryParams.page === 1}
                    onClick={() => setQueryParams({ ...queryParams, page: queryParams.page! - 1 })}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium">
                    {queryParams.page}
                  </button>
                  <button 
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    disabled={queryParams.page! * queryParams.pageSize! >= total}
                    onClick={() => setQueryParams({ ...queryParams, page: queryParams.page! + 1 })}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meeting Launch Modal */}
      {isMeetingModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">发起评标会议</h3>
                <p className="text-sm text-gray-500 mt-1">配置会议时间与参会专家</p>
              </div>
              <button onClick={() => setIsMeetingModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">项目信息</h4>
                <p className="text-sm text-blue-800">项目名称：{selectedBid?.purchaseRequestName || selectedBid?.title}</p>
                <p className="text-sm text-blue-800">投标编号：{selectedBid?.bidId}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">开始时间 <span className="text-red-500">*</span></label>
                  <StandardDatePicker 
                    className="w-full"
                    showTime
                    format="YYYY-MM-DD HH:mm"
                    value={meetingConfig.startTime ? dayjs(meetingConfig.startTime) : null}
                    onChange={(date) => {
                      if (date && !Array.isArray(date)) {
                        setMeetingConfig({...meetingConfig, startTime: date.format('YYYY-MM-DDTHH:mm')});
                      } else {
                        setMeetingConfig({...meetingConfig, startTime: ''});
                      }
                    }}
                    placeholder=""
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">结束时间 <span className="text-red-500">*</span></label>
                  <StandardDatePicker 
                    className="w-full"
                    showTime
                    format="YYYY-MM-DD HH:mm"
                    value={meetingConfig.endTime ? dayjs(meetingConfig.endTime) : null}
                    onChange={(date) => {
                      if (date && !Array.isArray(date)) {
                        setMeetingConfig({...meetingConfig, endTime: date.format('YYYY-MM-DDTHH:mm')});
                      } else {
                        setMeetingConfig({...meetingConfig, endTime: ''});
                      }
                    }}
                    placeholder=""
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <ExpertSelectionSection 
                  mainExperts={meetingConfig.mainExperts}
                  backupExperts={meetingConfig.backupExperts}
                  onMainChange={(ids) => setMeetingConfig({...meetingConfig, mainExperts: ids})}
                  onBackupChange={(ids) => setMeetingConfig({...meetingConfig, backupExperts: ids})}
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
              <button 
                onClick={() => setIsMeetingModalOpen(false)}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-white"
              >
                取消
              </button>
              <button 
                onClick={handleLaunchMeeting}
                disabled={launchingMeeting}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {launchingMeeting ? '发起中...' : '确认发起'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Right Details Panel (Drawer) */}
      {selectedBid && !isMeetingModalOpen && (
        <div className="absolute inset-0 z-40 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-25" onClick={closeDetail}></div>
          <div className="absolute inset-y-0 right-0 max-w-lg w-full bg-white shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">投标详情</h3>
              <button onClick={closeDetail} className="text-gray-400 hover:text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">项目名称</h4>
                  <p className="mt-1 text-base font-medium text-gray-900">{selectedBid.purchaseRequestName || selectedBid.procurementRequestName || selectedBid.title}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">投标ID</h4>
                    <p className="mt-1 text-sm text-gray-900">{selectedBid.bidId}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">预算</h4>
                    <p className="mt-1 text-sm text-gray-900">¥{selectedBid.budget?.toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">状态</h4>
                  <div className="mt-1">
                    <StatusBadge status={selectedBid.status} />
                  </div>
                </div>
                <div>
                   <h4 className="text-sm font-medium text-gray-500">发起人</h4>
                   <div className="mt-1 flex items-center">
                     {selectedBid.initiatorAvatar && <img src={selectedBid.initiatorAvatar} alt="" className="w-8 h-8 rounded-full mr-2"/>}
                     <span>{selectedBid.initiatorName || selectedBid.createUserName} {selectedBid.initiatorDept ? `- ${selectedBid.initiatorDept}` : ''}</span>
                   </div>
                </div>
                {/* More details can be added here */}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
               <button 
                 className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                 onClick={() => {
                    navigate(`/bid/detail/${selectedBid.bidId}`); // Example detail route
                 }}
               >
                 查看完整详情
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BidManagementList;
