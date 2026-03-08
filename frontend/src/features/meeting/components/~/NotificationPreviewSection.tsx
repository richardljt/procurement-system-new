import React from 'react';
import { Typography, Descriptions, Alert } from 'antd';


const { Text } = Typography;

export const NotificationPreviewSection: React.FC = () => {
  return (
    <div className="mb-6">
      <div className="mb-4">
        <Text strong className="text-base">通知预览</Text>
        <Text type="secondary" className="ml-2 text-sm">
          系统将自动向选定的专家发送以下通知
        </Text>
      </div>

      <Alert
        title="通知发送提示"
        description="会议创建成功后，系统将通过邮件和企业微信自动通知所有参会人员。"
        type="info"
        showIcon
        className="mb-4"
      />

      <div className="bg-gray-50 border border-gray-200 rounded-lg">
        <div className="p-3 font-bold border-b border-gray-200 bg-white rounded-t-lg">会议邀请通知</div>
        <div className="p-4">
          <div className="py-2">
            <Text strong>标题：</Text> 
            <Text>【邀请】关于参加 XX项目 采购需求评审会的通知</Text>
          </div>
          <div className="py-2">
            <Text strong>致：</Text> 
            <Text>评审专家</Text>
          </div>
          <div className="py-4 border-t border-b border-gray-100 my-3">
            <p>尊敬的专家：</p>
            <p>您好！诚挚邀请您参加本次采购需求评审会议。请您在收到通知后尽快确认是否参加。</p>
            <br />
            <Descriptions column={1} size="small">
              <Descriptions.Item label="会议主题">XX项目采购需求评审</Descriptions.Item>
              <Descriptions.Item label="候选时间">
                1. 2024-02-01 14:00<br/>
                2. 2024-02-02 09:30<br/>
                3. 2024-02-02 14:00
              </Descriptions.Item>
              <Descriptions.Item label="会议地点">第一会议室 / 线上会议</Descriptions.Item>
            </Descriptions>
          </div>
          <div className="text-right text-gray-500 text-xs">
            采购管理系统自动发送
          </div>
        </div>
      </div>
    </div>
  );
};
