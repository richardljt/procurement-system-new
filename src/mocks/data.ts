export interface MockApplication {
  id: number;
  title: string;
  projectNo: string;
  department: string;
  applicant: string;
  amount: number;
  passDate: string;
  items: string;
  status: 'APPROVED';
}

export interface MockExpert {
  id: number;
  name: string;
  avatar: string;
  title: string;
  role: string;
  experience: string;
  status: 'AVAILABLE' | 'BUSY';
  type: 'MAIN' | 'BACKUP';
}

export const mockApplications: MockApplication[] = [
  {
    id: 1,
    title: '办公设备采购申请',
    projectNo: 'PR-2024-00157',
    department: '技术研发部',
    applicant: '李华',
    amount: 85000.00,
    passDate: '2024-01-15',
    items: '办公电脑、打印机等',
    status: 'APPROVED',
  },
  {
    id: 2,
    title: '服务器设备采购',
    projectNo: 'PR-2024-00145',
    department: '技术研发部',
    applicant: '王强',
    amount: 320000.00,
    passDate: '2024-01-12',
    items: '高性能服务器、存储设备',
    status: 'APPROVED',
  },
  {
    id: 3,
    title: '软件许可证采购',
    projectNo: 'PR-2024-00138',
    department: '技术研发部',
    applicant: '刘洋',
    amount: 156000.00,
    passDate: '2024-01-10',
    items: '企业软件许可证',
    status: 'APPROVED',
  },
  {
    id: 4,
    title: '网络设备升级采购',
    projectNo: 'PR-2024-00142',
    department: '技术研发部',
    applicant: '赵云',
    amount: 98000.00,
    passDate: '2024-01-08',
    items: '交换机、路由器等',
    status: 'APPROVED',
  },
];

export const mockExperts: MockExpert[] = [
  {
    id: 1,
    name: '李明',
    avatar: '/avatars/default.svg',
    title: '高级工程师',
    role: '技术专家',
    experience: '从业15年',
    status: 'AVAILABLE',
    type: 'MAIN',
  },
  {
    id: 2,
    name: '王强',
    avatar: '/avatars/default.svg',
    title: '项目经理',
    role: '采购专家',
    experience: '从业12年',
    status: 'AVAILABLE',
    type: 'MAIN',
  },
  {
    id: 3,
    name: '张丽',
    avatar: '/avatars/default.svg',
    title: '财务总监',
    role: '预算专家',
    experience: '从业18年',
    status: 'AVAILABLE',
    type: 'MAIN',
  },
  {
    id: 4,
    name: '刘伟',
    avatar: '/avatars/default.svg',
    title: '技术总监',
    role: 'IT专家',
    experience: '从业20年',
    status: 'AVAILABLE',
    type: 'MAIN',
  },
  {
    id: 5,
    name: '陈军',
    avatar: '/avatars/default.svg',
    title: '法务经理',
    role: '合同专家',
    experience: '从业10年',
    status: 'AVAILABLE',
    type: 'MAIN',
  },
  {
    id: 6,
    name: '周杰',
    avatar: '/avatars/default.svg',
    title: '技术经理',
    role: 'IT专家',
    experience: '从业11年',
    status: 'AVAILABLE',
    type: 'MAIN',
  },
];

export const mockBackupExperts: MockExpert[] = [
  {
    id: 7,
    name: '赵敏',
    avatar: '/avatars/default.svg',
    title: '高级工程师',
    role: '技术专家',
    experience: '从业8年',
    status: 'AVAILABLE',
    type: 'BACKUP',
  },
  {
    id: 8,
    name: '孙婷',
    avatar: '/avatars/default.svg',
    title: '采购主管',
    role: '采购专家',
    experience: '从业9年',
    status: 'AVAILABLE',
    type: 'BACKUP',
  },
  {
    id: 9,
    name: '吴静',
    avatar: '/avatars/default.svg',
    title: '财务经理',
    role: '预算专家',
    experience: '从业13年',
    status: 'AVAILABLE',
    type: 'BACKUP',
  },
  {
    id: 10,
    name: '马超',
    avatar: '/avatars/default.svg',
    title: '项目总监',
    role: '采购专家',
    experience: '从业16年',
    status: 'AVAILABLE',
    type: 'BACKUP',
  },
];
