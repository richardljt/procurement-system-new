import React from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Search, Filter } from 'lucide-react';

const SupplierMyTasks: React.FC = () => {
  useDocumentTitle('我的任务 - 供应商管理');

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">我的任务</h1>
          <p className="text-gray-500 mt-1">处理供应商相关任务</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex space-x-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="搜索任务" 
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
            <button className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-50 flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              筛选
            </button>
          </div>
        </div>
        
        <div className="p-12 text-center text-gray-500">
          暂无待办任务
        </div>
      </div>
    </div>
  );
};

export default SupplierMyTasks;
