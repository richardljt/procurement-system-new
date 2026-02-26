import React, { useState, useEffect } from 'react';
import { Table, Button, Input, DatePicker, Select, Tag, Avatar, Space, Card, Row, Col, message, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  Plus, Search, Calendar, MapPin, Clock, 
  CheckCircle, Download, FileText, Eye, 
  Users, PlayCircle, Gavel 
} from 'lucide-react';
import dayjs from 'dayjs';
import { getEvaluationList } from '../../../api/evaluation';
import { useNavigate } from 'react-router-dom';
import { StandardRangePicker } from '../../../components/common/StandardDatePicker';

const { RangePicker } = DatePicker;

// Define local interface for Evaluation Project list item
interface EvaluationProjectItem {
  id: number;
  projectCode: string;
  title: string;
  bidId: number;
  status: string; // ONGOING, PAUSED, COMPLETED
  currentStage: string;
  organizerName: string;
  startTime: string;
  createTime: string;
}

const BidEvaluationList: React.FC = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<EvaluationProjectItem[]>([]);
  // Mock stats for now, can implement separate stats API later
  const [stats, setStats] = useState({ pending: 0, inProgress: 0, completed: 0 });
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [department, setDepartment] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchData();
  }, [statusFilter, keyword]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getEvaluationList({
        keyword,
        status: statusFilter === 'all' ? undefined : statusFilter
      });
      if (res) {
        const list = res as any;
        setData(list);
        // Simple client-side stats calculation for demo
        setStats({
            pending: 0, // Not tracked in this table typically
            inProgress: list.filter((i: any) => i.status === 'ONGOING').length,
            completed: list.filter((i: any) => i.status === 'COMPLETED').length
        });
      }
    } catch (error) {
      console.error('Failed to fetch evaluation meetings', error);
      message.error('获取评标会议列表失败');
    } finally {
      setLoading(false);
    }
  };
  
  // Helper to format currency (mock amount as it is not in project list yet, or fetch if needed)
  // For now we remove amount column or mock it
  
  // Status Tag Helper
  const getStatusTag = (status: string) => {
    switch (status) {
      case 'ONGOING':
        return <Tag className="bg-blue-100 text-blue-600 border-blue-200 m-0">进行中</Tag>;
      case 'PAUSED':
        return <Tag className="bg-yellow-100 text-yellow-600 border-yellow-200 m-0">已暂停</Tag>;
      case 'COMPLETED':
        return <Tag className="bg-green-100 text-green-600 border-green-200 m-0">已完成</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  // Columns Configuration
  const columns: ColumnsType<EvaluationProjectItem> = [
    {
      title: '项目信息',
      key: 'project',
      width: 300,
      render: (_, record) => (
        <div>
          <div className="font-medium text-gray-900 text-sm mb-1">{record.title}</div>
          <div className="text-xs text-gray-500 mb-1">
            {record.projectCode} | {record.organizerName}
          </div>
          <div className="text-xs text-gray-400">
             {record.startTime ? `开始时间：${dayjs(record.startTime).format('YYYY-MM-DD HH:mm')}` : '-'}
          </div>
        </div>
      ),
    },
    {
      title: '当前阶段',
      key: 'stage',
      render: (_, record) => (
         <Tag color="blue">{record.currentStage === 'BUSINESS' ? '商务评标' : '价格评标'}</Tag>
      )
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
          {(record.status === 'ONGOING' || record.status === 'PAUSED') && (
            <Button 
              size="small" 
              type="primary"
              className="bg-green-600 hover:bg-green-700 text-xs px-3 border-none"
              onClick={() => navigate(`/meeting/evaluation-running/${record.projectCode}`)}
            >
               <Users className="w-3 h-3 mr-1" /> 进入会议
            </Button>
          )}
          {record.status === 'COMPLETED' && (
            <Button 
              size="small" 
              className="text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100 text-xs px-3"
              // onClick={() => navigate(`/meeting/evaluation-readonly/${record.projectCode}`)} // Future feature
              disabled
            >
               <Users className="w-3 h-3 mr-1" /> 查看归档
            </Button>
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
            <h1 className="text-2xl font-semibold text-gray-800 mb-1">评标管理</h1>
            <p className="text-sm text-gray-500">管理和组织采购项目的评标评审会议</p>
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
              // onClick={() => navigate('/meeting/bid-evaluation/create')} // Placeholder for create route
            >
              新增评审会
            </Button>
          </Space>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card variant="outlined" className="shadow-sm rounded-lg" styles={{ body: { padding: '16px' } }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase">已截标待评审</span>
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-orange-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
            <p className="text-xs text-gray-500 mt-1">需要安排评审会议</p>
          </Card>

          <Card variant="outlined" className="shadow-sm rounded-lg" styles={{ body: { padding: '16px' } }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase">进行中会议</span>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Gavel className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            <p className="text-xs text-gray-500 mt-1">正在进行的评标</p>
          </Card>

          <Card variant="outlined" className="shadow-sm rounded-lg" styles={{ body: { padding: '16px' } }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase">已完成评审</span>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-xs text-gray-500 mt-1">本月完成 3 场</p>
          </Card>
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
              <Space.Compact style={{ width: '100%' }}>
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
        <Card variant="borderless" className="shadow-sm rounded-lg overflow-hidden" styles={{ body: { padding: 0 } }}>
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
        </Card>
      </div>
    </div>
  );
};

export default BidEvaluationList;
