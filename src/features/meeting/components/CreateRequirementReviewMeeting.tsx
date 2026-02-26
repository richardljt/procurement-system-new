import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  message, 
  theme, 
  Layout, 
  Space,
  Breadcrumb,
  DatePicker
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import CustomIcon from '../../../components/common/CustomIcon';
import dayjs from 'dayjs';
import { StandardDatePicker } from '../../../components/common/StandardDatePicker';
import { ApplicationSelectionSection } from './~/ApplicationSelectionSection';
import { ExpertSelectionSection } from './~/ExpertSelectionSection';
import { NotificationPreviewSection } from './~/NotificationPreviewSection';
import request from '../../../utils/request';

const { Header, Content, Footer } = Layout;
const { TextArea } = Input;

const CreateRequirementReviewMeeting: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [selectedApplications, setSelectedApplications] = useState<number[]>([]);
  const [mainExperts, setMainExperts] = useState<number[]>([]);
  const [backupExperts, setBackupExperts] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      
      const startTime = values.startTime ? dayjs(values.startTime).format('YYYY-MM-DDTHH:mm:ss') : null;
      
      // Combine experts
      const allExperts = [...mainExperts, ...backupExperts].map(String);

      const payload = {
        title: values.title,
        location: values.location,
        description: values.description,
        startTime: startTime,
        endTime: startTime ? dayjs(startTime).add(2, 'hour').format('YYYY-MM-DDTHH:mm:ss') : null, // Assume 2 hours
        experts: allExperts,
        // Custom fields
        applicationIds: selectedApplications,
        mainExpertIds: mainExperts,
        backupExpertIds: backupExperts
      };

      console.log('Submitting payload:', payload);

      await request('/api/meetings/create', {
        method: 'POST',
        data: payload,
      });

      message.success('评审会创建成功，已发送通知');
      navigate('/meeting/requirement-review');
    } catch (error) {
      console.error(error);
      message.error('创建失败，请重试');
    } finally {
      setLoading(false);
    }
  };

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
            { title: '新增评审会' },
          ]} />
          <div style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.2 }}>新增评审会</div>
        </div>
      </Header>

      <Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            location: '第一会议室',
          }}
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
              rules={[{ required: true, message: '请输入会议名称' }]}
            >
              <Input placeholder="例如：XX项目采购需求评审会" size="large" />
            </Form.Item>
            
            <Form.Item 
              name="startTime" 
              label="会议时间"
              rules={[{ required: true, message: '请选择会议时间' }]}
            >
              <StandardDatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: 300 }} placeholder="" />
            </Form.Item>

            <Form.Item 
              name="location" 
              label="会议地点"
              rules={[{ required: true, message: '请输入会议地点' }]}
            >
              <Input placeholder="请输入会议地点" />
            </Form.Item>

            <Form.Item name="description" label="会议备注">
              <TextArea rows={3} placeholder="请输入会议相关备注信息" />
            </Form.Item>
          </Card>

          {/* 2. 关联申请 */}
          <Card 
            variant="outlined"
            style={{ marginBottom: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
          >
            <ApplicationSelectionSection 
              value={selectedApplications} 
              onChange={setSelectedApplications} 
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
              onMainChange={setMainExperts}
              onBackupChange={setBackupExperts}
            />
          </Card>

          {/* 4. 通知预览 */}
          <Card 
            variant="outlined"
            style={{ marginBottom: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
          >
            <NotificationPreviewSection />
          </Card>

          {/* 底部操作按钮 */}
          <div style={{
            marginTop: 24,
            textAlign: 'right',
          }}>
            <Space size="large">
              <Button size="large" icon={<CustomIcon type="SaveOutlined" />}>存草稿</Button>
              <Button 
                type="primary" 
                size="large" 
                icon={<CustomIcon type="SendOutlined" />} 
                onClick={() => form.submit()} 
                loading={loading}
              >
                提交并发送通知
              </Button>
            </Space>
          </div>
        </Form>
      </Content>
      
      <Footer style={{ textAlign: 'center' }}>
        Procurement Management System ©2024 Created by Tech Team
      </Footer>
    </Layout>
  );
};

export default CreateRequirementReviewMeeting;
