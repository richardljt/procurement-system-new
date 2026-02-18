
export interface BidRecord {
  bidId: string;
  purchaseRequestName?: string;
  procurementRequestName?: string; // Backend field
  budget: number;
  initiatorName?: string;
  createUserName?: string; // Backend field
  initiatorDept?: string;
  initiatorAvatar?: string;
  status: 'draft' | 'initiated' | 'ongoing' | 'evaluating' | 'completed' | 'terminated' | 'evaluated';
  supplierCount?: number;
  suppliers?: any[]; // URLs or objects
  deadline: string;
  remainingTime?: string;
  attachments?: { name: string; url: string }[];
  description?: string;
  title?: string; // Backend field
  evaluationCode?: string;
}

export interface BidListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: string;
}

export interface BidListResponse {
  list: BidRecord[];
  total: number;
}

export interface SupplierCandidate {
  id: number; // Use for React key
  supplierId: number; // Use for backend mapping
  name: string;
  email: string;
  selected: boolean;
}

export interface Attachment {
  name: string;
  size: string;
  url: string;
  type: string;
}

export interface BidForm {
  procurementId?: string;
  procurementName?: string;
  budget?: number;
  bidTitle: string;
  deadline: string;
  description: string;
  notificationMethods: ('email' | 'sms')[];
  suppliers: SupplierCandidate[];
  emailRecipients: string;
  emailSubject: string;
  emailBody: string;
  attachments: Attachment[];
  status: 'draft' | 'initiated' | 'ongoing' | 'evaluating';
  createUserId?: string;
  createUserName?: string;
}

export interface ProcurementSearchResult {
  id: string;
  name: string;
  code: string;
  budget: number;
  content: string;
  status: string;
  suppliers?: SupplierCandidate[];
}

export interface BidMonitoring {
  bidId: string;
  title: string;
  status: 'ongoing' | 'completed' | 'terminated';
  countdown: string;
  deadline: string;
  stats: {
    invited: number;
    submitted: number;
    inProgress: number;
    notSubmitted: number;
    completionRate: string;
  };
  suppliers: {
    name: string;
    contact: string;
    status: string;
    businessPart: string;
    pricePart: string;
    submitTime: string;
    completion: number;
  }[];
  logs: {
    type: string;
    title: string;
    description: string;
    user: string;
    time: string;
  }[];
}
