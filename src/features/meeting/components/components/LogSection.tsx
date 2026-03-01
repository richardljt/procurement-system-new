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
    <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => setExpanded(!expanded)}>
            <span className="font-bold">会议留痕</span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
        <div className={`transition-all duration-300 overflow-hidden ${expanded ? 'p-6' : 'h-0 p-0'}`}>
            <div className="overflow-y-auto max-h-[300px]">
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
        </div>
    </div>
  );
};

export default LogSection;
