import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Tag, Checkbox, Space, Empty, Spin } from 'antd';
import request from '../../utils/request';

const { Text, Title } = Typography;

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
    <div style={{ marginBottom: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ fontSize: 16 }}>关联采购申请</Text>
        {!readOnly && (
          <Text type="secondary" style={{ marginLeft: 8, fontSize: 14 }}>
            请选择需要进行评审的采购申请项目
          </Text>
        )}
      </div>

      <div style={{ 
        background: '#f5f7fa', 
        padding: 16, 
        borderRadius: 8,
        border: '1px solid #eee' 
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 24 }}>
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
                    style={{
                      background: '#fff',
                      borderRadius: 8,
                      border: isSelected ? '1px solid #1890ff' : '1px solid #e8e8e8',
                      padding: 16,
                      cursor: readOnly ? 'default' : 'pointer',
                      transition: 'all 0.3s',
                      display: 'flex',
                      alignItems: 'center',
                      boxShadow: isSelected ? '0 2px 8px rgba(24, 144, 255, 0.15)' : 'none'
                    }}
                  >
                    {!readOnly && (
                        <Checkbox 
                        checked={isSelected} 
                        style={{ marginRight: 16 }}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleSelect(app.procurementRequestId, e.target.checked)}
                        />
                    )}
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Space>
                          <Text strong style={{ fontSize: 15 }}>{app.title}</Text>
                          <Tag color="blue">{app.requestCode}</Tag>
                        </Space>
                        <Text strong style={{ color: '#f5222d' }}>¥ {app.amount?.toLocaleString()}</Text>
                      </div>
                      
                      <Row gutter={16} style={{ fontSize: 13, color: '#666' }}>
                        <Col span={6}>申请部门：{app.department}</Col>
                        <Col span={6}>申请人：{app.applicantName}</Col>
                        <Col span={6}>审批通过：{app.updateTime ? app.updateTime.split('T')[0] : '-'}</Col>
                        <Col span={6} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
