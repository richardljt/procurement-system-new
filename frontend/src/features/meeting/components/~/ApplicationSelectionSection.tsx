import React, { useEffect, useState } from 'react';
import { Row, Col, Typography, Tag, Checkbox, Space, Empty, Spin } from 'antd';
import { cn } from '../../../../lib/utils';
import request from '../../../../utils/request';

const { Text } = Typography;

interface ApplicationSelectionSectionProps {
  value?: number[];
  onChange?: (value: number[]) => void;
  readOnly?: boolean;
}

interface ProcurementRequest {
  procurementRequestId: number;
  title: string;
  requestCode: string;
  department: string;
  applicantName: string;
  amount: number;
  updateTime: string;
  backgroundDesc: string;
  items?: any[];
}

export const ApplicationSelectionSection: React.FC<ApplicationSelectionSectionProps> = ({ 
  value = [], 
  onChange,
  readOnly = false
}) => {
  const [applications, setApplications] = useState<ProcurementRequest[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        // If readOnly, we might want to fetch only the selected applications or all
        // But the current API filters by status='APPROVED' and excludeScheduled=true
        // If we are in readOnly mode (view detail), the selected applications are ALREADY scheduled,
        // so they would be excluded by the API if we use excludeScheduled=true.
        // So for readOnly, we should NOT exclude scheduled, or we need a way to fetch specific IDs.
        
        // However, since the detail page will pass the 'value' (selected IDs), 
        // maybe we should just fetch ALL approved applications and let the UI show selected ones.
        // But better yet, if we have value IDs, we should probably fetch those specific ones.
        // For simplicity now, let's just remove excludeScheduled if readOnly is true, 
        // or if we are just viewing, maybe we don't need to fetch the list if we have the details in parent?
        // Actually, the parent passes 'value' (IDs), but we need the details (title, amount, etc.) to display cards.
        
        const params: any = { status: 'APPROVED' };
        if (!readOnly) {
             params.excludeScheduled = true;
        } else {
             // In readOnly mode, we need to show the associated applications regardless of their current status
             // or whether they are scheduled.
             // We'll remove the status filter entirely if we are in readOnly mode to ensure we fetch them
             // regardless of if their status changed (e.g. to REVIEW_PASSED).
             // However, fetching *all* might be heavy. Ideally fetch by IDs.
             // But 'procurement/list' might not support fetching by IDs.
             // Let's at least clear the status filter to be safe, or set it to null/undefined.
             delete params.status;
             params.excludeScheduled = false;
        }
        
        const res = await request('/api/procurement/list', { params });
        
        if (Array.isArray(res)) {
          setApplications(res);
        }
      } catch (error) {
        console.error('Failed to fetch applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [readOnly]);

  const handleSelect = (id: number, checked: boolean) => {
    if (readOnly || !onChange) return;
    if (checked) {
      onChange([...value, id]);
    } else {
      onChange(value.filter(v => v !== id));
    }
  };

  const handleCardClick = (id: number) => {
    if (readOnly) return;
    const isSelected = value.includes(id);
    handleSelect(id, !isSelected);
  };

  // Filter applications to show only selected ones in readOnly mode
  const displayedApplications = readOnly 
    ? applications.filter(app => value.includes(app.procurementRequestId))
    : applications;

  return (
    <div className="mb-6">
      <div className="mb-4">
        <Text strong className="text-base">关联采购申请</Text>
        {!readOnly && (
          <Text type="secondary" className="ml-2 text-sm">
            请选择需要进行评审的采购申请项目
          </Text>
        )}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        {loading ? (
          <div className="text-center p-6">
            <Spin tip="加载中..." />
          </div>
        ) : displayedApplications.length === 0 ? (
          <Empty description={readOnly ? "未关联采购申请" : "暂无已审批通过的采购申请"} />
        ) : (
          <Row gutter={[16, 16]}>
            {displayedApplications.map((app) => {
              const isSelected = value.includes(app.procurementRequestId);
              return (
                <Col span={24} key={app.procurementRequestId}>
                  <div 
                    onClick={() => handleCardClick(app.procurementRequestId)}
                    className={cn(
                      'bg-white rounded-lg p-4 transition-all flex items-center',
                      isSelected ? 'border border-blue-500 shadow-md' : 'border border-gray-200',
                      readOnly ? 'cursor-default' : 'cursor-pointer'
                    )}
                  >
                    {!readOnly && (
                        <Checkbox 
                        checked={isSelected} 
                        className="mr-4"
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleSelect(app.procurementRequestId, e.target.checked)}
                        />
                    )}
                    
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <Space>
                          <Text strong className="text-[15px]">{app.title}</Text>
                          <Tag color="blue">{app.requestCode}</Tag>
                        </Space>
                        <Text strong className="text-red-600">¥ {app.amount?.toLocaleString()}</Text>
                      </div>
                      
                      <Row gutter={16} className="text-[13px] text-gray-600">
                        <Col span={6}>申请部门：{app.department}</Col>
                        <Col span={6}>申请人：{app.applicantName}</Col>
                        <Col span={6}>审批通过：{app.updateTime ? app.updateTime.split('T')[0] : '-'}</Col>
                        <Col span={6} className="truncate">
                          内容摘要：{app.backgroundDesc || '无'}
                        </Col>
                      </Row>
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        )}
      </div>
    </div>
  );
};
