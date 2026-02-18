import React from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Plus, Search, Filter } from 'lucide-react';

const Evaluation: React.FC = () => {
  useDocumentTitle('供应商评价 - 供应商管理');

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">供应商评价</h1>
          <p className="text-gray-500 mt-1">管理供应商绩效评价</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          新建评价
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex space-x-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="搜索供应商名称" 
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
          暂无评价记录
        </div>
      </div>
    </div>
  );
};

export default Evaluation;
