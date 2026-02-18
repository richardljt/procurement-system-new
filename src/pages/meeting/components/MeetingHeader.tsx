import React, { useState, useEffect } from 'react';
import { Tag, Button } from 'antd';
import { Calendar, MapPin, Clock, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

interface Props {
  title: string;
  status: string;
  time: string;
  location: string;
  endTime?: string;
}

const MeetingHeader: React.FC<Props> = ({ title, status, time, location, endTime }) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState('00:00:00');

  useEffect(() => {
    if (!endTime) return;

    const calculateTimeLeft = () => {
      const now = dayjs();
      const end = dayjs(endTime);
      const diff = end.diff(now);

      if (diff <= 0) {
        setTimeLeft('00:00:00');
        return;
      }

      const duration = dayjs.duration(diff);
      const hours = Math.floor(duration.asHours());
      const minutes = duration.minutes();
      const seconds = duration.seconds();

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-4 flex justify-between items-center border border-gray-200">
      <div>
        <div className="flex items-center space-x-3 mb-2">
          <h1 className="text-xl font-bold text-gray-800">{title}</h1>
          <Tag color={status === 'IN_PROGRESS' ? 'green' : 'blue'}>
            {status === 'IN_PROGRESS' ? '进行中' : status}
          </Tag>
        </div>
        <div className="flex items-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1.5" />
            <span>{time}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-1.5" />
            <span>{location}</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">参与人数:</span>
            <div className="flex -space-x-2">
               {[1,2,3,4].map(i => (
                   <div key={i} className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs">
                       {i}
                   </div>
               ))}
               <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-500">+2</div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right">
             <div className="text-xs text-gray-400 mb-1">距离结束还剩</div>
             <div className={`text-2xl font-mono font-bold ${timeLeft === '00:00:00' ? 'text-red-600' : 'text-blue-600'}`}>
               {timeLeft}
             </div>
        </div>
        <div className="h-8 w-px bg-gray-200"></div>
        <Button 
            danger 
            className="flex items-center"
            onClick={() => navigate('/meeting/requirement-review')}
        >
            <LogOut className="w-4 h-4 mr-1" />
            退出会议
        </Button>
      </div>
    </div>
  );
};

export default MeetingHeader;
