import request from '../utils/request';

export interface FileRecord {
  fileId: number;
  module: string;
  originalFileName: string;
  filePath: string;
  fileSize: number;
  uploadTime: string;
  createUserId: string;
  createUserName: string;
}

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return request.post<any, string>('/api/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
