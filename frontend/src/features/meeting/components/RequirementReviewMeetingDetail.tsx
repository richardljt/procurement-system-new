import React, { useEffect, useState } from 'react';
import { 
  Form, 
  Input, 

  Layout, 
  Breadcrumb,
  DatePicker,
  Button,
  message,
  Spin,
  Tag
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import CustomIcon from '../../../components/common/CustomIcon';
import dayjs from 'dayjs';
import { ApplicationSelectionSection } from './~/ApplicationSelectionSection';
import { ExpertSelectionSection } from './~/ExpertSelectionSection';
import { NotificationPreviewSection } from './~/NotificationPreviewSection';
import request from '../../../utils/request';



const { Header, Content, Footer } = Layout;
const { TextArea } = Input;

const RequirementReviewMeetingDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  
  const [selectedApplications, setSelectedApplications] = useState<number[]>([]);
  const [mainExperts, setMainExperts] = useState<number[]>([]);
  const [backupExperts, setBackupExperts] = useState<number[]>([]);
  const [expertSelectionMode, setExpertSelectionMode] = useState('MANUAL');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMeeting = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await request(`/api/meetings/${id}`) as any;
        
        // Transform data
        const formData = {
          title: data.title,
          location: data.location,
          description: data.description,
          startTime: data.startTime ? dayjs(data.startTime) : null,
        };
        form.setFieldsValue(formData);
        
        // Set applications
        if (data.applicationIds) {
          setSelectedApplications(data.applicationIds);
        }
        
        // Set experts
        if (data.mainExpertIds) {
          setMainExperts(data.mainExpertIds);
        }
        
        if (data.backupExpertIds) {
          setBackupExperts(data.backupExpertIds);
        }

        if (data.expertSelectionMode) {
          setExpertSelectionMode(data.expertSelectionMode);
        }
        
      } catch (error) {
        console.error(error);
        message.error('获取会议详情失败');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMeeting();
  }, [id, form]);

  return (
    <Layout className="min-h-screen bg-gray-100">
      <Header className="bg-white px-6 flex items-center shadow-sm z-10 h-16">
        <Button 
          type="text" 
          icon={<CustomIcon type="ArrowLeftOutlined" />} 
          onClick={() => navigate(-1)}
          className="mr-4"
        />
        <div className="flex-1">
          <Breadcrumb items={[
            { title: '首页' },
            { title: '评审会管理' },
            { title: '会议详情' },
          ]} />
          <div className="text-xl font-semibold leading-tight">会议详情</div>
        </div>
      </Header>

      <Content className="p-6 max-w-6xl mx-auto w-full">
        {loading ? (
          <div className="text-center p-12">
            <Spin size="large" />
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            disabled
          >
            {/* 1. 基础信息 */}
            <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <h3 className="text-base font-bold">基础信息</h3>
                </div>
                <div className="p-4">
                    <Form.Item 
                        name="title" 
                        label="会议名称" 
                    >
                        <Input size="large" />
                    </Form.Item>
                    
                    <Form.Item 
                        name="startTime" 
                        label="会议时间"
                    >
                        <DatePicker showTime format="YYYY-MM-DD HH:mm" className="w-[300px]" />
                    </Form.Item>

                    <Form.Item 
                        name="location" 
                        label="会议地点"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item name="description" label="会议备注">
                        <TextArea rows={3} />
                    </Form.Item>
                </div>
            </div>

            {/* 2. 关联申请 */}
            <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <ApplicationSelectionSection 
                value={selectedApplications} 
                readOnly
              />
            </div>

            {/* 3. 评审专家 */}
            <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center mb-4">
                <h3 className="text-base font-bold">评审专家</h3>
                <Tag color={expertSelectionMode === 'RANDOM' ? 'blue' : 'green'} className="ml-4">
                  {expertSelectionMode === 'RANDOM' ? '随机选择' : '人工选择'}
                </Tag>
              </div>
              <ExpertSelectionSection 
                mainExperts={mainExperts}
                backupExperts={backupExperts}
                readOnly
              />
            </div>

            {/* 4. 通知预览 */}
            <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <NotificationPreviewSection />
            </div>
          </Form>
        )}
      </Content>
      
      <Footer className="text-center">
        Procurement Management System ©2024 Created by Tech Team
      </Footer>
    </Layout>
  );
};

export default RequirementReviewMeetingDetail;
