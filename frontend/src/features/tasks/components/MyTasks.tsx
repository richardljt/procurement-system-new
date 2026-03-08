import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { getMyTasks, TaskDTO } from '../../../api/task';
import { Clock, FileText, ArrowRight, Inbox } from 'lucide-react';

const MyTasks: React.FC = () => {
  useDocumentTitle('待我处理');
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<TaskDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        // Default to U002 if not set, for demonstration purposes as requested by thought process
        const userId = localStorage.getItem('userId') || 'U002'; 
        const data = await getMyTasks(userId);
        if (Array.isArray(data)) {
          setTasks(data);
        } else {
            setTasks([]);
        }
      } catch (error) {
        console.error("Failed to fetch tasks", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleProcess = (task: TaskDTO) => {
    // Navigate to approval page based on business type
    // Currently we only have PROCUREMENT
    if (task.businessType === 'PROCUREMENT') {
        // If we have businessId, use it. Otherwise rely on some other lookup?
        // We added businessId to TaskDTO, so use it.
        if (task.businessId) {
            navigate(`/approval/${task.businessId}`);
        } else {
            console.error("Missing businessId for task", task);
            // Fallback or error
        }
    } else {
        console.warn("Unknown business type", task.businessType);
    }
  };

  const getTaskIcon = () => {
      return <FileText className="w-5 h-5 text-blue-500" />;
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-1">待我处理</h1>
        <p className="text-sm text-gray-500">查看并处理分配给您的审批任务</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">加载中...</div>
        ) : tasks.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <div key={task.taskId} className="p-5 hover:bg-gray-50 transition-colors flex items-center justify-between">
                <div className="flex items-start space-x-4">
                  <div className="mt-1 p-2 bg-blue-50 rounded-lg">
                    {getTaskIcon()}
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-1">
                      {task.businessTitle || `${task.businessType === 'PROCUREMENT' ? '采购申请' : '未知业务'} - ${task.nodeName}`}
                    </h3>
                    <div className="flex items-center space-x-3 text-sm text-gray-500">
                      <span className="flex items-center">
                        <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-xs mr-2">{task.businessKey}</span>
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        {task.createTime ? new Date(task.createTime).toLocaleString() : '未知时间'}
                      </span>
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                        {task.status === 'PENDING' ? '待审批' : task.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleProcess(task)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md flex items-center transition-colors shadow-sm"
                >
                  去处理
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Inbox className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium text-gray-900">暂无待办任务</p>
            <p className="text-sm mt-1">当前没有需要您处理的任务</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTasks;
