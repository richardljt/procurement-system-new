import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Edit, Trash, X, User, Briefcase, Calendar
} from 'lucide-react';
import { Expert } from '../types/expert';
import { getExperts, createExpert, updateExpert, deleteExpert } from '../api/expert';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const ExpertList: React.FC = () => {
  useDocumentTitle('专家库管理');
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExpert, setCurrentExpert] = useState<Partial<Expert>>({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchExperts();
  }, []);

  const fetchExperts = async (searchKeyword = '') => {
    setLoading(true);
    try {
      const data = await getExperts({ keyword: searchKeyword });
      setExperts(data);
    } catch (error) {
      console.error('Failed to fetch experts', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchExperts(keyword);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('确定要删除该专家吗？')) {
      try {
        await deleteExpert(id);
        fetchExperts(keyword);
      } catch (error) {
        console.error('Failed to delete expert', error);
      }
    }
  };

  const openModal = (expert?: Expert) => {
    if (expert) {
      setCurrentExpert({ ...expert });
      setIsEditing(true);
    } else {
      setCurrentExpert({
        name: '',
        department: '',
        entryDate: '',
        industries: '',
        level: '',
        avatar: ''
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentExpert({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && currentExpert.expertId) {
        await updateExpert(currentExpert.expertId, currentExpert);
      } else {
        await createExpert(currentExpert);
      }
      closeModal();
      fetchExperts(keyword);
    } catch (error) {
      console.error('Failed to save expert', error);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-1">专家库管理</h1>
          <p className="text-sm text-gray-500">管理参与评审的专家信息</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 font-medium shadow-sm flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" /> 添加专家
        </button>
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="搜索专家姓名、部门..." 
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
      </div>

      {/* List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">专家信息</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">部门</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">级别</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">精通行业</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">入库日期</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                  加载中...
                </td>
              </tr>
            ) : experts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                  暂无数据
                </td>
              </tr>
            ) : (
              experts.map((expert) => (
                <tr key={expert.expertId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                          {expert.name ? expert.name.charAt(0) : <User className="w-5 h-5" />}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{expert.name}</div>
                        <div className="text-xs text-gray-500">ID: {expert.expertId} {expert.userId && `(User: ${expert.userId})`}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-1.5 text-gray-400" />
                      {expert.department}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {expert.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex flex-wrap gap-1">
                      {expert.industries?.split(/[,，]/).map((ind, i) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded border border-gray-200">
                          {ind.trim()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                     <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1.5 text-gray-400" />
                      {expert.entryDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => openModal(expert)} className="text-blue-600 hover:text-blue-900 mr-4">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(expert.expertId)} className="text-red-600 hover:text-red-900">
                      <Trash className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={closeModal}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {isEditing ? '编辑专家' : '添加专家'}
                    </h3>
                    <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">姓名</label>
                      <input 
                        type="text" 
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={currentExpert.name || ''}
                        onChange={e => setCurrentExpert({...currentExpert, name: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">关联系统账号 (User ID)</label>
                      <input 
                        type="text" 
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={currentExpert.userId || ''}
                        onChange={e => setCurrentExpert({...currentExpert, userId: e.target.value})}
                        placeholder="例如: E001"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">部门</label>
                      <input 
                        type="text" 
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={currentExpert.department || ''}
                        onChange={e => setCurrentExpert({...currentExpert, department: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">级别</label>
                      <select 
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={currentExpert.level || ''}
                        onChange={e => setCurrentExpert({...currentExpert, level: e.target.value})}
                      >
                        <option value="">请选择</option>
                        <option value="高级专家">高级专家</option>
                        <option value="资深专家">资深专家</option>
                        <option value="普通专家">普通专家</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">精通行业 (逗号分隔)</label>
                      <input 
                        type="text" 
                        placeholder="例如: IT, 金融, 建筑"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={currentExpert.industries || ''}
                        onChange={e => setCurrentExpert({...currentExpert, industries: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">入库日期</label>
                      <input 
                        type="date" 
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={currentExpert.entryDate || ''}
                        onChange={e => setCurrentExpert({...currentExpert, entryDate: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button 
                    type="submit" 
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    保存
                  </button>
                  <button 
                    type="button" 
                    onClick={closeModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpertList;
