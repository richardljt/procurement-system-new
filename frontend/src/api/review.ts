import request from '../utils/request';

export interface MeetingMaterial {
  materialId?: number;
  meetingId: number;
  fileName: string;
  filePath: string;
  fileSize: number;
  uploaderId: string;
  uploaderName: string;
  uploadTime?: string;
}

export interface MeetingReply {
  replyId?: number;
  questionId: number;
  content: string;
  replierId: string;
  replierName: string;
  attachmentName?: string;
  attachmentPath?: string;
  createTime?: string;
}

export interface MeetingQuestion {
  questionId?: number;
  meetingId: number;
  content: string;
  askerId: string;
  askerName: string;
  isAnonymous: boolean;
  status: string;
  attachmentName?: string;
  attachmentPath?: string;
  createTime?: string;
  replies?: MeetingReply[];
}

export interface MeetingVote {
  voteId?: number;
  meetingId: number;
  round: number;
  voterId: string;
  voterName: string;
  score: number;
  comment: string;
  createTime?: string;
}

export interface ReviewLog {
  logId?: number;
  meetingId: number;
  operatorId: string;
  operatorName: string;
  actionType: string;
  detail: string;
  createTime?: string;
}

// API Methods
export const getMaterials = (meetingId: number) => {
  return request.get<any, MeetingMaterial[]>('/api/review/materials/list', { params: { meetingId } });
};

export const uploadMaterial = (material: MeetingMaterial) => {
  return request.post<any, void>('/api/review/materials/upload', material);
};

export const deleteMaterial = (materialId: number) => {
  return request.post<any, void>(`/api/review/materials/delete/${materialId}`);
};

export const getQuestions = (meetingId: number) => {
  return request.get<any, MeetingQuestion[]>('/api/review/questions/list', { params: { meetingId } });
};

export const askQuestion = (question: MeetingQuestion) => {
  return request.post<any, void>('/api/review/questions/ask', question);
};

export const replyQuestion = (reply: MeetingReply) => {
  return request.post<any, void>('/api/review/questions/reply', reply);
};

export const deleteQuestion = (questionId: number) => {
  return request.post<any, void>(`/api/review/questions/delete/${questionId}`);
};

export const deleteReply = (replyId: number) => {
  return request.post<any, void>(`/api/review/replies/delete/${replyId}`);
};

export const getVotes = (meetingId: number, round: number) => {
  return request.get<any, MeetingVote[]>('/api/review/votes/list', { params: { meetingId, round } });
};

export const submitVote = (vote: MeetingVote) => {
  return request.post<any, void>('/api/review/votes/submit', vote);
};

export const resetVote = (meetingId: number, round: number, opId: string, opName: string) => {
  return request.post<any, void>('/api/review/votes/reset', { meetingId, round, opId, opName });
};

export const endVote = (meetingId: number, opId: string, opName: string) => {
  return request.post<any, void>('/api/review/votes/end', { meetingId, opId, opName });
};

export const startVote = (meetingId: number, opId: string, opName: string) => {
  return request.post<any, void>('/api/review/votes/start', { meetingId, opId, opName });
};

export const getLogs = (meetingId: number) => {
  return request.get<any, ReviewLog[]>('/api/review/logs/list', { params: { meetingId } });
};

export const getMeetingInfo = (meetingId: number) => {
  return request.get<any, any>('/api/review/info', { params: { meetingId } });
};

export const endMeeting = (meetingId: number, conclusion: string, opId: string, opName: string) => {
  return request.post<any, void>('/api/review/end', { meetingId, conclusion, opId, opName });
};

export const startMeeting = (meetingId: number) => {
  return request.post<any, void>('/api/review/start', { meetingId });
};

export const getMyMeetings = (userId: string) => {
  return request.get<any, any[]>('/api/review/my-meetings', { params: { userId } });
};

export const getParticipants = (meetingId: number) => {
  return request.get<any, any[]>('/api/review/participants/list', { params: { meetingId } });
};
