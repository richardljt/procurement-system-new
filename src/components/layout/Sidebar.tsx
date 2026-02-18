import React, { useEffect, useState } from 'react';
import { 
  Clock, Eye, Star, FileText, Plus, History, 
  Users, Gavel, FileSignature, FolderOpen, 
  Filter, CalendarX, LineChart, Search,
  ChevronLeft, ChevronRight, GripVertical
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import classNames from 'classnames';

// Map icon string names to components
const iconMap: Record<string, React.ElementType> = {
  Clock, Eye, Star, FileText, Plus, History, 
  Users, Gavel, FileSignature, FolderOpen, 
  Filter, CalendarX, LineChart, Search
};

interface MenuItem {
  label: string;
  path: string;
  icon: string;
  badge?: string;
  badgeColor?: string;
  count?: string;
  activeColor?: string;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

import { getMyTasks } from '../../api/task';
import { getMyMeetings } from '../../api/review';

interface SidebarProps {
  activeModule?: 'procurement' | 'supplier' | 'report';
}

const Sidebar: React.FC<SidebarProps> = ({ activeModule = 'procurement' }) => {
  const location = useLocation();
  const [menuGroups, setMenuGroups] = useState<MenuGroup[]>([]);
  
  // Sidebar State
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(288); // Default 288px (w-72)
  const [isResizing, setIsResizing] = useState(false);

  // Load state from localStorage
  useEffect(() => {
      const savedCollapsed = localStorage.getItem('sidebar_collapsed');
      if (savedCollapsed) setIsCollapsed(JSON.parse(savedCollapsed));
      
      const savedWidth = localStorage.getItem('sidebar_width');
      if (savedWidth) setSidebarWidth(parseInt(savedWidth));
  }, []);

  // Persist state
  useEffect(() => {
      localStorage.setItem('sidebar_collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
      if (!isResizing) {
          localStorage.setItem('sidebar_width', sidebarWidth.toString());
      }
  }, [sidebarWidth, isResizing]);

  // Resize Handlers
  const startResizing = (e: React.MouseEvent) => {
      setIsResizing(true);
      e.preventDefault();
  };

  useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
          if (!isResizing) return;
          const newWidth = e.clientX;
          if (newWidth > 64 && newWidth < 480) { // Min 64px, Max 480px
              setSidebarWidth(newWidth);
              if (newWidth < 100 && !isCollapsed) {
                   setIsCollapsed(true);
              } else if (newWidth >= 100 && isCollapsed) {
                   setIsCollapsed(false);
              }
          }
      };

      const handleMouseUp = () => {
          setIsResizing(false);
      };

      if (isResizing) {
          window.addEventListener('mousemove', handleMouseMove);
          window.addEventListener('mouseup', handleMouseUp);
          document.body.style.cursor = 'col-resize';
          document.body.style.userSelect = 'none';
      } else {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
      }

      return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
      };
  }, [isResizing, isCollapsed]);

  // Supplier Management Menus
  const supplierMenus: MenuGroup[] = [
    {
      title: '入库申请',
      items: [
        { label: '入库申请', path: '/supplier/admission/apply', icon: 'FileText' },
        { label: '入库审核', path: '/supplier/admission/review', icon: 'Gavel' },
        { label: '我的任务', path: '/supplier/tasks', icon: 'Clock' },
      ]
    },
    {
      title: '日常管理',
      items: [
        { label: '供应商查询', path: '/supplier/daily/query', icon: 'Search' },
        { label: '供应商年检', path: '/supplier/daily/inspection', icon: 'CalendarX' },
        { label: '供应商评价', path: '/supplier/daily/evaluation', icon: 'Star' },
      ]
    }
  ];

  useEffect(() => {
    let isMounted = true;

    // If active module is 'supplier', use supplier menus
    if (activeModule === 'supplier') {
      setMenuGroups(supplierMenus);
      return;
    }
    
    // For procurement (or default), load from localStorage
    const loadMenus = () => {
      // Double check activeModule inside async flow just in case, though isMounted should handle it
      if (activeModule !== 'procurement') return;

      const storedMenus = localStorage.getItem('menus');
      if (storedMenus) {
        try {
          const parsedMenus = JSON.parse(storedMenus);
          
          // Fetch latest task count
          const userId = localStorage.getItem('userId');
          if (userId) {
            Promise.all([
              getMyTasks(userId).catch(() => []),
              getMyMeetings(userId).catch(() => [])
            ]).then(([tasks, meetings]) => {
              if (!isMounted) return;

              const taskCount = Array.isArray(tasks) ? tasks.length : 0;
              const meetingCount = Array.isArray(meetings) ? meetings.length : 0;

              const updatedMenus = parsedMenus.map((group: MenuGroup) => ({
                ...group,
                items: group.items.map((item: MenuItem) => {
                  if (item.label === '待我处理') {
                    return { 
                      ...item, 
                      badge: taskCount > 0 ? taskCount.toString() : undefined,
                      badgeColor: 'bg-red-500'
                    };
                  }
                  if (item.label === '待我参会') {
                    return {
                      ...item,
                      count: meetingCount > 0 ? meetingCount.toString() : undefined
                    };
                  }
                  return item;
                })
              }));
              setMenuGroups(updatedMenus);
            }).catch(err => {
              console.error("Failed to fetch counts", err);
              if (isMounted) setMenuGroups(parsedMenus);
            });
          } else {
              if (isMounted) {
                  setMenuGroups(parsedMenus);
              }
          }
        } catch (e) {
          console.error("Failed to parse menus", e);
        }
      }
    };

    loadMenus();

    // Listen for custom event to reload menus (e.g. after approval)
    const handleMenuUpdate = () => {
        loadMenus();
    };
    window.addEventListener('menu-update', handleMenuUpdate);

    return () => {
        isMounted = false;
        window.removeEventListener('menu-update', handleMenuUpdate);
    };
  }, [activeModule]); // Re-run when activeModule changes

  if (menuGroups.length === 0) {
      return (
          <aside 
            className="bg-white border-r border-gray-200 h-full overflow-y-auto p-6 transition-all duration-300 relative"
            style={{ width: isCollapsed ? 80 : sidebarWidth }}
          >
              <div className="text-gray-400 text-sm">{!isCollapsed && "加载菜单中..."}</div>
          </aside>
      );
  }

  return (
    <aside 
        className="bg-white border-r border-gray-200 h-full overflow-hidden flex flex-col relative transition-[width] duration-300 ease-in-out"
        style={{ width: isCollapsed ? 80 : sidebarWidth }}
    >
      {/* Scrollable Menu Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {menuGroups.map((group, index) => (
          <div key={index} className="mb-6 last:mb-0">
            {!isCollapsed && (
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2 truncate">
                    {group.title}
                </h3>
            )}
            {isCollapsed && index > 0 && <div className="h-px bg-gray-200 my-4 mx-2"></div>}
            
            <ul className="space-y-1">
              {group.items.map((item, idx) => {
                const isActive = item.path === location.pathname;
                const IconComponent = iconMap[item.icon] || FileText; // Default icon
                
                return (
                  <li key={idx} title={isCollapsed ? item.label : undefined}>
                    <Link 
                      to={item.path || '#'} 
                      className={classNames(
                        "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                        isActive 
                          ? "text-blue-600 bg-blue-50 font-medium" 
                          : "text-gray-700 hover:bg-gray-100",
                        isCollapsed ? "justify-center" : ""
                      )}
                    >
                      <IconComponent className={classNames("w-5 h-5 flex-shrink-0", isActive ? "text-blue-600" : "text-gray-400")} />
                      {!isCollapsed && <span className="ml-3 truncate">{item.label}</span>}
                      
                      {/* Badges - Simplified when collapsed */}
                      {!isCollapsed && item.badge && (
                        <span className={`ml-auto ${item.badgeColor || 'bg-gray-200'} text-white text-xs px-2 py-0.5 rounded-full`}>
                          {item.badge}
                        </span>
                      )}
                      {isCollapsed && item.badge && (
                         <span className={`absolute top-0 right-1 w-2 h-2 ${item.badgeColor || 'bg-red-500'} rounded-full`}></span>
                      )}

                      {!isCollapsed && item.count && (
                        <span className="ml-auto text-xs text-gray-500">{item.count}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Collapse Toggle Button */}
      <div className="p-4 border-t border-gray-200 flex justify-end items-center bg-gray-50">
           <button 
             onClick={() => {
                 const newState = !isCollapsed;
                 setIsCollapsed(newState);
                 if (!newState && sidebarWidth < 200) setSidebarWidth(288); // Reset width if expanding from very small
             }}
             className="p-2 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors focus:outline-none"
             title={isCollapsed ? "展开菜单" : "折叠菜单"}
           >
               {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
           </button>
      </div>

      {/* Resize Handle */}
      <div 
        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-400 transition-colors z-10 opacity-0 hover:opacity-100"
        onMouseDown={startResizing}
      ></div>
    </aside>
  );
};

export default Sidebar;
