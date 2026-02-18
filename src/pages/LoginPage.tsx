import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/procurement';
import { User, Lock, ArrowRight } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const LoginPage: React.FC = () => {
  useDocumentTitle('登录 - 采购管理系统');
  const navigate = useNavigate();
  const [username, setUsername] = useState('Zhang Ming');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await login(username);
      if (res && res.token) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('username', res.username);
        localStorage.setItem('userId', res.userId);
        localStorage.setItem('realName', res.realName);
        localStorage.setItem('role', res.role);
        localStorage.setItem('department', res.department);
        localStorage.setItem('menus', JSON.stringify(res.menus));
        navigate('/');
      } else {
        setError('登录失败，请重试');
      }
    } catch (err: any) {
      setError(err.message || '登录发生错误');
    } finally {
      setLoading(false);
    }
  };

  const users = [
    { id: 'Henry', name: 'Henry', role: '集采办负责人', desc: '拥有所有权限' },
    { id: 'Zhang Ming', name: 'Zhang Ming', role: '普通员工', desc: '采购申请人' },
    { id: 'Li Si', name: 'Li Si', role: '部门经理', desc: '审批人员' },
    { id: 'Li Ming', name: '李明', role: '评审专家', desc: '技术专家' },
    { id: 'Wang Qiang', name: '王强', role: '评审专家', desc: '财务专家' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden flex flex-col">
        <div className="bg-blue-600 p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">采购管理系统</h1>
          <p className="text-blue-100 text-sm">高效 · 透明 · 智能</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">选择模拟用户</label>
              <div className="grid grid-cols-1 gap-3">
                {users.map((user) => (
                  <div 
                    key={user.id}
                    onClick={() => setUsername(user.id)}
                    className={`p-3 border rounded-lg cursor-pointer transition-all flex items-center justify-between ${
                      username === user.id 
                        ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.role} - {user.desc}</div>
                    </div>
                    {username === user.id && <div className="w-4 h-4 rounded-full bg-blue-500"></div>}
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md flex items-center">
                <span className="mr-2">⚠️</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              {loading ? '登录中...' : '登录系统'}
              {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
            </button>
          </form>
        </div>
        
        <div className="bg-gray-50 px-8 py-4 text-center text-xs text-gray-500 border-t border-gray-100">
          模拟系统 • 默认密码: 123456
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
