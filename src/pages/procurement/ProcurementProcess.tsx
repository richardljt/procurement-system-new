import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Check, Clock, FileText, MessageSquare, Bell, Eye, Building, Users, Circle, 
    FileSignature, Download, Printer, ArrowLeft, Plus, Trash2, Edit
} from 'lucide-react';
import { getProcessStatus, createContract, updateContract, deleteContract } from '../../api/process';
import { ProcessStatusDTO, Contract } from '../../types/process';
import { Button, message, Modal, Form, Input, DatePicker, InputNumber, Upload } from 'antd';
import dayjs from 'dayjs';

const ProcurementProcess: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [status, setStatus] = useState<ProcessStatusDTO | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Contract Modal
    const [isContractModalOpen, setIsContractModalOpen] = useState(false);
    const [contractForm] = Form.useForm();
    const [editingContract, setEditingContract] = useState<Contract | null>(null);

    useEffect(() => {
        if (id) {
            fetchStatus();
        }
    }, [id]);

    const fetchStatus = async () => {
        try {
            setLoading(true);
            const res = await getProcessStatus(id!);
            setStatus(res);
        } catch (error) {
            console.error(error);
            message.error('获取流程状态失败');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (statusStr: string) => {
        switch (statusStr) {
            case 'COMPLETED': return 'green';
            case 'IN_PROGRESS': return 'blue';
            default: return 'gray';
        }
    };

    const renderIcon = (statusStr: string, icon: React.ReactNode) => {
        const color = getStatusColor(statusStr);
        const bgClass = color === 'green' ? 'bg-green-500 border-green-500' : 
                        color === 'blue' ? 'bg-blue-500 border-blue-500' : 'bg-gray-300 border-gray-300';
        
        return (
            <div className={`relative z-10 flex items-center justify-center w-12 h-12 ${bgClass} rounded-full border-4 border-white shadow-sm`}>
                {statusStr === 'COMPLETED' ? <Check className="text-white w-6 h-6" /> : 
                 statusStr === 'IN_PROGRESS' ? <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div> :
                 <Circle className="text-gray-500 w-4 h-4 fill-current" />}
            </div>
        );
    };

    const renderCardStyle = (statusStr: string) => {
        const color = getStatusColor(statusStr);
        if (color === 'green') return 'bg-green-50 border-green-200';
        if (color === 'blue') return 'bg-blue-50 border-blue-200';
        return 'bg-gray-50 border-gray-200';
    };

    const handleContractSubmit = async (values: any) => {
        try {
            const data: Contract = {
                ...values,
                procurementRequestId: Number(id),
                signingDate: values.signingDate.format('YYYY-MM-DD HH:mm:ss'),
                status: 'SIGNED',
                contractId: editingContract?.contractId
            };
            
            if (editingContract) {
                await updateContract(data);
                message.success('合同更新成功');
            } else {
                await createContract(data);
                message.success('合同创建成功');
            }
            setIsContractModalOpen(false);
            fetchStatus();
        } catch (error) {
            message.error('操作失败');
        }
    };

    const handleDeleteContract = async (contractId: number) => {
        try {
            await deleteContract(contractId);
            message.success('合同删除成功');
            fetchStatus();
        } catch (error) {
            message.error('删除失败');
        }
    };

    if (loading) return <div className="p-8 text-center">加载中...</div>;
    if (!status) return <div className="p-8 text-center">未找到数据</div>;

    const request = status.stage1.data;
    const meeting = status.stage2.data;
    const bid = status.stage3.data;
    const evaluation = status.stage4.data;
    const contract = status.stage5.data;

    return (
        <div className="flex flex-col h-full bg-gray-50 overflow-y-auto">
            <div className="p-8">
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-4">
                            <Button icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>返回</Button>
                            <h1 className="text-2xl font-semibold text-gray-800">采购申请流程详情</h1>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center">
                                <Download className="w-4 h-4 mr-2" />导出
                            </button>
                            <button className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center">
                                <Printer className="w-4 h-4 mr-2" />打印
                            </button>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 ml-20">申请单号：{request?.requestCode} | 创建时间：{request?.createTime}</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
                    <div className="relative">
                        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-200"></div>
                        
                        <div className="relative space-y-6">
                            {/* Stage 1: Application */}
                            <div className="flex items-start">
                                {renderIcon(status.stage1.status, null)}
                                <div className={`ml-6 flex-1 border rounded-lg p-4 ${renderCardStyle(status.stage1.status)}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-base font-semibold text-gray-800">集采申请提交</h3>
                                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${status.stage1.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {status.stage1.status === 'COMPLETED' ? '已完成' : '进行中'}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 mb-3">
                                        <span className="font-medium">{request?.applicantName}</span>
                                        <span className="mx-2 text-gray-400">·</span>
                                        <span className="text-gray-500">{request?.createTime}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">{request?.title}</p>
                                    
                                    <div className="bg-white rounded border border-gray-200 p-3 mb-3">
                                        <div className="flex items-start mb-2">
                                            <span className="text-xs font-semibold text-gray-600 w-24">供应商类型：</span>
                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                                                {request?.supplierSelectionType === 'CANDIDATE' ? '候选供应商' : 
                                                 request?.supplierSelectionType === 'SINGLE' ? '单一来源' : 
                                                 request?.supplierSelectionType === 'PUBLIC' ? '公开招标' : request?.supplierSelectionType}
                                            </span>
                                        </div>
                                        <div className="flex items-start mb-2">
                                            <span className="text-xs font-semibold text-gray-600 w-24">候选供应商：</span>
                                            <div className="flex-1 text-xs text-gray-700">
                                                {request?.supplierList?.map((s, idx) => (
                                                    <span key={s.supplierId} className="inline-block mr-2">
                                                        {s.supplierName}{idx < (request.supplierList?.length || 0) - 1 ? '、' : ''}
                                                    </span>
                                                )) || '无'}
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <span className="text-xs font-semibold text-gray-600 w-24">当前审核人：</span>
                                            <span className="text-xs text-gray-700">{request?.currentApprover || '无'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stage 2: Review Meeting */}
                            <div className="flex items-start">
                                {renderIcon(status.stage2.status, null)}
                                <div className={`ml-6 flex-1 border rounded-lg p-4 ${renderCardStyle(status.stage2.status)}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-base font-semibold text-gray-800">需求评审会</h3>
                                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${status.stage2.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : status.stage2.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>
                                            {status.stage2.status === 'COMPLETED' ? '已完成' : status.stage2.status === 'IN_PROGRESS' ? '进行中' : '未开始'}
                                        </span>
                                    </div>
                                    {meeting ? (
                                        <div className="space-y-2">
                                            <p className="text-sm text-gray-600">评审会：{meeting.title}</p>
                                            <p className="text-sm text-gray-500">时间：{meeting.startTime}</p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">等待安排评审会</p>
                                    )}
                                </div>
                            </div>

                            {/* Stage 3: Bidding */}
                            <div className="flex items-start">
                                {renderIcon(status.stage3.status, null)}
                                <div className={`ml-6 flex-1 border rounded-lg p-4 ${renderCardStyle(status.stage3.status)}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-base font-semibold text-gray-800">供应商投标</h3>
                                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${status.stage3.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : status.stage3.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>
                                             {status.stage3.status === 'COMPLETED' ? '已完成' : status.stage3.status === 'IN_PROGRESS' ? '进行中' : '未开始'}
                                        </span>
                                    </div>
                                    {bid ? (
                                        <div className="space-y-2">
                                            <p className="text-sm text-gray-600">招标项目：{bid.title}</p>
                                            <p className="text-sm text-gray-500">截止时间：{bid.deadline}</p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">等待发起招标</p>
                                    )}
                                </div>
                            </div>

                            {/* Stage 4: Evaluation Meeting */}
                            <div className="flex items-start">
                                {renderIcon(status.stage4.status, null)}
                                <div className={`ml-6 flex-1 border rounded-lg p-4 ${renderCardStyle(status.stage4.status)}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-base font-semibold text-gray-800">开评标会</h3>
                                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${status.stage4.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : status.stage4.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>
                                             {status.stage4.status === 'COMPLETED' ? '已完成' : status.stage4.status === 'IN_PROGRESS' ? '进行中' : '未开始'}
                                        </span>
                                    </div>
                                    {evaluation ? (
                                        <div className="space-y-2">
                                            <p className="text-sm text-gray-600">评标项目：{evaluation.title}</p>
                                            <p className="text-sm text-gray-500">状态：{evaluation.status}</p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">等待开标</p>
                                    )}
                                </div>
                            </div>

                            {/* Stage 5: Contract */}
                            <div className="flex items-start">
                                {renderIcon(status.stage5.status, null)}
                                <div className={`ml-6 flex-1 border rounded-lg p-4 ${renderCardStyle(status.stage5.status)}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-base font-semibold text-gray-800">合同签署</h3>
                                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${status.stage5.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : status.stage5.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>
                                             {status.stage5.status === 'COMPLETED' ? '已完成' : status.stage5.status === 'IN_PROGRESS' ? '进行中' : '未开始'}
                                        </span>
                                    </div>
                                    
                                    {contract ? (
                                        <div className="space-y-3">
                                            <div className="bg-white rounded border p-3">
                                                <div className="flex items-start mb-2">
                                                    <span className="text-xs font-semibold text-gray-600 w-24">合同名称：</span>
                                                    <span className="text-sm text-gray-800">{contract.contractName}</span>
                                                </div>
                                                <div className="flex items-start mb-2">
                                                    <span className="text-xs font-semibold text-gray-600 w-24">合同编号：</span>
                                                    <span className="text-sm text-gray-800">{contract.contractCode}</span>
                                                </div>
                                                <div className="flex items-start mb-2">
                                                    <span className="text-xs font-semibold text-gray-600 w-24">金额：</span>
                                                    <span className="text-sm text-gray-800">¥{contract.amount}</span>
                                                </div>
                                                <div className="flex items-start">
                                                    <span className="text-xs font-semibold text-gray-600 w-24">签署日期：</span>
                                                    <span className="text-sm text-gray-800">{contract.signingDate}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="small" icon={<Edit size={14} />} onClick={() => {
                                                    setEditingContract(contract);
                                                    contractForm.setFieldsValue({
                                                        ...contract,
                                                        signingDate: dayjs(contract.signingDate)
                                                    });
                                                    setIsContractModalOpen(true);
                                                }}>编辑</Button>
                                                <Button size="small" danger icon={<Trash2 size={14} />} onClick={() => handleDeleteContract(contract.contractId!)}>删除</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-sm text-gray-500 mb-2">待评标完成后，在此上传签署的合同。</p>
                                            {/* Allow adding contract if previous stages are done (simplified logic: if stage 4 is completed or at least in progress) */}
                                            {(status.stage4.status === 'COMPLETED' || true) && (
                                                <Button type="primary" icon={<Plus size={16} />} onClick={() => {
                                                    setEditingContract(null);
                                                    contractForm.resetFields();
                                                    setIsContractModalOpen(true);
                                                }}>
                                                    录入合同信息
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                title={editingContract ? "编辑合同" : "录入合同"}
                open={isContractModalOpen}
                onCancel={() => setIsContractModalOpen(false)}
                footer={null}
            >
                <Form
                    form={contractForm}
                    layout="vertical"
                    onFinish={handleContractSubmit}
                >
                    <Form.Item name="contractName" label="合同名称" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="contractCode" label="合同编号" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="supplierId" label="供应商ID" rules={[{ required: true }]}>
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="amount" label="金额" rules={[{ required: true }]}>
                        <InputNumber style={{ width: '100%' }} prefix="¥" />
                    </Form.Item>
                    <Form.Item name="signingDate" label="签署日期" rules={[{ required: true }]}>
                        <DatePicker showTime style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="attachmentUrl" label="附件链接">
                        <Input placeholder="输入附件URL" />
                    </Form.Item>
                    <div className="flex justify-end gap-2">
                        <Button onClick={() => setIsContractModalOpen(false)}>取消</Button>
                        <Button type="primary" htmlType="submit">保存</Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default ProcurementProcess;
