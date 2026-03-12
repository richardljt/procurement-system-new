import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  message, 
  Layout, 
  Space,
  Breadcrumb,
  InputNumber,
  Row,
  Col,
  Tag
} from 'antd';
import { useNavigate } from 'react-router-dom';

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
  const [numMainExperts, setNumMainExperts] = useState(3);
  const [numBackupExperts, setNumBackupExperts] = useState(2);
  const [expertSelectionMode, setExpertSelectionMode] = useState('MANUAL');
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      
      const startTime = values.startTime ? dayjs(values.startTime).format('YYYY-MM-DDTHH:mm:ss') : null;
      
      // Combine experts
      const allExperts = [...mainExperts, ...backupExperts].map(String);

      if (mainExperts.length !== numMainExperts) {
        message.error(`请选择 ${numMainExperts} 名正选专家`);
        return;
      }

      if (backupExperts.length !== numBackupExperts) {
        message.error(`请选择 ${numBackupExperts} 名备选专家`);
        return;
      }

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
        backupExpertIds: backupExperts,
        numMainExperts,
        numBackupExperts,
        expertSelectionMode,
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
            { title: '新增评审会' },
          ]} />
          <div className="text-xl font-semibold leading-tight">新增评审会</div>
        </div>
      </Header>

      <Content className="p-6 max-w-6xl mx-auto w-full">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            location: '第一会议室',
          }}
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
                rules={[{ required: true, message: '请输入会议名称' }]}
              >
                <Input placeholder="例如：XX项目采购需求评审会" size="large" />
              </Form.Item>
              
              <Form.Item 
                name="startTime" 
                label="会议时间"
                rules={[{ required: true, message: '请选择会议时间' }]}
              >
                <StandardDatePicker showTime format="YYYY-MM-DD HH:mm" className="w-[300px]" placeholder="" />
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
            </div>
          </div>

          {/* 2. 关联申请 */}
          <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <ApplicationSelectionSection 
              value={selectedApplications} 
              onChange={setSelectedApplications} 
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
            <Row gutter={16} className="mb-4">
              <Col>
                <Form.Item label="正选专家数量">
                  <InputNumber min={1} value={numMainExperts} onChange={(value) => setNumMainExperts(value || 0)} />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item label="备选专家数量">
                  <InputNumber min={0} value={numBackupExperts} onChange={(value) => setNumBackupExperts(value || 0)} />
                </Form.Item>
              </Col>
            </Row>
            <ExpertSelectionSection 
              mainExperts={mainExperts}
              backupExperts={backupExperts}
              onMainChange={setMainExperts}
              onBackupChange={setBackupExperts}
              onSelectionModeChange={setExpertSelectionMode}
              numMainExperts={numMainExperts}
              numBackupExperts={numBackupExperts}
            />
          </div>

          {/* 4. 通知预览 */}
          <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <NotificationPreviewSection />
          </div>

          {/* 底部操作按钮 */}
          <div className="mt-6 text-right">
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
      
      <Footer className="text-center">
        Procurement Management System ©2024 Created by Tech Team
      </Footer>
    </Layout>
  );
};

export default CreateRequirementReviewMeeting;
