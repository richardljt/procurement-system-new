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
    className="relative h-full w-full rounded-lg border border-gray-200 bg-white p-4 text-center transition-all mt-2 mr-2 flex flex-col items-center"
  >
    {!readOnly && (
      <div 
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute -top-2 -right-2 text-red-500 cursor-pointer z-10 bg-white rounded-full leading-none"
      >
        <CustomIcon type="CloseCircleFilled" className="text-xl" />
      </div>
    )}
    
    <Avatar 
      size={64} 
      src={expert.avatar} 
      icon={<CustomIcon type="UserOutlined" />} 
      className="mb-3 border border-gray-100"
    />
    
    <Text strong className="text-base mb-1">{expert.name}</Text>
    <Text type="secondary" className="text-xs mb-2">{expert.department} - {expert.level}</Text>
    
    <div className="mb-3">
      <Tag color="blue">{role}</Tag>
    </div>
    
    <div className="bg-gray-50 w-full p-2 rounded text-xs text-gray-600">
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
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        {!readOnly && (
          <div className="mb-4">
            <Select
              showSearch
              className="w-[400px]"
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
          <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs ml-2">
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
          <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs ml-2">
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
    <div className="mb-6">
      <div className="mb-4">
        <Text strong className="text-base">评审专家</Text>
        <Text type="secondary" className="ml-2 text-sm">
          请选择参与评审的专家成员，建议配置备选专家以防正选专家时间冲突
        </Text>
      </div>

      <Tabs defaultActiveKey="main" items={items} type="card" />
    </div>
  );
};
