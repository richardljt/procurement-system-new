import request from '../utils/request';

export interface TaskDTO {
  taskId: number;
  nodeName: string;
  nodeType: string;
  status: string;
  businessKey: string;
  businessType: string;
  businessTitle?: string;
  businessId: number;
  createTime: string;
  instanceId: number;
}

export const getMyTasks = async (userId: string) => {
  return request.get<any, TaskDTO[]>('/api/tasks/my-tasks', { params: { userId } });
};
