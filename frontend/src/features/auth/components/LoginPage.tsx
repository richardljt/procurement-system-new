import { LOGIN_PAGE_STRINGS, USER_ROLES } from '../../../constants/strings';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../../api/procurement';
import { User, Lock, ArrowRight } from 'lucide-react';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';

const LoginPage: React.FC = () => {
  useDocumentTitle(LOGIN_PAGE_STRINGS.DOCUMENT_TITLE);
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
        setError(LOGIN_PAGE_STRINGS.LOGIN_FAILED);
      }
    } catch (err: any) {
      setError(err.message || LOGIN_PAGE_STRINGS.LOGIN_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const users = [
    { id: 'Henry', name: 'Henry', role: USER_ROLES.PROCUREMENT_LEAD, desc: USER_ROLES.PROCUREMENT_LEAD_DESC },
    { id: 'Zhang Ming', name: 'Zhang Ming', role: USER_ROLES.EMPLOYEE, desc: USER_ROLES.EMPLOYEE_DESC },
    { id: 'Li Si', name: 'Li Si', role: USER_ROLES.MANAGER, desc: USER_ROLES.MANAGER_DESC },
    { id: 'Li Ming', name: '李明', role: USER_ROLES.EXPERT, desc: USER_ROLES.TECHNICAL_EXPERT_DESC },
    { id: 'Wang Qiang', name: '王强', role: USER_ROLES.EXPERT, desc: USER_ROLES.FINANCIAL_EXPERT_DESC },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden flex flex-col">
        <div className="bg-blue-600 p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{LOGIN_PAGE_STRINGS.SYSTEM_TITLE}</h1>
          <p className="text-blue-100 text-sm">{LOGIN_PAGE_STRINGS.SYSTEM_MOTTO}</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{LOGIN_PAGE_STRINGS.SELECT_MOCK_USER}</label>
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
              {loading ? LOGIN_PAGE_STRINGS.LOGGING_IN : LOGIN_PAGE_STRINGS.LOGIN_SYSTEM}
              {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
            </button>
          </form>
        </div>
        
        <div className="bg-gray-50 px-8 py-4 text-center text-xs text-gray-500 border-t border-gray-100">
          {LOGIN_PAGE_STRINGS.SIMULATION_NOTICE}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
