export interface Contract {
  contractId?: number;
  procurementRequestId: number;
  contractName: string;
  contractCode?: string;
  supplierId?: number;
  amount?: number;
  signingDate?: string;
  attachmentUrl?: string;
  status?: string;
  
  // Extended fields for management
  signerName?: string;
  signerContact?: string;
  vendorSignerName?: string;
  vendorSignerContact?: string;
  
  // Audit fields
  createTime?: string;
  createUserName?: string;
}

export interface ContractArchivingItem {
  procurementRequestId: number;
  procurementRequestCode: string;
  procurementTitle: string;
  amount: number;
  applicantName: string;
  department: string;
  createTime: string;
  
  evaluationCompleted: boolean;
  bidId?: number;
  
  contractId?: number;
  contractStatus: string; // PENDING_ENTRY, ENTERED
  contractName?: string;
  signingDate?: string;
}
