import { LOGIN_PAGE_STRINGS, USER_ROLES } from '../../../constants/strings';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, getAppConfig } from '../../../api/procurement';
import { User, Lock, ArrowRight, KeyRound } from 'lucide-react';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { Input, Button, Spin } from 'antd';

type LoginMode = 'mock' | 'credentials';

const LoginPage: React.FC = () => {
  useDocumentTitle(LOGIN_PAGE_STRINGS.DOCUMENT_TITLE);
  const navigate = useNavigate();
  const [username, setUsername] = useState('Zhang Ming');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginMode, setLoginMode] = useState<LoginMode>('credentials');
  const [mockLoginEnabled, setMockLoginEnabled] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // In a real app, you would fetch this from a backend API
        const config = { mockLogin: true }; // Simulated API response
        setMockLoginEnabled(config.mockLogin);
        if (!config.mockLogin) {
          setLoginMode('credentials');
        }
      } catch (error) {
        console.error("Failed to fetch app config:", error);
        // Default to disabling mock login if config fails
        setMockLoginEnabled(false);
        setLoginMode('credentials');
      } finally {
        setConfigLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const form = e.currentTarget as HTMLFormElement;
      const userToLogin = loginMode === 'mock' ? username : form.username.value;
      
      // Basic validation for credential login
      if (loginMode === 'credentials' && !userToLogin) {
        setError('请输入用户名');
        setLoading(false);
        return;
      }

      const res = await login(userToLogin);
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

  const renderMockLogin = () => (
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
  );

  const renderCredentialLogin = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
        <Input
          name="username"
          size="large"
          placeholder="请输入用户名"
          prefix={<User className="w-4 h-4 text-gray-400" />}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
        <Input.Password
          name="password"
          size="large"
          placeholder="请输入密码"
          prefix={<Lock className="w-4 h-4 text-gray-400" />}
        />
      </div>
    </div>
  );

  if (configLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden flex flex-col">
        <div className="bg-blue-600 p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{LOGIN_PAGE_STRINGS.SYSTEM_TITLE}</h1>
          <p className="text-blue-100 text-sm">{LOGIN_PAGE_STRINGS.SYSTEM_MOTTO}</p>
        </div>

        <div className="p-8">
          {mockLoginEnabled && (
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setLoginMode('credentials')}
                className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
                  loginMode === 'credentials' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                用户密码登录
              </button>
              <button
                onClick={() => setLoginMode('mock')}
                className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
                  loginMode === 'mock' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                模拟用户登录
              </button>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {loginMode === 'mock' ? renderMockLogin() : renderCredentialLogin()}

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md flex items-center">
                <span className="mr-2">⚠️</span> {error}
              </div>
            )}
            
            <div className="space-y-3 pt-4">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full"
                size="large"
              >
                {loading ? LOGIN_PAGE_STRINGS.LOGGING_IN : '登 录'}
              </Button>
              <Button 
                className="w-full" 
                size="large"
                onClick={() => navigate('/register')}
              >
                注 册
              </Button>
            </div>
          </form>
        </div>
        
        <div className="bg-gray-50 px-8 py-4 text-center text-xs text-gray-500 border-t border-gray-100">
          {loginMode === 'mock' ? LOGIN_PAGE_STRINGS.SIMULATION_NOTICE : '请输入您的凭据进行登录'}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

