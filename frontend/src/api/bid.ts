import request from '../utils/request';
import type {
  BidRecord,
  BidListParams,
  BidListResponse,
  SupplierCandidate,
  Attachment,
  BidForm,
  ProcurementSearchResult,
  BidMonitoring
} from '../types/bid';

export type {
  BidRecord,
  BidListParams,
  BidListResponse,
  SupplierCandidate,
  Attachment,
  BidForm,
  ProcurementSearchResult,
  BidMonitoring
};

export const getBidList = async (params: BidListParams) => {
  return request.get<any, BidListResponse>('/api/bid/list', { params });
};

export const getBidDetail = async (id: string) => {
  return request.get<any, BidRecord>(`/api/bid/${id}`);
};

export const createBid = async (data: Partial<BidRecord>) => {
  return request.post<any, string>('/api/bid/create', data);
};

export const updateBid = async (id: string, data: Partial<BidRecord>) => {
  return request.put<any, string>(`/api/bid/${id}`, data);
};

export const deleteBid = async (id: string) => {
  return request.delete<any, string>(`/api/bid/${id}`);
};

export const exportBidData = async (params: BidListParams) => {
  return request.post<any, Blob>('/api/bid/export', params, { responseType: 'blob' });
};

// New API methods
export const searchProcurement = async (keyword: string) => {
  const response = await request.get<any, any[]>('/api/procurement/list', { 
    params: { 
      keyword,
      status: 'REVIEW_PASSED'
    } 
  });
  
  if (!Array.isArray(response)) return [];

  return response.map((item: any) => ({
    id: String(item.procurementRequestId),
    name: item.title,
    code: item.requestCode,
    budget: item.amount,
    content: item.backgroundDesc,
    status: item.status,
    suppliers: [] // Detail fetched separately
  }));
};

export const getProcurementDetail = async (id: string) => {
  return request.get<any, any>(`/api/procurement/detail/${id}`);
};

export const getBidDraft = async (id: string) => {
  return request.get<any, BidForm>(`/api/bid/draft/${id}`);
};

export const saveBidDraft = async (data: BidForm) => {
  // Map BidForm to Backend Bid Entity
  const payload = {
    title: data.bidTitle,
    procurementRequestId: data.procurementId,
    budget: data.budget,
    deadline: data.deadline,
    description: data.description,
    notificationMethods: data.notificationMethods.join(','),
    emailSubject: data.emailSubject,
    emailBody: data.emailBody,
    status: 'draft',
    createUserId: data.createUserId,
    createUserName: data.createUserName,
    suppliers: data.suppliers.map(s => ({
        supplierId: s.supplierId,
        isSelected: s.selected
    })),
    attachments: data.attachments.map(a => ({
        fileName: a.name,
        fileUrl: a.url,
        fileSize: a.size,
        fileType: a.type
    }))
  };
  return request.post<any, string>('/api/bid/save-draft', payload);
};

export const initiateBid = async (data: BidForm) => {
  // Map BidForm to Backend Bid Entity
  const payload = {
    title: data.bidTitle,
    procurementRequestId: data.procurementId,
    budget: data.budget,
    deadline: data.deadline,
    description: data.description,
    notificationMethods: data.notificationMethods.join(','),
    emailSubject: data.emailSubject,
    emailBody: data.emailBody,
    status: 'ongoing',
    createUserId: data.createUserId,
    createUserName: data.createUserName,
    suppliers: data.suppliers.map(s => ({
        supplierId: s.supplierId,
        isSelected: s.selected
    })),
    attachments: data.attachments.map(a => ({
        fileName: a.name,
        fileUrl: a.url,
        fileSize: a.size,
        fileType: a.type
    }))
  };
  return request.post<any, string>('/api/bid/initiate', payload);
};

export const uploadAttachment = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return request.post<any, Attachment>('/api/upload/attachment', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const getBidMonitoring = async (id: string) => {
  return request.get<any, BidMonitoring>(`/api/bid/${id}/monitor`);
};

export const refreshBidMonitoring = async (id: string) => {
  return request.post<any, BidMonitoring>(`/api/bid/${id}/refresh`);
};

export const terminateBid = async (id: string, reason: string) => {
  return request.post<any, string>(`/api/bid/${id}/terminate`, { reason });
};

export const remindSuppliers = async (id: string, supplierIds?: string[]) => {
  return request.post<any, string>(`/api/bid/${id}/remind`, { supplierIds });
};

export const exportBidMonitoring = async (id: string) => {
  return request.get<any, Blob>(`/api/bid/${id}/export`, { responseType: 'blob' });
};

// Meeting APIs (bridging to MeetingController)
export const createBidEvaluationMeeting = async (data: {
    title: string;
    bidId: number;
    bidTitle: string;
    startTime: string;
    endTime: string;
    mainExpertIds: number[];
    backupExpertIds: number[];
}) => {
    return request.post<any, number>('/api/meetings/create', data);
};
