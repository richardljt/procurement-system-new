import React, { useEffect, useState } from 'react';
import { 
  Form, 
  Input, 
  Card, 
  Layout, 
  Breadcrumb,
  DatePicker,
  Button,
  message,
  Spin
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import CustomIcon from '../../../components/common/CustomIcon';
import dayjs from 'dayjs';
import { ApplicationSelectionSection } from './~/ApplicationSelectionSection';
import { ExpertSelectionSection } from './~/ExpertSelectionSection';
import { NotificationPreviewSection } from './~/NotificationPreviewSection';
import request from '../../../utils/request';
import { mockExperts, mockBackupExperts } from '../../../mocks/data';
import { StandardDatePicker } from '../../../components/common/StandardDatePicker';

const { Header, Content, Footer } = Layout;
const { TextArea } = Input;

const RequirementReviewMeetingDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  
  const [selectedApplications, setSelectedApplications] = useState<number[]>([]);
  const [mainExperts, setMainExperts] = useState<number[]>([]);
  const [backupExperts, setBackupExperts] = useState<number[]>([]);
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
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Header style={{ 
        background: '#fff', 
        padding: '0 24px', 
        display: 'flex', 
        alignItems: 'center',
        boxShadow: '0 1px 4px rgba(0,21,41,.08)',
        zIndex: 1,
        height: 64
      }}>
        <Button 
          type="text" 
          icon={<CustomIcon type="ArrowLeftOutlined" />} 
          onClick={() => navigate(-1)}
          style={{ marginRight: 16 }}
        />
        <div style={{ flex: 1 }}>
          <Breadcrumb items={[
            { title: '首页' },
            { title: '评审会管理' },
            { title: '会议详情' },
          ]} />
          <div style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.2 }}>会议详情</div>
        </div>
      </Header>

      <Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 50 }}>
            <Spin size="large" />
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            disabled
          >
            {/* 1. 基础信息 */}
            <Card 
              title="基础信息" 
              variant="outlined"
              style={{ marginBottom: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
              styles={{ header: { fontWeight: 'bold' } }}
            >
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
                <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: 300 }} />
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
            </Card>

            {/* 2. 关联申请 */}
            <Card 
              variant="outlined"
              style={{ marginBottom: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
            >
              <ApplicationSelectionSection 
                value={selectedApplications} 
                readOnly
              />
            </Card>

            {/* 3. 评审专家 */}
            <Card 
              variant="outlined"
              style={{ marginBottom: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
            >
              <ExpertSelectionSection 
                mainExperts={mainExperts}
                backupExperts={backupExperts}
                readOnly
              />
            </Card>

            {/* 4. 通知预览 */}
            <Card 
              variant="outlined"
              style={{ marginBottom: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
            >
              <NotificationPreviewSection />
            </Card>
          </Form>
        )}
      </Content>
      
      <Footer style={{ textAlign: 'center' }}>
        Procurement Management System ©2024 Created by Tech Team
      </Footer>
    </Layout>
  );
};

export default RequirementReviewMeetingDetail;
