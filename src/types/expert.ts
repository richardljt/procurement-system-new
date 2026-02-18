export interface Expert {
  expertId: number;
  name: string;
  department?: string;
  entryDate?: string;
  industries?: string; // Comma separated string
  level?: string;
  avatar?: string;
  createTime?: string;
  updateTime?: string;
  createUserId?: string;
  createUserName?: string;
  userId?: string; // Associated system user ID
}

export interface ExpertQueryParams {
  keyword?: string;
}
