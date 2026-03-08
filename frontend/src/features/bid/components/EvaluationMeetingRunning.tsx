import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvaluationData } from '../../../hooks/useEvaluationData';
import { Upload, Button } from 'antd';
import { useMessageSystem } from '../../../hooks/useMessageSystem';
import { Paperclip } from 'lucide-react';
import { useScoring } from '../../../hooks/useScoring';
import LogSection from '../../meeting/components/components/LogSection';
import request from '../../../utils/request';

// Types
interface EvaluationDetail {
  id: number;
  projectCode: string;
  title: string;
  status: string;
  currentStage: string;
  organizerName: string;
  suppliers: Supplier[];
  experts: Expert[];
  scores: Score[];
  logs: Log[];
  feedbacks: Feedback[];
}

interface EvaluationMessage {
  id: number;
  evaluationId: number;
  supplierId: number;
  senderId: number;
  senderName: string;
  senderRole: string;
  content: string;
  parentId?: number;
  attachmentName?: string;
  attachmentPath?: string;
  createTime: string;
  children?: EvaluationMessage[]; // Frontend only nesting
}

interface Supplier {
  id: number;
  supplierName: string;
  supplierCode: string;
  businessScore: number;
  priceScore: number;
  totalScore: number;
  rankPosition: number;
}

interface Expert {
  id: number;
  expertName: string;
  role: string;
  avatar: string;
  isOnline: boolean;
  hasConfirmed: boolean;
}

interface Score {
  id: number;
  supplierId: number;
  expertId: number;
  score: number;
  details: string; // JSON string for detailed breakdown
  comment: string;
  stage?: 'BUSINESS' | 'PRICE';
}

interface Log {
  id: number;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

interface Feedback {
  id: number;
  supplierId: number;
  expertName: string;
  question: string;
  reply: string;
  status: string;
  createTime: string;
}

  // Mock Documents Data Function
  const getMockDocuments = (supplierName: string) => [
    { type: 'pdf', name: `${supplierName}_商务标书.pdf`, size: '2.3 MB', color: 'text-red-500' },
    { type: 'pdf', name: `${supplierName}_技术方案.pdf`, size: '1.8 MB', color: 'text-red-500' },
    { type: 'xlsx', name: `${supplierName}_报价清单.xlsx`, size: '856 KB', color: 'text-green-600' },
    { type: 'pdf', name: `${supplierName}_企业资质.pdf`, size: '3.2 MB', color: 'text-red-500' },
    { type: 'docx', name: `${supplierName}_服务方案.docx`, size: '1.5 MB', color: 'text-blue-600' },
  ];

const EvaluationMeetingRunning: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const { data, isLoading, isError, mutate: mutateEvaluation } = useEvaluationData(code);
  const [activeTab, setActiveTab] = useState<number | null>(null); // Supplier ID
  
  const currentExpertId = data?.experts && data.experts.length > 0 ? data.experts[0].id : 1;
  
  const {
    scores,
    setScores,
    scoreCache,
    setScoreCache,
    isEditing,
    setIsEditing,
    isSubmitting,
    calculateTotalScore,
    handleSubmitScore,
    defaultScoreState,
  } = useScoring(data, currentExpertId);


  const [feedbackInput, setFeedbackInput] = useState('');

  const [viewStage, setViewStage] = useState<'BUSINESS' | 'PRICE'>('BUSINESS');

  const {
    messages,
    isLoading: messagesLoading,
    activeReplyId,
    setActiveReplyId,
    replyContents,
    setReplyContents,
    messageInput,
    setMessageInput,
    sendMessage,
    deleteMessage,
  } = useMessageSystem(code, activeTab, viewStage);


  useEffect(() => {
    if (data?.currentStage) {
        // If current stage is PRICE, default view to PRICE, but allow switching
        // If current stage is BUSINESS, default view to BUSINESS
        // This runs only once when data loads initially or stage changes
        if (data.currentStage === 'PRICE') {
            setViewStage('PRICE');
        } else {
            setViewStage('BUSINESS');
        }
    }
  }, [data?.currentStage]);

  // Switch Tab Handler
  const handleTabSwitch = (newSupplierId: number) => {
      if (activeTab === newSupplierId) return;

      // 1. Save current scores to cache (ONLY if editing is allowed for current viewStage)
      if (activeTab && viewStage === data?.currentStage) {
          setScoreCache(prev => ({
              ...prev,
              [activeTab]: scores
          }));
      }

      // 2. Load new scores
      // If viewStage !== currentStage (e.g. viewing completed Business while in Price), it should be read-only
      // Logic below handles loading data, we need to adjust isEditing based on viewStage
      
      const cached = scoreCache[newSupplierId];
      if (cached && viewStage === data?.currentStage) {
          setScores(cached);
          setIsEditing(true); 
      } else if (data) {
          const savedScore = data.scores.find(s => 
              s.supplierId === newSupplierId && 
              s.expertId === currentExpertId && 
              (s.stage === viewStage || (viewStage === 'BUSINESS' && !s.stage))
          );
          
          if (savedScore && savedScore.details) {
              try {
                  const parsed = JSON.parse(savedScore.details);
                  setScores({
                      ...defaultScoreState, // Merge with default to ensure new fields (like price) exist
                      ...parsed,
                      comment: savedScore.comment || ''
                  });
                  setIsEditing(false); 
              } catch (e) {
                  setScores(defaultScoreState);
                  setIsEditing(viewStage === data.currentStage);
              }
          } else {
              setScores(defaultScoreState);
              setIsEditing(viewStage === data.currentStage);
          }
      } else {
          setScores(defaultScoreState);
          setIsEditing(false);
      }

      // Force read-only if viewing a past stage OR if the project is completed
      if (data && (viewStage !== data.currentStage || data.status === 'COMPLETED')) {
          setIsEditing(false);
      }

      setActiveTab(newSupplierId);
  };



  useEffect(() => {
    if (data && !activeTab && data.suppliers && data.suppliers.length > 0) {
       const firstId = data.suppliers[0].id;
       setActiveTab(firstId);
    }
  }, [data]); // Only run when data loads/updates

  // Initial load effect for first tab
  useEffect(() => {
      if (data && activeTab && !scoreCache[activeTab]) {
           const savedScore = data.scores.find(s => 
               s.supplierId === activeTab && 
               s.expertId === currentExpertId &&
               (s.stage === viewStage || (viewStage === 'BUSINESS' && !s.stage))
           );
           if (savedScore && savedScore.details) {
              try {
                  const parsed = JSON.parse(savedScore.details);
                  setScores({ ...defaultScoreState, ...parsed, comment: savedScore.comment || '' });
                  setIsEditing(false); // Saved score implies submitted/read-only
              } catch (e) {
                  setIsEditing(true);
              }
           } else {
               setIsEditing(viewStage === data.currentStage);
           }
      }
  }, [data, activeTab, viewStage]); // Be careful with loops here. 
  // Actually, better to do this only when data *first* loads or we switch. 
  // Let's rely on handleTabSwitch for manual switches. 
  // For initial load, we might need a separate effect or just init in fetchData.









  const handleToggleStatus = async (action: 'pause' | 'resume') => {
    if (!confirm(`确定要${action === 'pause' ? '暂停' : '恢复'}评标吗？`)) return;
    try {
      await request.post(`/api/evaluation/${code || 'EVAL-2024-001'}/${action}`);
      mutateEvaluation();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteStage = async () => {
    if (data?.currentStage !== 'BUSINESS') return;
    
    if (!confirm('确定要完成商务评标吗？\n\n注意：完成后将进入价格评标阶段，当前的商务评分将锁定不可修改。')) return;

    try {
      await request.post(`/api/evaluation/${code || 'EVAL-2024-001'}/switch-stage`);
      await mutateEvaluation();
      setViewStage('PRICE');
    } catch (err) {
      console.error(err);
      alert('操作失败');
    }
  };

  const handleCompleteEvaluation = async () => {
    if (!confirm('确定要完成整个评标流程吗？\n\n注意：提交后将生成最终评标结果，且不可再修改评分。')) return;

    try {
      await request.post(`/api/evaluation/${code || 'EVAL-2024-001'}/complete`);
      alert('评标已完成！');
      // Ideally redirect or show summary, for now just refresh to show completed status
      mutateEvaluation(); 
    } catch (err) {
      console.error(err);
      alert('操作失败');
    }
  };



  const handleSendFeedback = async () => {
      if (!feedbackInput.trim()) return;
      try {
          await request.post(`/api/evaluation/${code || 'EVAL-2024-001'}/feedback`, {
              question: feedbackInput,
              supplierId: activeTab, // Associate with current tab supplier if any
              expertName: data?.organizerName || 'Expert'
          });
          setFeedbackInput('');
          mutateEvaluation();
      } catch(err) {
          console.error(err);
      }
  };

    // Calculate ranks dynamically based on current scores
    const calculateRanks = (suppliers: Supplier[]) => {
        // Calculate average score for each supplier from available expert scores
        const supplierScores = suppliers.map(s => {
            const supplierScores = data.scores.filter(sc => 
                sc.supplierId === s.id && 
                (sc.stage === viewStage || (viewStage === 'BUSINESS' && !sc.stage))
            );
            const totalScore = supplierScores.reduce((sum, sc) => sum + sc.score, 0);
            const avgScore = supplierScores.length > 0 ? totalScore / supplierScores.length : 0;
            return { ...s, avgScore };
        });

        // Sort by average score descending
        const sorted = [...supplierScores].sort((a, b) => b.avgScore - a.avgScore);
        
        // Map back to rank
        const rankMap = new Map<number, number>();
        sorted.forEach((s, index) => {
            rankMap.set(s.id, index + 1);
        });

        return rankMap;
    };

    const rankMap = data ? calculateRanks(data.suppliers) : new Map();

  if (!data) return <div className="p-8">Loading...</div>;

  const activeSupplier = data.suppliers.find(s => s.id === activeTab);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50 font-sans">
      {/* Evaluation Header */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-700 px-8 py-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
             <div className="w-16 h-16 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white border-opacity-30 mr-4">
               <i className="fa-solid fa-clipboard-check text-white text-3xl"></i>
             </div>
             <div>
               <div className="flex items-center mb-1">
                 <h2 className="text-2xl font-bold text-white mr-3">{data.title}</h2>
                 <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${data.status === 'ONGOING' ? 'bg-green-500' : data.status === 'COMPLETED' ? 'bg-gray-500' : 'bg-yellow-500'} text-white`}>
                   <i className={`fa-solid ${data.status === 'ONGOING' ? 'fa-spinner fa-spin' : data.status === 'COMPLETED' ? 'fa-check-circle' : 'fa-pause'} mr-1`}></i>
                   {data.status === 'ONGOING' ? '进行中' : data.status === 'COMPLETED' ? '已结束' : '已暂停'}
                 </span>
               </div>
               <p className="text-indigo-100 text-sm">项目编号: {data.projectCode} | 专家数: {data.experts.length}位 | 供应商数: {data.suppliers.length}家</p>
             </div>
          </div>
          <div className="flex items-center space-x-3">
             <span className="inline-flex items-center px-3 py-2 rounded-lg text-xs font-medium bg-white bg-opacity-10 text-indigo-100 border border-indigo-400 border-opacity-30">
                <i className="fa-solid fa-clock mr-2"></i>
                已进行 2小时15分
             </span>
             {data.status === 'ONGOING' ? (
                 <button onClick={() => handleToggleStatus('pause')} className="px-5 py-2.5 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 text-white rounded-lg hover:bg-opacity-30 transition-all font-medium">
                   <i className="fa-solid fa-pause mr-2"></i> 暂停评标
                 </button>
             ) : data.status === 'PAUSED' ? (
                 <button onClick={() => handleToggleStatus('resume')} className="px-5 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-medium">
                   <i className="fa-solid fa-play mr-2"></i> 恢复评标
                 </button>
             ) : null}
             <button className="px-5 py-2.5 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-semibold shadow-lg">
                 <i className="fa-solid fa-download mr-2"></i>
                 生成报告
             </button>
          </div>
        </div>
      </section>

      {/* Stage Control */}
      <section className="bg-white border-b border-gray-200 px-8 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
           <div className="flex items-center space-x-3">
             {/* Business Stage Tab */}
             <div className="flex items-center">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 text-sm font-bold ${viewStage === 'BUSINESS' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                 <button 
                    onClick={() => setViewStage('BUSINESS')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm shadow-sm flex items-center transition-colors ${
                        viewStage === 'BUSINESS' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                 >
                   <i className="fa-solid fa-briefcase mr-2"></i>
                   <span>商务评标 {data.currentStage === 'PRICE' || data.status === 'COMPLETED' ? '(已完成)' : ''}</span>
                 </button>
             </div>
             
             <div className="w-8 h-px bg-gray-300 mx-2"></div>

             {/* Price Stage Tab */}
             <div className="flex items-center">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 text-sm font-bold ${viewStage === 'PRICE' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                 <button 
                    onClick={() => (data.currentStage === 'PRICE' || data.status === 'COMPLETED') && setViewStage('PRICE')}
                    disabled={data.currentStage === 'BUSINESS'}
                    className={`px-4 py-2 rounded-lg font-medium text-sm shadow-sm flex items-center transition-colors ${
                        viewStage === 'PRICE'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    } ${data.currentStage === 'PRICE' && viewStage !== 'PRICE' ? 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 cursor-pointer !text-gray-600' : ''}`}
                 >
                    <i className="fa-solid fa-dollar-sign mr-2"></i>
                    <span>价格评标 {data.currentStage === 'BUSINESS' ? '(未开始)' : data.status === 'COMPLETED' ? '(已完成)' : ''}</span>
                 </button>
             </div>
           </div>
           <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                 <span className="text-sm font-medium text-gray-700">在线专家:</span>
                 <div className="flex -space-x-2">
                   {data.experts.map(exp => (
                     <div key={exp.id} className="relative" title={exp.expertName}>
                       <img src={exp.avatar || "/avatars/avatar-1.jpg"} alt={exp.expertName} className={`w-8 h-8 rounded-full border-2 border-white ring-2 ${exp.isOnline ? 'ring-green-500' : 'ring-gray-300'}`} />
                     </div>
                   ))}
                 </div>
              </div>
              <div className="h-8 w-px bg-gray-300"></div>
              
              {data.currentStage === 'BUSINESS' && (
                  <button onClick={handleCompleteStage} className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 transition-colors shadow-sm">
                    <i className="fa-solid fa-check-double mr-2"></i>
                    完成商务评标
                  </button>
              )}
              {data.currentStage === 'PRICE' && data.status === 'ONGOING' && (
                  <button onClick={handleCompleteEvaluation} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors shadow-sm">
                    <i className="fa-solid fa-flag-checkered mr-2"></i>
                    完成本次评标
                  </button>
              )}
           </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
         
         <div className="flex-1 overflow-y-auto">
            {/* Status Bar Removed */}

            {/* Three Panel Workspace */}
            <section className="px-8 py-6">
                {/* Supplier Tabs */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
                    <div className="border-b border-gray-200">
                        <div className="flex overflow-x-auto">
                            {data.suppliers.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => handleTabSwitch(s.id)}
                                    className={`px-6 py-4 text-sm font-semibold border-b-2 whitespace-nowrap flex items-center transition-all ${
                                        activeTab === s.id 
                                        ? 'border-blue-600 text-blue-600 bg-blue-50 bg-opacity-10' 
                                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                                    }`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs mr-2 ${activeTab === s.id ? 'bg-blue-500' : 'bg-gray-400'}`}>
                                        {s.supplierCode}
                                    </div>
                                    <span>{s.supplierName}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-6 mb-6">
                    {/* Log Section moved to bottom */}
                </div>

                {/* Panels Grid */}
                <div className="grid grid-cols-12 gap-6">
                    
                    {/* Left: Document List */}
                    <div className="col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-[550px]">
                        <div className="p-5 border-b border-gray-200">
                            <h4 className="text-lg font-bold text-gray-900">标书文件清单</h4>
                        </div>
                        <div className="p-5 space-y-3 overflow-y-auto">
                            {activeSupplier && getMockDocuments(activeSupplier.supplierName).map((doc, idx) => (
                                <div key={idx} className={`bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-300 transition-colors ${idx === 0 ? 'bg-blue-50 border-blue-500' : ''}`}>
                                    <div className="flex items-center mb-2">
                                        <i className={`fa-solid ${doc.type === 'xlsx' ? 'fa-file-excel' : doc.type === 'docx' ? 'fa-file-word' : 'fa-file-pdf'} ${doc.color} text-2xl mr-3`}></i>
                                        <div className="flex-1">
                                            <h5 className="text-sm font-bold text-gray-900">{doc.name}</h5>
                                            <p className="text-xs text-gray-500">{doc.size} · {doc.type.toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <button className={`w-full py-2 rounded-lg text-xs font-medium transition-colors ${idx === 0 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                        <i className="fa-solid fa-download mr-1"></i>
                                        下载查看
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Middle: Collaboration Area */}
                    <div className="col-span-5 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-[550px]">
                        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                            <h4 className="text-lg font-bold text-gray-900">协作交流区</h4>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                <i className="fa-solid fa-comment-dots mr-1"></i>
                                {messages.length}条讨论
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {messages.length === 0 ? (
                                <div className="text-center text-gray-400 py-10">
                                    <p>暂无消息，开始讨论吧</p>
                                </div>
                            ) : (
                                messages.map(msg => (
                                    <div key={msg.id} className="space-y-2">
                                        {/* Main Message */}
                                        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 relative group">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center">
                                                    <img src="/avatars/avatar-4.jpg" alt="User" className="w-8 h-8 rounded-full border-2 border-white mr-3"/>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">{msg.senderName}</p>
                                                        <p className="text-xs text-gray-500">{new Date(msg.createTime).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    {data?.status !== 'COMPLETED' && (
                                                        <>
                                                            <button 
                                                                onClick={() => setActiveReplyId(activeReplyId === msg.id ? null : msg.id)}
                                                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                                            >
                                                                回复
                                                            </button>
                                                            <button 
                                                                onClick={() => deleteMessage(msg.id)}
                                                                className="text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                删除
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-800">{msg.content}</p>
                                            {msg.attachmentName && (
                                                <div className="mt-2 text-xs text-blue-500 flex items-center bg-white bg-opacity-50 p-1.5 rounded w-fit border border-blue-100">
                                                    <Paperclip className="w-3 h-3 mr-1" />
                                                    <a href={msg.attachmentPath || '#'} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                        {msg.attachmentName}
                                                    </a>
                                                </div>
                                            )}
                                        </div>

                                        {/* Inline Reply Form */}
                                        {activeReplyId === msg.id && (
                                            <div className="ml-8 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                <textarea
                                                    rows={2}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none mb-2"
                                                    placeholder={`回复 ${msg.senderName}...`}
                                                    value={replyContents[msg.id] || ''}
                                                    onChange={(e) => setReplyContents({...replyContents, [msg.id]: e.target.value})}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            sendMessage(replyContents[msg.id], msg.id);
                                                        }
                                                    }}
                                                ></textarea>
                                                <div className="flex justify-between items-center">
                                                    {/* Attachment button for replies can be added here */}
                                                    <div></div>
                                                    <div className="flex space-x-2">
                                                        <button 
                                                            onClick={() => setActiveReplyId(null)}
                                                            className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 transition-colors"
                                                        >
                                                            取消
                                                        </button>
                                                        <button 
                                                            onClick={() => sendMessage(replyContents[msg.id], msg.id)}
                                                            className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                                                        >
                                                            发送
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Replies */}
                                        {msg.children && msg.children.length > 0 && (
                                            <div className="pl-8 space-y-2">
                                                {msg.children.map(reply => (
                                                    <div key={reply.id} className="bg-gray-50 border-l-4 border-gray-300 rounded-lg p-3 relative group">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <div className="flex items-center">
                                                                <span className="text-xs font-bold text-gray-700 mr-2">{reply.senderName}</span>
                                                                <span className="text-xs text-gray-400">{new Date(reply.createTime).toLocaleString()}</span>
                                                            </div>
                                                            <button 
                                                                onClick={() => deleteMessage(reply.id)}
                                                                className="text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                删除
                                                            </button>
                                                        </div>
                                                        <p className="text-sm text-gray-600">{reply.content}</p>
                                                        {reply.attachmentName && (
                                                            <div className="mt-1 text-xs text-blue-500 flex items-center">
                                                                <Paperclip className="w-3 h-3 mr-1" />
                                                                <a href={reply.attachmentPath || '#'} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                                    {reply.attachmentName}
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-5 border-t border-gray-200">
                            <div className="flex items-center space-x-3">
                                 {/* Simplified attachment for main message input */}
                                <input 
                                    type="text" 
                                    placeholder="输入问题或意见..."
                                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && sendMessage(messageInput)}
                                    disabled={data?.status === 'COMPLETED'}
                                />
                                <button onClick={() => sendMessage(messageInput)} disabled={data?.status === 'COMPLETED'} className={`px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors ${data?.status === 'COMPLETED' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <i className="fa-solid fa-paper-plane mr-2"></i> 发送
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right: Scoring Panel */}
                    <div className="col-span-4 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-[550px]">
                        <div className="p-5 border-b border-gray-200">
                            <h4 className="text-lg font-bold text-gray-900 mb-1">评分表格</h4>
                            <p className="text-sm text-gray-500">{activeSupplier?.supplierName} ({activeSupplier?.supplierCode})</p>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {viewStage === 'BUSINESS' ? (
                                <>
                                    {/* Technical */}
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <h5 className="text-sm font-bold text-gray-900 mb-3">技术能力 (40分)</h5>
                                        <div className="space-y-3">
                                            {Object.entries({
                                                '技术方案完整性': ['completeness', 15],
                                                '创新性': ['innovation', 15],
                                                '可实施性': ['feasibility', 10]
                                            }).map(([label, [key, max]]) => (
                                                <div key={key}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <label className="text-sm text-gray-700">{label}</label>
                                                        <span className="text-sm font-bold text-blue-600">
                                                            {scores.tech[key as keyof typeof scores.tech]}/{max}
                                                        </span>
                                                    </div>
                                                    <input 
                                                        type="range" min="0" max={max as number} 
                                                        value={scores.tech[key as keyof typeof scores.tech]}
                                                        onChange={(e) => setScores({...scores, tech: {...scores.tech, [key]: parseInt(e.target.value)}})}
                                                        className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${isEditing ? 'bg-gray-200' : 'bg-gray-100 cursor-not-allowed'}`}
                                                        disabled={!isEditing}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Qualifications */}
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <h5 className="text-sm font-bold text-gray-900 mb-3">企业资质 (30分)</h5>
                                        <div className="space-y-3">
                                            {Object.entries({
                                                '资质证书': ['certificate', 15],
                                                '业绩案例': ['cases', 15]
                                            }).map(([label, [key, max]]) => (
                                                <div key={key}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <label className="text-sm text-gray-700">{label}</label>
                                                        <span className="text-sm font-bold text-blue-600">
                                                            {scores.qual[key as keyof typeof scores.qual]}/{max}
                                                        </span>
                                                    </div>
                                                    <input 
                                                        type="range" min="0" max={max as number} 
                                                        value={scores.qual[key as keyof typeof scores.qual]}
                                                        onChange={(e) => setScores({...scores, qual: {...scores.qual, [key]: parseInt(e.target.value)}})}
                                                        className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${isEditing ? 'bg-gray-200' : 'bg-gray-100 cursor-not-allowed'}`}
                                                        disabled={!isEditing}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                /* Price Evaluation Form */
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <h5 className="text-sm font-bold text-gray-900 mb-3">价格评分 (100分)</h5>
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-sm text-gray-700">价格得分</label>
                                            <span className="text-sm font-bold text-blue-600">
                                                {scores.price?.score || 0}/100
                                            </span>
                                        </div>
                                        <input 
                                            type="range" min="0" max="100" 
                                            value={scores.price?.score || 0}
                                            onChange={(e) => setScores({...scores, price: { score: parseInt(e.target.value) }})}
                                            className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${isEditing ? 'bg-gray-200' : 'bg-gray-100 cursor-not-allowed'}`}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Total Score */}
                            <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-bold text-gray-900">{viewStage === 'BUSINESS' ? '商务评标总分' : '价格评标总分'}</span>
                                    <span className="text-2xl font-bold text-blue-600">{calculateTotalScore(viewStage)}/100</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div className="bg-blue-600 h-3 rounded-full" style={{width: `${calculateTotalScore(viewStage)}%`}}></div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-900">评审意见</label>
                                <textarea 
                                    rows={4} 
                                    placeholder="请输入详细的评审意见和建议..." 
                                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${!isEditing && 'bg-gray-100 cursor-not-allowed'}`}
                                    value={scores.comment}
                                    onChange={(e) => setScores({...scores, comment: e.target.value})}
                                    disabled={!isEditing}
                                ></textarea>
                            </div>
                        </div>

                        <div className="p-5 border-t border-gray-200 bg-white flex-shrink-0">
                            {data?.status === 'COMPLETED' ? (
                                 <div className="w-full py-3 bg-gray-100 text-gray-500 rounded-lg font-semibold text-center border border-gray-200">
                                    <i className="fa-solid fa-lock mr-2"></i>
                                    评分已锁定
                                </div>
                            ) : isEditing ? (
                                <button 
                                    onClick={() => handleSubmitScore(activeTab, viewStage, code, mutateEvaluation)} 
                                    disabled={isSubmitting}
                                    className={`w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                                            提交中...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-check mr-2"></i>
                                            确认并提交评分
                                        </>
                                    )}
                                </button>
                            ) : (
                                <div className="w-full py-3 bg-green-50 text-green-700 rounded-lg font-semibold text-center border border-green-200">
                                    <i className="fa-solid fa-circle-check mr-2"></i>
                                    已完成评分
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Expert Scores Section (Read-only for now) */}
            <section className="px-8 py-6 bg-white border-t border-gray-200">
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">各评委评分结果</h3>
                    <p className="text-sm text-gray-500">实时更新各位专家对供应商的评分情况</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">供应商</th>
                                {data.experts.map(exp => (
                                    <th key={exp.id} className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">{exp.expertName}</th>
                                ))}
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">排名</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.suppliers.map(s => (
                                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold mr-3">
                                                {s.supplierCode}
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-gray-900">{s.supplierName}</div>
                                            </div>
                                        </div>
                                    </td>
                                    {data.experts.map(exp => {
                                        // Mock random scores for demo if real score not found
                                        const score = data.scores.find(sc => 
                                            sc.supplierId === s.id && 
                                            sc.expertId === exp.id &&
                                            (sc.stage === viewStage || (viewStage === 'BUSINESS' && !sc.stage))
                                        );
                                        const displayScore = score ? score.score : '-';
                                        return (
                                            <td key={exp.id} className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${score ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>{displayScore}</span>
                                            </td>
                                        );
                                    })}
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold bg-yellow-500 text-white">{rankMap.get(s.id) || '-'}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Meeting Log Section */}
            <section className="px-8 py-6 pb-12">
                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-12">
                        {data && <LogSection meetingId={data.id} />}
                    </div>
                </div>
            </section>
         </div>
      </div>
    </div>
  );
};

export default EvaluationMeetingRunning;
