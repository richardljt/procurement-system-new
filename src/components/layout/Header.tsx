import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Bell, Settings, User, LogOut, ChevronDown, UserCircle, Briefcase, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  activeModule: 'procurement' | 'supplier' | 'report';
  setActiveModule: (module: 'procurement' | 'supplier' | 'report') => void;
}

const Header: React.FC<HeaderProps> = ({ activeModule, setActiveModule }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const realName = localStorage.getItem('realName') || localStorage.getItem('username') || '用户';
  const role = localStorage.getItem('role') || '暂无角色';
  const userId = localStorage.getItem('userId') || '暂无工号';
  const department = localStorage.getItem('department') || '暂无部门';

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    if (window.confirm('确认退出登录吗？')) {
        localStorage.clear();
        navigate('/login');
    }
  };

  const handleModuleChange = (module: 'procurement' | 'supplier' | 'report') => {
    setActiveModule(module);
    // Optionally navigate to the default page of the module
    if (module === 'procurement') {
      navigate('/procurement/list');
    } else if (module === 'supplier') {
      navigate('/supplier/tasks');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center space-x-6">
        <div className="flex items-center">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
            <ShoppingCart className="text-white w-5 h-5" />
          </div>
          <span className="ml-3 text-lg font-semibold text-gray-800">采购管理系统</span>
        </div>
        <nav className="flex items-center space-x-1 ml-8">
          <button 
            onClick={() => handleModuleChange('procurement')}
            className={`px-4 py-2 text-sm rounded-md font-medium transition-colors ${
              activeModule === 'procurement' 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            采购申请
          </button>
          <button 
            onClick={() => handleModuleChange('supplier')}
            className={`px-4 py-2 text-sm rounded-md font-medium transition-colors ${
              activeModule === 'supplier' 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            供应商管理
          </button>
          <button 
            onClick={() => handleModuleChange('report')}
            className={`px-4 py-2 text-sm rounded-md font-medium transition-colors ${
              activeModule === 'report' 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            统计报表
          </button>
        </nav>
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-md">
          <Bell className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-md">
          <Settings className="w-5 h-5" />
        </button>
        
        {/* User Profile Dropdown */}
        <div className="relative pl-4 border-l border-gray-200" ref={menuRef}>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg p-1 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-200">
               <User className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex flex-col items-start">
               <span className="text-sm font-medium text-gray-700">{realName}</span>
               <span className="text-xs text-gray-500">{role}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 mb-1">{realName}</p>
                    <div className="flex items-center text-xs text-gray-500 mb-1">
                        <UserCircle className="w-3 h-3 mr-1.5" />
                        <span>工号：{userId}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mb-1">
                        <Building className="w-3 h-3 mr-1.5" />
                        <span>部门：{department}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                        <Briefcase className="w-3 h-3 mr-1.5" />
                        <span>角色：{role}</span>
                    </div>
                </div>
                
                <div className="py-1">
                    <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        退出登录
                    </button>
                </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
