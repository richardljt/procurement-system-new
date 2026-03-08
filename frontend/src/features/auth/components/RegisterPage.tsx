import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">注册</h1>
        <p className="mb-6 text-gray-600">注册功能正在开发中，敬请期待！</p>
        <Button type="primary" onClick={() => navigate('/login')}>
          返回登录
        </Button>
      </div>
    </div>
  );
};

export default RegisterPage;
