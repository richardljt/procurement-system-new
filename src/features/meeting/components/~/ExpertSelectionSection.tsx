import React, { useEffect, useState } from 'react';
import { Row, Col, Typography, Avatar, Tag, Empty, Tabs, Select } from 'antd';
import CustomIcon from '../../../../components/common/CustomIcon';
import { Expert } from '../../../../types/expert';
import { getExperts } from '../../../../api/expert';

const { Text } = Typography;

interface ExpertSelectionSectionProps {
  mainExperts?: number[];
  backupExperts?: number[];
  onMainChange?: (ids: number[]) => void;
  onBackupChange?: (ids: number[]) => void;
  readOnly?: boolean;
}

const ExpertCard: React.FC<{
  expert: Expert;
  onRemove: () => void;
  readOnly?: boolean;
  role: string;
}> = ({ expert, onRemove, readOnly, role }) => (
  <div
    style={{
      position: 'relative',
      background: '#fff',
      borderRadius: 8,
      border: '1px solid #e8e8e8',
      padding: 16,
      transition: 'all 0.3s',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      marginTop: 8,
      marginRight: 8
    }}
  >
    {!readOnly && (
      <div 
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        style={{ 
          position: 'absolute', 
          top: -8, 
          right: -8, 
          color: '#ff4d4f', 
          cursor: 'pointer',
          zIndex: 1,
          background: '#fff',
          borderRadius: '50%',
          lineHeight: 1
        }}
      >
        <CustomIcon type="CloseCircleFilled" style={{ fontSize: 20 }} />
      </div>
    )}
    
    <Avatar 
      size={64} 
      src={expert.avatar} 
      icon={<CustomIcon type="UserOutlined" />} 
      style={{ marginBottom: 12, border: '1px solid #f0f0f0' }}
    />
    
    <Text strong style={{ fontSize: 16, marginBottom: 4 }}>{expert.name}</Text>
    <Text type="secondary" style={{ fontSize: 12, marginBottom: 8 }}>{expert.department} - {expert.level}</Text>
    
    <div style={{ marginBottom: 12 }}>
      <Tag color="blue">{role}</Tag>
    </div>
    
    <div style={{ 
      background: '#f9f9f9', 
      width: '100%', 
      padding: '8px 0', 
      borderRadius: 4,
      fontSize: 12,
      color: '#666'
    }}>
      {expert.industries}
    </div>
  </div>
);

export const ExpertSelectionSection: React.FC<ExpertSelectionSectionProps> = ({
  mainExperts = [],
  backupExperts = [],
  onMainChange,
  onBackupChange,
  readOnly = false
}) => {
  const [allExperts, setAllExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExperts();
  }, []);

  const fetchExperts = async () => {
    setLoading(true);
    try {
      const data = await getExperts();
      setAllExperts(data);
    } catch (error) {
      console.error('Failed to fetch experts', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = (
    pool: Expert[],
    selectedIds: number[],
    onChange: ((ids: number[]) => void) | undefined,
    placeholder: string,
    roleLabel: string
  ) => {
    const selectedExperts = pool.filter(e => selectedIds.includes(e.expertId));
    
    // Filter out experts that are already selected in either list to avoid duplicates across main/backup if needed
    // But usually one person can't be both main and backup. 
    // Let's filter out experts already selected in CURRENT list for the dropdown options.
    // Ideally should also exclude experts selected in the OTHER list.
    const allSelectedIds = [...mainExperts, ...backupExperts];
    
    const options = pool
      .filter(e => !allSelectedIds.includes(e.expertId))
      .map(e => ({
        value: e.expertId,
        label: `${e.name} - ${e.department} (${e.level})`,
        expert: e
      }));

    return (
      <div style={{ padding: 16, background: '#f5f7fa', borderRadius: 8, border: '1px solid #eee' }}>
        {!readOnly && (
          <div style={{ marginBottom: 16 }}>
            <Select
              showSearch
              style={{ width: 400 }}
              placeholder={placeholder}
              optionFilterProp="label"
              loading={loading}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              onChange={(value) => {
                if (onChange) {
                  onChange([...selectedIds, value]);
                }
              }}
              options={options}
              suffixIcon={<CustomIcon type="SearchOutlined" />}
              size="large"
            />
          </div>
        )}

        {selectedExperts.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={readOnly ? "暂无专家" : "暂无已选专家，请搜索添加"} />
        ) : (
          <Row gutter={[16, 16]}>
            {selectedExperts.map(expert => (
              <Col xs={12} sm={8} md={6} lg={4} key={expert.expertId}>
                <ExpertCard 
                  expert={expert} 
                  readOnly={readOnly}
                  role={roleLabel}
                  onRemove={() => {
                    if (onChange && !readOnly) {
                      onChange(selectedIds.filter(id => id !== expert.expertId));
                    }
                  }}
                />
              </Col>
            ))}
          </Row>
        )}
      </div>
    );
  };

  const items = [
    {
      key: 'main',
      label: (
        <span>
          正选专家 
          <span style={{ 
            background: '#e6f7ff', 
            color: '#1890ff', 
            padding: '2px 8px', 
            borderRadius: 10, 
            fontSize: 12, 
            marginLeft: 8 
          }}>
            {mainExperts.length}
          </span>
        </span>
      ),
      children: renderTabContent(
        allExperts, 
        mainExperts, 
        onMainChange, 
        "搜索并添加正选专家...",
        "正选专家"
      ),
    },
    {
      key: 'backup',
      label: (
        <span>
          备选专家
          <span style={{ 
            background: '#f6ffed', 
            color: '#52c41a', 
            padding: '2px 8px', 
            borderRadius: 10, 
            fontSize: 12, 
            marginLeft: 8 
          }}>
            {backupExperts.length}
          </span>
        </span>
      ),
      children: renderTabContent(
        allExperts, 
        backupExperts, 
        onBackupChange, 
        "搜索并添加备选专家...",
        "备选专家"
      ),
    },
  ];

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ fontSize: 16 }}>评审专家</Text>
        <Text type="secondary" style={{ marginLeft: 8, fontSize: 14 }}>
          请选择参与评审的专家成员，建议配置备选专家以防正选专家时间冲突
        </Text>
      </div>

      <Tabs defaultActiveKey="main" items={items} type="card" />
    </div>
  );
};
