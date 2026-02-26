import React, { useEffect, useState } from 'react';
import { Card, Button, InputNumber, Form, message, Alert, Table, Modal, Divider, Statistic, Input, Select } from 'antd';
import { getVotes, submitVote, resetVote, endVote, startVote, endMeeting, getParticipants, getMeetingInfo, MeetingVote } from '../../../../api/review';
import { RefreshCw, StopCircle, PlayCircle, BarChart2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  meetingId: number;
  userId: string;
  userName: string;
  round: number;
  isAdmin?: boolean;
  readOnly?: boolean;
}

const VoteSection: React.FC<Props> = ({ meetingId, userId, userName, round, isAdmin, readOnly }) => {
  const [votes, setVotes] = useState<MeetingVote[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [form] = Form.useForm();
  const [showStats, setShowStats] = useState(false);
  const [showEndMeeting, setShowEndMeeting] = useState(false);
  const [conclusion, setConclusion] = useState('');
  const [voteStatus, setVoteStatus] = useState<string>('OPEN'); // OPEN or CLOSED
  const [meetingStatus, setMeetingStatus] = useState<string>('IN_PROGRESS');
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [votesRes, participantsRes, meetingRes] = await Promise.all([
          getVotes(meetingId, round),
          getParticipants(meetingId),
          getMeetingInfo(meetingId)
      ]);
      
      if (votesRes) {
        setVotes(votesRes);
        if (votesRes.some(v => v.voterId === userId)) {
          setHasVoted(true);
        }
      }

      if (participantsRes) {
          setParticipants(participantsRes.filter(p => p.role === 'EXPERT'));
      }
      
      if (meetingRes) {
          setVoteStatus(meetingRes.voteStatus || 'OPEN');
          setMeetingStatus(meetingRes.status || 'IN_PROGRESS');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh for admin every 5 seconds
    let interval: NodeJS.Timeout;
    if (isAdmin) {
      interval = setInterval(() => {
        fetchData();
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [meetingId, round, isAdmin]);

  // Merge participants and votes for stats view
  const statsData = participants.map(p => {
      const vote = votes.find(v => v.voterId === p.userId);
      return {
          userId: p.userId,
          userName: p.userName,
          hasVoted: !!vote,
          score: vote?.score,
          comment: vote?.comment
      };
  });

  const handleSubmit = async (values: any) => {
    if (voteStatus === 'CLOSED') {
        message.error('投票已结束，无法提交');
        return;
    }
    try {
      await submitVote({
        meetingId,
        round,
        voterId: userId,
        voterName: userName,
        score: values.score,
        comment: values.comment || ''
      });
      message.success('投票成功');
      setHasVoted(true);
      fetchData();
    } catch (e) {
      message.error('投票失败，可能是投票已关闭');
      fetchData();
    }
  };

  const handleReset = async () => {
    Modal.confirm({
        title: '确认重置',
        content: '重置后所有人的投票将被清空，确认继续吗？',
        onOk: async () => {
            try {
                await resetVote(meetingId, round, userId, userName);
                message.success('投票已重置');
                setHasVoted(false);
                fetchData();
            } catch (e) {
                message.error('重置失败');
            }
        }
    });
  };

  const handleEndVote = async () => {
    Modal.confirm({
        title: '确认结束投票',
        content: '结束投票后，评审专家将无法提交投票结果。您确认要结束吗？',
        okType: 'danger',
        onOk: async () => {
            try {
                await endVote(meetingId, userId, userName);
                message.success('投票已结束');
                setVoteStatus('CLOSED');
            } catch (e) {
                message.error('操作失败');
            }
        }
    });
  };

  const handleStartVote = async () => {
      try {
          await startVote(meetingId, userId, userName);
          message.success('投票已启动');
          setVoteStatus('OPEN');
      } catch (e) {
          message.error('操作失败');
      }
  };

  const handleEndMeeting = async () => {
      if (!conclusion.trim()) {
          message.error('请输入会议结论');
          return;
      }
      try {
          await endMeeting(meetingId, conclusion, userId, userName);
          message.success('会议已结束');
          setShowEndMeeting(false);
          setMeetingStatus('COMPLETED');
          setVoteStatus('CLOSED');
          navigate(`/meeting/review-readonly/${meetingId}`);
      } catch (e) {
          message.error('结束会议失败');
      }
  };

  const columns = [
    { title: '评委', dataIndex: 'userName', key: 'userName' },
    { 
        title: '状态', 
        key: 'status',
        render: (_: any, record: any) => (
            record.hasVoted 
                ? <span className="text-green-600">已投票</span> 
                : <span className="text-gray-400">未投票</span>
        )
    },
    { title: '打分', dataIndex: 'score', key: 'score', render: (val: number) => val ?? '-' },
    { title: '意见', dataIndex: 'comment', key: 'comment', render: (val: string) => val || '-' },
  ];

  const averageScore = votes.length > 0 
    ? (votes.reduce((acc, curr) => acc + curr.score, 0) / votes.length).toFixed(1)
    : 0;
  
  const isVoteClosed = voteStatus === 'CLOSED';

  return (
    <Card title={`投票表决 (第 ${round} 轮)`} className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
      {!isAdmin && !hasVoted && !readOnly ? (
        isVoteClosed ? (
             <Alert message="投票已结束" description="管理员已关闭本次投票通道，无法再提交。" type="warning" showIcon className="mb-4" />
        ) : (
            <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Alert message="请根据答辩情况进行打分" type="info" showIcon className="mb-4" />
            <Form.Item name="score" label="评分 (0-100)" rules={[{ required: true, message: '请输入分数' }]}>
                <InputNumber min={0} max={100} className="w-full" />
            </Form.Item>
            <Form.Item name="comment" label="评审意见">
                <textarea className="ant-input" rows={3} placeholder="请输入意见..." name="comment" />
            </Form.Item>
            <Button type="primary" htmlType="submit" block>
                提交投票
            </Button>
            </Form>
        )
      ) : (
        <div>
          {!isAdmin && !readOnly ? (
            <Alert message="您已完成本轮投票" type="success" showIcon className="mb-4" />
          ) : (
            <Alert 
              message={readOnly ? "会议回顾模式：查看投票结果" : `管理员模式：${isVoteClosed ? '投票已关闭' : '实时投票监控'} (5s自动刷新)`} 
              type={isVoteClosed || readOnly ? "warning" : "info"} 
              showIcon 
              className="mb-4" 
              action={
                !readOnly && (
                <Button size="small" type="text" icon={<RefreshCw className="w-3 h-3" />} onClick={fetchData}>
                  刷新
                </Button>
                )
              }
            />
          )}
          <Table 
            dataSource={isAdmin || readOnly ? votes : votes.filter(v => v.voterId === userId)} 
            columns={[
                { title: '评委', dataIndex: 'voterName', key: 'voterName' },
                { title: '打分', dataIndex: 'score', key: 'score' },
                { title: '意见', dataIndex: 'comment', key: 'comment' },
            ]} 
            rowKey="voteId" 
            pagination={false} 
            size="small" 
            loading={loading}
          />
        </div>
      )}
      </div>

      {isAdmin && (
          <div className="mt-4 border-t pt-4">
              <div className="text-xs font-bold text-gray-500 mb-2 uppercase">管理员控制台</div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                  <Button danger icon={<RefreshCw className="w-3 h-3" />} onClick={handleReset} disabled={meetingStatus === 'COMPLETED'}>重置本轮</Button>
                  {isVoteClosed ? (
                      <Button type="primary" icon={<PlayCircle className="w-3 h-3" />} onClick={handleStartVote} disabled={meetingStatus === 'COMPLETED'}>
                          启动投票
                      </Button>
                  ) : (
                      <Button type="primary" danger icon={<StopCircle className="w-3 h-3" />} onClick={handleEndVote} disabled={meetingStatus === 'COMPLETED'}>
                          结束投票
                      </Button>
                  )}
              </div>
              <div className="grid grid-cols-1 gap-2">
                   <Button icon={<BarChart2 className="w-3 h-3" />} onClick={() => setShowStats(true)} block>查看统计</Button>
              </div>
          </div>
      )}

      {isAdmin && (
          <div className="mt-auto pt-4 border-t border-gray-200">
             <Button 
                type="primary" 
                className="w-full bg-green-600 hover:bg-green-700 border-green-600 h-10 text-base" 
                icon={<CheckCircle className="w-4 h-4" />} 
                onClick={() => setShowEndMeeting(true)}
                disabled={meetingStatus === 'COMPLETED'}
             >
                结束会议
             </Button>
          </div>
      )}

      <Modal title="投票统计" open={showStats} onCancel={() => setShowStats(false)} footer={null} width={600}>
          <div className="text-center mb-6">
              <Statistic title="平均分" value={averageScore} precision={1} />
              <div className="text-xs text-gray-500 mt-1">
                  已投票: {votes.length} / {participants.length}
              </div>
          </div>
          <Table 
            dataSource={statsData} 
            columns={columns} 
            rowKey="userId" 
            pagination={false} 
            size="small"
          />
      </Modal>

      <Modal 
        title="结束会议 & 归档" 
        open={showEndMeeting} 
        onCancel={() => setShowEndMeeting(false)}
        onOk={handleEndMeeting}
        okText="确定结束"
        cancelText="取消"
      >
          <Alert message="会议结束后将无法再进行任何操作，所有记录将被归档。" type="warning" showIcon className="mb-4" />
          <Form layout="vertical">
              <Form.Item label="会议结论" required>
                  <Select
                    value={conclusion}
                    onChange={val => setConclusion(val)}
                    placeholder="请选择会议结论"
                    options={[
                      { value: '通过', label: '通过 (Pass)' },
                      { value: '不通过', label: '不通过 (Reject)' },
                      { value: '需要复议', label: '需要复议 (Re-discuss)' },
                    ]}
                  />
              </Form.Item>
              <Form.Item label="备注说明">
                  <Input.TextArea 
                    rows={3} 
                    placeholder="如有其他补充说明，请在此输入..." 
                  />
              </Form.Item>
          </Form>
      </Modal>
    </Card>
  );
};

export default VoteSection;
