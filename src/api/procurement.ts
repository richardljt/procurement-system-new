import request from '../utils/request';

export interface PreApplication {
  preApplicationId: number;
  applicationCode: string;
  applicantName: string;
  department: string;
  applyDate: string;
  approvalDate: string;
  description: string;
  totalBudget: number;
  usedBudget: number;
  remainingBudget: number;
  currency?: string;
  status: string;
}

export interface ExchangeRate {
  exchangeRateId: number;
  sourceCurrency: string;
  targetCurrency: string;
  rate: number;
  effectiveDate: string;
}

export interface Supplier {
  supplierId?: number;
  supplierName: string;
  creditCode?: string;
  contactPhone?: string;
  address?: string;
  rating?: number;
  tags?: string;
  isQualified?: boolean;
  status?: string;
  region?: 'HK' | 'MAINLAND';
  contactName?: string;
  email?: string;
  applicationNo?: string;
  attachments?: string; // JSON string
  createTime?: string;
  
  // Frontend alias
  phone?: string;
}

export interface ProcurementRequestItem {
  itemId?: number;
  procurementRequestId?: number;
  itemName: string;
  amount: number;
  currency: string;
}

export interface ProcessTask {
  taskId: number;
  instanceId: number;
  nodeName: string;
  nodeType: string;
  approverId: string;
  approverName: string;
  status: string; // PENDING, APPROVED, REJECTED
  comment?: string;
  handleTime?: string;
  sequence: number;
}

export interface ProcurementFile {
  fileId?: number;
  procurementRequestId?: number;
  fileName: string;
  fileSize: number;
  filePath: string;
  uploadTime?: string;
}

export interface ProcurementRequest {
  procurementRequestId?: number;
  requestCode?: string;
  preApplicationId?: number;
  department: string;
  applicantName: string;
  procurementType: string;
  urgencyLevel: string;
  deliveryAddress: string;
  amount: number;
  currency: string;
  items?: ProcurementRequestItem[];
  files?: ProcurementFile[]; // Added
  backgroundDesc: string;
  supplierSelectionType: string;
  singleSourceReason?: string;
  supplierIds: number[];
  processTasks?: ProcessTask[];
  // Added fields to match backend and frontend usage
  status?: string; 
  title?: string;
  supplierCount?: number;
  currentApprover?: string;
  approvalStage?: string;
  approvalProgress?: number;
  approvalTotalSteps?: number;
  approvalCurrentStep?: number;
  lastUpdateTime?: string;
  rejectionReason?: string;
  createTime?: string;
  createUserId?: number;
  createUserName?: string;
  updateTime?: string;
  updateUserId?: number;
  updateUserName?: string;
  supplierList?: Supplier[]; // Added for detail view
}

export interface ProcurementStats {
  total: number;
  approving: number;
  approved: number;
  rejected: number;
}

export interface ProcurementQuery {
  status?: string;
  procurementType?: string;
  urgencyLevel?: string;
  startDate?: string;
  endDate?: string;
  keyword?: string;
}

export interface MenuItem {
  label: string;
  path: string;
  icon: string;
  badge?: string;
  badgeColor?: string;
  count?: string;
}

export interface MenuGroup {
  title: string;
  items: MenuItem[];
}

export interface LoginResponse {
  token: string;
  username: string;
  userId: string;
  realName: string;
  role: string;
  department: string;
  menus: MenuGroup[];
}

// Auth API
export const login = async (username: string) => {
  return request.post<any, LoginResponse>('/api/auth/login', { 
    username: username, 
    password: '123456' // Hardcoded for demo as per requirement
  });
};

export const getUserInfo = async (userId: string) => {
  return request.get<any, LoginResponse>(`/api/auth/user-info`, { params: { userId } });
};

export const getProcurementList = async (query?: ProcurementQuery) => {
  return request.get<any, ProcurementRequest[]>('/api/procurement/list', { params: query });
};

export const getProcurementStats = async (query?: ProcurementQuery) => {
  return request.get<any, ProcurementStats>('/api/procurement/stats', { params: query });
};

export const getPreApplications = async () => {
  return request.get<any, PreApplication[]>('/api/procurement/pre-applications');
};

export const getSuppliers = async () => {
  return request.get<any, Supplier[]>('/api/procurement/suppliers');
};

export const createProcurementRequest = async (requestBody: ProcurementRequest) => {
  return request.post<any, string>('/api/procurement/create', requestBody);
};

export const getProcurementById = async (id: number) => {
  return request.get<any, ProcurementRequest>(`/api/procurement/detail/${id}`);
};

export const approveProcurement = async (id: number, comment?: string) => {
  return request.post<any, string>(`/api/procurement/approve/${id}`, { comment });
};

export const rejectProcurement = async (id: number, reason: string) => {
  return request.post<any, string>(`/api/procurement/reject/${id}`, { reason });
};

export const getExchangeRates = async () => {
  return request.get<any, ExchangeRate[]>('/api/procurement/exchange-rates');
};

export interface Meeting {
  meetingId: number;
  title: string;
  projectName: string;
  projectNo: string;
  department: string;
  amount: number;
  startTime?: string;
  endTime?: string;
  location?: string;
  organizerName: string;
  status: 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  experts: string[]; // List of avatar URLs
  // Audit fields
  createTime?: string;
}

export interface MeetingStats {
  pending: number;
  inProgress: number;
  completed: number;
}

export interface MeetingQueryParams {
  status?: string;
  department?: string;
  startDate?: string;
  endDate?: string;
  keyword?: string;
}

export const getMeetings = async (params?: MeetingQueryParams | string) => {
  let queryParams = {};
  if (typeof params === 'string') {
      queryParams = { status: params };
  } else if (params) {
      queryParams = params;
  }
  return request.get<any, Meeting[]>('/api/meetings', { params: queryParams });
};

export const getMeetingStats = async () => {
  return request.get<any, MeetingStats>('/api/meetings/stats');
};

export const createMeeting = async (meeting: Partial<Meeting>) => {
  return request.post<any, string>('/api/meetings/create', meeting);
};

export interface SupplierHistory {
  historyId: number;
  supplierId: number;
  supplierName: string;
  creditCode?: string;
  contactPhone?: string;
  address?: string;
  rating?: number;
  tags?: string;
  isQualified?: boolean;
  status?: string;
  region?: string;
  contactName?: string;
  email?: string;
  applicationNo?: string;
  attachments?: string;
  
  changeType: string;
  changeReason: string;
  operatorId?: string;
  operatorName?: string;
  operateTime: string;
}

// Supplier Management API
export const getMySupplierApplications = async (userId: string) => {
  return request.get<any, Supplier[]>('/api/supplier/my-applications', { params: { userId } });
};

export const createSupplierApplication = async (supplier: Supplier) => {
  return request.post<any, Supplier>('/api/supplier/apply', supplier);
};

export const getSupplierById = async (id: number) => {
  return request.get<any, Supplier>(`/api/supplier/${id}`);
};

export const getSupplierReviews = async (status: 'PENDING' | 'PROCESSED') => {
  return request.get<any, Supplier[]>('/api/supplier/reviews', { params: { status } });
};

export const approveSupplier = async (id: number) => {
  return request.post<any, string>(`/api/supplier/approve/${id}`);
};

export const rejectSupplier = async (id: number) => {
  return request.post<any, string>(`/api/supplier/reject/${id}`);
};

export const updateSupplier = async (supplier: Supplier & { changeReason: string }) => {
  return request.post<any, string>('/api/supplier/update', supplier);
};

export const getSupplierHistory = async (id: number) => {
  return request.get<any, SupplierHistory[]>(`/api/supplier/${id}/history`);
};

export const createSupplierUser = async (supplierId: number, userData: { username: string; realName: string; }) => {
  return request.post<any, any>(`/api/supplier/${supplierId}/create-user`, userData);
};
