import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Card, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Calendar, MapPin, Users, History } from 'lucide-react';
import dayjs from 'dayjs';
import { getMyMeetings } from '../../../api/review';
import { useNavigate } from 'react-router-dom';

const MyMeetings: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const userId = localStorage.getItem('userId') || '';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getMyMeetings(userId);
      if (res) {
        setData(res);
      }
    } catch (error) {
      console.error('Failed to fetch my meetings', error);
      message.error('获取会议列表失败');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(amount);
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Tag className="bg-orange-50 text-orange-600 border-orange-200 m-0">待发起</Tag>;
      case 'SCHEDULED':
        return <Tag className="bg-gray-100 text-gray-600 border-gray-200 m-0">已安排</Tag>;
      case 'IN_PROGRESS':
        return <Tag className="bg-blue-100 text-blue-600 border-blue-200 m-0">进行中</Tag>;
      case 'COMPLETED':
        return <Tag className="bg-green-100 text-green-600 border-green-200 m-0">已完成</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: '会议主题',
      key: 'title',
      width: 300,
      render: (_, record) => (
        <div>
          <div className="font-medium text-gray-900 text-sm mb-1">{record.title}</div>
          <div className="text-xs text-gray-500 mb-1">
            {record.projectNo} | {record.department} | {formatCurrency(record.amount)}
          </div>
        </div>
      ),
    },
    {
      title: '时间/地点',
      key: 'time',
      width: 250,
      render: (_, record) => (
        <div className="flex flex-col space-y-1">
          <div className="flex items-center text-sm text-gray-900">
            <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
            {record.startTime ? dayjs(record.startTime).format('YYYY-MM-DD HH:mm') : '未定'}
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <MapPin className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
            {record.location || '未定'}
          </div>
        </div>
      ),
    },
    {
      title: '状态',
      key: 'status',
      dataIndex: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => {
        // Handle both IN_PROGRESS and PENDING as actionable if needed, 
        // but typically PENDING means 'Scheduled but not started' or 'Created'. 
        // Our new logic creates meeting with PENDING status (from Service default), 
        // but if we want it to be 'Started' immediately, we should have set it to IN_PROGRESS or updated it.
        // The user requirement says: "会议状态变更为已启动，并打开“评标会议进行中”的页面"
        // So when creating, we should probably set status to IN_PROGRESS.
        // Let's check if the status logic in createBidEvaluationMeeting sets it to IN_PROGRESS.
        // If it is PENDING, we might want to show "Enter" if the user is an expert.
        
        if (record.status === 'IN_PROGRESS' || record.status === 'PENDING') {
            return (
                <Button 
                  type="primary"
                  className="bg-green-600 hover:bg-green-700 text-xs px-3 border-none"
                  // Link to the meeting dashboard which is the "评标会议进行中" page
                  onClick={() => navigate(`/meeting/review/${record.meetingId}`)}
                >
                   <Users className="w-3 h-3 mr-1" /> 进入会议
                </Button>
            );
        } else if (record.status === 'COMPLETED') {
            return (
                <Button 
                  className="text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100 text-xs px-3"
                  onClick={() => navigate(`/meeting/review-readonly/${record.meetingId}`)}
                >
                   <History className="w-3 h-3 mr-1" /> 回顾会议
                </Button>
            );
        } else {
            // PENDING or SCHEDULED -> Button is empty/disabled as per requirement
            return (
                <Button size="small" disabled>
                    待开始
                </Button>
            );
        }
      },
    },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-1">待我参会</h1>
        <p className="text-sm text-gray-500">查看需要您参加的评审会议</p>
      </div>

      <Card variant="borderless" className="shadow-sm rounded-lg overflow-hidden" styles={{ body: { padding: 0 } }}>
        <Table
          columns={columns} 
          dataSource={data} 
          rowKey="meetingId"
          loading={loading}
          pagination={{ pageSize: 10 }}
          rowClassName={() => "hover:bg-gray-50"}
        />
      </Card>
    </div>
  );
};

export default MyMeetings;
