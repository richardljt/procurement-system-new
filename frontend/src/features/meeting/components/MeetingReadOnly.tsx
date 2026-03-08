import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Layout, Alert, Button } from 'antd';
import MaterialSection from './components/MaterialSection';
import QuestionSection from './components/QuestionSection';
import VoteSection from './components/VoteSection';
import LogSection from './components/LogSection';

import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { getMeetingInfo } from '../../../api/review';
import { ArrowLeft } from 'lucide-react';

const { Content } = Layout;

const MeetingReadOnly: React.FC = () => {
  useDocumentTitle('评审会议 - 归档详情');
  const { id } = useParams<{ id: string }>();
  const meetingId = parseInt(id || '0');
  const navigate = useNavigate();

  const [meetingInfo, setMeetingInfo] = useState<any>(null);

  useEffect(() => {
    if (meetingId) {
      getMeetingInfo(meetingId).then(res => {
        setMeetingInfo(res);
      });
    }
  }, [meetingId]);

  if (!meetingId) return <div>Invalid Meeting ID</div>;

  return (
    <Layout className="h-full bg-gray-100 p-4">
      <Content className="flex flex-col h-full">
        {/* Read Only Header */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4 border border-gray-200 flex justify-between items-center">
            <div>
                <h1 className="text-xl font-bold text-gray-800">{meetingInfo?.title || '会议详情'}</h1>
                <div className="text-gray-500 text-sm mt-1">
                    状态: <span className="font-bold text-gray-700">已结束 (归档)</span> | 
                    结束时间: {meetingInfo?.endTime ? new Date(meetingInfo.endTime).toLocaleString() : '-'}
                </div>
            </div>
            <Button icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/meeting/requirement-review')}>返回列表</Button>
        </div>
        
        {/* Conclusion Banner */}
        {meetingInfo?.conclusion && (
            <Alert
                message="会议结论"
                description={meetingInfo.conclusion}
                type="success"
                showIcon
                className="mb-4"
            />
        )}

        <div className="flex-1 overflow-hidden relative opacity-90 pointer-events-none select-none"> 
          {/* Use pointer-events-none to disable interaction, but maybe allow scrolling inside? 
              Actually user asked for "Read Only", so maybe interaction is allowed but no actions.
              Since I reused components, I will pass readOnly props where possible or overlay a transparent div if easier.
              Passing props is better.
          */}
           <div className="absolute inset-0 z-50 bg-gray-50/10"></div> {/* Mild overlay */}
           
           <Row gutter={[16, 16]} className="h-full pointer-events-auto"> {/* Re-enable pointer events for scrolling */}
             {/* Left Column: Materials & Logs */}
             <Col span={6} className="h-full flex flex-col">
               <div className="flex-1 mb-4 overflow-hidden">
                 <MaterialSection 
                   meetingId={meetingId} 
                   isReadOnly={true}
                   currentUser={{ id: 'viewer', name: 'Viewer' }}
                 />
               </div>
               <div className="flex-none">
                 <LogSection meetingId={meetingId} />
               </div>
             </Col>
   
             {/* Middle Column: Q&A */}
             <Col span={12} className="h-full overflow-hidden">
                {/* QuestionSection doesn't support readOnly prop yet, but we can wrap it or modify it. 
                    For now, I'll rely on visual cue and maybe just disable inputs if I modified the component.
                    Actually, let's just show it. The overlay above might block clicks if I didn't set pointer-events-auto.
                    Let's wrap specific areas with a "disable-interaction" div.
                */}
               <div className="h-full relative">
                   <div className="absolute inset-0 z-10 bg-transparent"></div> {/* Block interaction */}
                   <QuestionSection 
                     meetingId={meetingId} 
                     userId={'viewer'} 
                     userName={'Viewer'} 
                   />
               </div>
             </Col>
   
             {/* Right Column: Voting */}
             <Col span={6} className="h-full overflow-hidden">
               <div className="h-full relative">
                   {/* We might want to see the stats, so blocking interaction might be bad if it blocks scrolling. 
                       VoteSection has scrollable area.
                   */}
                   <VoteSection 
                     meetingId={meetingId} 
                     userId={'viewer'} 
                     userName={'Viewer'}
                     round={1} 
                     isAdmin={false}
                     readOnly={true}
                   />
               </div>
             </Col>
           </Row>
        </div>
      </Content>
    </Layout>
  );
};

export default MeetingReadOnly;
