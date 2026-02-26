import React, { useEffect, useState } from 'react';
import { Card, Timeline, Typography, Button } from 'antd';
import { getLogs, ReviewLog } from '../../../../api/review';
import { ChevronDown, ChevronUp, Clock } from 'lucide-react';

interface Props {
  meetingId: number;
}

const LogSection: React.FC<Props> = ({ meetingId }) => {
  const [logs, setLogs] = useState<ReviewLog[]>([]);
  const [expanded, setExpanded] = useState(false);

  const fetchLogs = async () => {
    try {
      const res = await getLogs(meetingId);
      if (res) setLogs(res);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, [meetingId]);

  return (
    <Card 
        title={
            <div className="flex justify-between items-center cursor-pointer" onClick={() => setExpanded(!expanded)}>
                <span>会议留痕</span>
                {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </div>
        } 
        className={`transition-all duration-300 ${expanded ? 'h-full' : 'h-auto'}`}
        bodyStyle={{ padding: expanded ? '24px' : '0px', height: expanded ? 'auto' : '0px', overflow: 'hidden' }}
    >
      <div className="overflow-y-auto" style={{ maxHeight: '300px' }}>
        <Timeline mode="left">
            {logs.map(log => (
            <Timeline.Item key={log.logId} label={log.createTime ? new Date(log.createTime).toLocaleTimeString() : ''}>
                <Typography.Text strong>{log.operatorName}</Typography.Text>
                <br />
                <Typography.Text type="secondary">{log.detail}</Typography.Text>
            </Timeline.Item>
            ))}
        </Timeline>
      </div>
    </Card>
  );
};

export default LogSection;
