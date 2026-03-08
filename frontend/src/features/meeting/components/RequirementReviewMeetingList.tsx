import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Tag, Avatar, Space, Card, Row, Col, message, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  Plus, Search, Calendar, MapPin, Clock, 
  CheckCircle, Download, FileText, Eye, 
  Users, PlayCircle 
} from 'lucide-react';

import dayjs from 'dayjs';
import { getMeetings, getMeetingStats, Meeting, MeetingStats, MeetingQueryParams } from '../../../api/procurement';
import { startMeeting } from '../../../api/review';

import { useNavigate } from 'react-router-dom';
import { StandardRangePicker } from '../../../components/common/StandardDatePicker';

const RequirementReviewMeetingList: React.FC = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Meeting[]>([]);
  const [stats, setStats] = useState<MeetingStats>({ pending: 0, inProgress: 0, completed: 0 });
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [department, setDepartment] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchData();
    fetchStats();
  }, [statusFilter, dateRange, department]);

  const fetchStats = async () => {
    try {
      const res = await getMeetingStats();
      if (res) {
        setStats(res);
      }
    } catch (error) {
      console.error('Failed to fetch stats', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: MeetingQueryParams = {
        status: statusFilter === 'all' ? undefined : statusFilter,
        department: department === 'all' ? undefined : department,
        startDate: dateRange ? dateRange[0].format('YYYY-MM-DD HH:mm:ss') : undefined,
        endDate: dateRange ? dateRange[1].format('YYYY-MM-DD HH:mm:ss') : undefined,
        keyword: keyword
      };
      const res = await getMeetings(params);
      if (res) {
        setData(res);
      }
    } catch (error) {
      console.error('Failed to fetch meetings', error);
      message.error('获取会议列表失败');
    } finally {
      setLoading(false);
    }
  };
  
  const handleStartMeeting = (meetingId: number) => {
      Modal.confirm({
          title: '启动会议',
          content: '确定要启动本次评审会议吗？启动后会议状态将变为“进行中”。',
          okText: '确认启动',
          cancelText: '取消',
          onOk: async () => {
              try {
                  await startMeeting(meetingId);
                  message.success('会议启动成功');
                  fetchData(); // Refresh list
                  navigate(`/meeting/review/${meetingId}`);
              } catch (e) {
                  message.error('启动会议失败');
              }
          }
      });
  };

  // Helper to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(amount);
  };

  // Status Tag Helper
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
      case 'CANCELLED':
        return <Tag className="bg-red-100 text-red-600 border-red-200 m-0">已取消</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  // Columns Configuration
  const columns: ColumnsType<Meeting> = [
    {
      title: '项目信息',
      key: 'project',
      width: 300,
      render: (_, record) => (
        <div>
          <div className="font-medium text-gray-900 text-sm mb-1">{record.title}</div>
          <div className="text-xs text-gray-500 mb-1">
            {record.projectNo} | {record.department} | {formatCurrency(record.amount)}
          </div>
          <div className="text-xs text-gray-400">
             {record.startTime ? `会议日期：${dayjs(record.startTime).format('YYYY-MM-DD')}` : '-'}
          </div>
        </div>
      ),
    },
    {
      title: '会议时间/地点',
      key: 'time_location',
      width: 200,
      render: (_, record) => (
        record.status === 'PENDING' ? (
          <span className="text-sm text-gray-400">未安排</span>
        ) : (
          <div className="flex flex-col space-y-1">
            <div className="flex items-center text-sm text-gray-900 font-medium">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
              {record.startTime ? dayjs(record.startTime).format('YYYY-MM-DD HH:mm') : '-'}
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <MapPin className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
              {record.location || '-'}
            </div>
          </div>
        )
      ),
    },
    {
      title: '评审专家',
      key: 'experts',
      render: (_, record) => (
        record.experts && record.experts.length > 0 ? (
          <Avatar.Group max={{ count: 3 }} size="small">
            {record.experts.map((url, index) => (
              <Avatar key={index} src={url} />
            ))}
          </Avatar.Group>
        ) : (
          <span className="text-gray-400">-</span>
        )
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
      render: (_, record) => (
        <Space size="small">
          {record.status === 'PENDING' && (
            <>
              <Button 
                size="small" 
                className="text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100 text-xs px-3"
                onClick={() => navigate(`/meeting/requirement-review/detail/${record.meetingId}`)}
              >
                 <Eye className="w-3 h-3 mr-1" /> 查看详情
              </Button>
              <Button 
                  size="small" 
                  type="primary" 
                  className="bg-green-600 hover:bg-green-700 text-xs px-3 border-none"
                  onClick={() => handleStartMeeting(record.meetingId)}
              >
                 <PlayCircle className="w-3 h-3 mr-1" /> 启动会议
              </Button>
            </>
          )}
          {record.status === 'SCHEDULED' && (
            <>
              <Button 
                size="small" 
                type="primary"
                className="bg-green-600 hover:bg-green-700 text-xs px-3 border-none"
                onClick={() => navigate(`/meeting/review/${record.meetingId}`)}
              >
                 <Users className="w-3 h-3 mr-1" /> 进入会议
              </Button>
              <Button 
                size="small" 
                className="text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100 text-xs px-3"
                onClick={() => navigate(`/meeting/requirement-review/detail/${record.meetingId}`)}
              >
                 <Eye className="w-3 h-3 mr-1" /> 查看详情
              </Button>
            </>
          )}
          {record.status === 'IN_PROGRESS' && (
            <Button 
              size="small" 
              type="primary"
              className="bg-green-600 hover:bg-green-700 text-xs px-3 border-none"
              onClick={() => navigate(`/meeting/review/${record.meetingId}`)}
            >
               <Users className="w-3 h-3 mr-1" /> 进入会议
            </Button>
          )}
          {record.status === 'COMPLETED' && (
            <>
            <Button 
              size="small" 
              className="text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100 text-xs px-3"
              onClick={() => navigate(`/meeting/requirement-review/detail/${record.meetingId}`)}
            >
               <FileText className="w-3 h-3 mr-1" /> 查看详情
            </Button>
            <Button 
              size="small" 
              className="text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100 text-xs px-3"
              onClick={() => navigate(`/meeting/review-readonly/${record.meetingId}`)}
            >
               <Users className="w-3 h-3 mr-1" /> 回顾会议
            </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-1">需求评审会管理</h1>
            <p className="text-sm text-gray-500">管理和组织采购申请的需求评审会议</p>
          </div>
          <Space size="middle">
            <Button 
              className="flex items-center text-gray-700 border-gray-300"
              icon={<Download className="w-4 h-4" />}
            >
              导出列表
            </Button>
            <Button 
              type="primary" 
              className="bg-blue-600 hover:bg-blue-700 flex items-center shadow-sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => navigate('/meeting/requirement-review/create')}
            >
              新增评审会
            </Button>
          </Space>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase">已评审通过待发起</span>
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-orange-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
            <p className="text-xs text-gray-500 mt-1">需要安排评审会议</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase">进行中会议</span>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            <p className="text-xs text-gray-500 mt-1">正在进行的会议</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase">已完成评审会</span>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-xs text-gray-500 mt-1">本月完成 4 场</p>
          </div>
        </div>

        {/* Filters */}
        <Card variant="borderless" className="shadow-sm rounded-lg mb-8">
          <Row gutter={16} align="middle">
            <Col span={6}>
              <div className="mb-1.5 text-xs font-medium text-gray-700">会议状态</div>
              <Select 
                placeholder="全部状态" 
                className="w-full" 
                allowClear
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { label: '全部状态', value: 'all' },
                  { label: '待发起', value: 'PENDING' },
                  { label: '进行中', value: 'IN_PROGRESS' },
                  { label: '已完成', value: 'COMPLETED' },
                ]}
              />
            </Col>
            <Col span={6}>
              <div className="mb-1.5 text-xs font-medium text-gray-700">会议日期</div>
              <StandardRangePicker 
                className="w-full" 
                value={dateRange}
                onChange={setDateRange}
              />
            </Col>
            <Col span={6}>
              <div className="mb-1.5 text-xs font-medium text-gray-700">申请部门</div>
              <Select 
                placeholder="全部部门" 
                className="w-full"
                allowClear
                value={department}
                onChange={setDepartment}
                options={[
                  { label: '全部部门', value: 'all' },
                  { label: '技术研发部', value: '技术研发部' },
                  { label: '产品部', value: '产品部' },
                  { label: '市场部', value: '市场部' },
                  { label: '行政部', value: '行政部' },
                  { label: '财务部', value: '财务部' },
                ]}
              />
            </Col>
            <Col span={6}>
              <div className="mb-1.5 text-xs font-medium text-gray-700">搜索</div>
              <Space.Compact className="w-full">
                <Input 
                  prefix={<Search className="w-4 h-4 text-gray-400" />} 
                  placeholder="会议名称、会议备注..." 
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onPressEnter={() => fetchData()}
                />
                <Button type="primary" onClick={() => fetchData()}>查询</Button>
              </Space.Compact>
            </Col>
          </Row>
        </Card>

        {/* Table */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
          <Table
            columns={columns} 
            dataSource={data} 
            rowKey="meetingId"
            loading={loading}
            pagination={{
              total: data.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
            rowClassName={() => "hover:bg-gray-50"}
          />
        </div>
      </div>
    </div>
  );
};

export default RequirementReviewMeetingList;
