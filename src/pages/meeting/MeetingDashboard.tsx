import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Layout, Modal } from 'antd';
import MaterialSection from './components/MaterialSection';
import QuestionSection from './components/QuestionSection';
import VoteSection from './components/VoteSection';
import LogSection from './components/LogSection';
import MeetingHeader from './components/MeetingHeader';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getMeetingInfo } from '../../api/review'; 

const { Content } = Layout;

const MeetingDashboard: React.FC = () => {
  useDocumentTitle('评审会议进行中');
  const { id } = useParams<{ id: string }>();
  const meetingId = parseInt(id || '0');
  const navigate = useNavigate();

  const userId = localStorage.getItem('userId') || 'guest';
  const userName = localStorage.getItem('realName') || '访客';
  const role = localStorage.getItem('role') || 'EMPLOYEE';
  const department = localStorage.getItem('department') || '';

  // Determine if admin: Either HEAD role or Department is '集采办' (Mock logic)
  const isAdmin = role === 'HEAD' || userId === 'Henry'; 

  const [meetingInfo, setMeetingInfo] = useState({
      title: '关于2026年度服务器采购项目的评审会议',
      status: 'IN_PROGRESS',
      time: '2026-05-20 14:00 - 16:00',
      location: '第一会议室 / 线上腾讯会议',
      endTime: '2026-05-20 16:00:00'
  });

  useEffect(() => {
    if (meetingId) {
      getMeetingInfo(meetingId).then(res => {
        if (res) {
          if (res.status === 'COMPLETED') {
             Modal.info({
               title: '会议已结束',
               content: '本次会议已结束，相关记录已归档。点击确定查看归档记录。',
               onOk: () => navigate(`/meeting/review-readonly/${meetingId}`),
               okText: '查看归档',
               keyboard: false,
               maskClosable: false
             });
          }
          setMeetingInfo(prev => ({
            ...prev,
            title: res.title || prev.title,
            status: res.status || prev.status,
            endTime: res.endTime || prev.endTime
          }));
        }
      });
    }
  }, [meetingId, navigate]);

  if (!meetingId) return <div>Invalid Meeting ID</div>;

  return (
    <Layout className="h-full bg-gray-100 p-4">
      <Content className="flex flex-col h-full">
        <MeetingHeader 
            title={meetingInfo.title}
            status={meetingInfo.status}
            time={meetingInfo.time}
            location={meetingInfo.location}
            endTime={meetingInfo.endTime}
        />

        <Row gutter={[16, 16]} className="flex-1 overflow-hidden">
          {/* Left Column: Materials & Logs */}
          <Col span={6} className="h-full flex flex-col">
            <div className="flex-1 mb-4 overflow-hidden">
              <MaterialSection 
                meetingId={meetingId} 
                isReadOnly={!isAdmin} 
                currentUser={{ id: userId, name: userName }}
              />
            </div>
            <div className="flex-none">
              <LogSection meetingId={meetingId} />
            </div>
          </Col>

          {/* Middle Column: Q&A */}
          <Col span={12} className="h-full overflow-hidden">
            <QuestionSection 
              meetingId={meetingId} 
              userId={userId} 
              userName={userName} 
              isAdmin={isAdmin}
            />
          </Col>

          {/* Right Column: Voting */}
          <Col span={6} className="h-full overflow-hidden">
            <VoteSection 
              meetingId={meetingId} 
              userId={userId} 
              userName={userName}
              round={1} // Default round 1 for demo
              isAdmin={isAdmin}
            />
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default MeetingDashboard;
