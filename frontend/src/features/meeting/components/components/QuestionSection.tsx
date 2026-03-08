import React, { useEffect, useState } from 'react';
import { Card, List, Button, Input, Form, Avatar, Tag, Space, message, Upload, Modal } from 'antd';
import { User, MessageCircle, Paperclip, FileText, Trash2 } from 'lucide-react';
import { getQuestions, askQuestion, replyQuestion, deleteQuestion, deleteReply, MeetingQuestion, MeetingReply } from '../../../../api/review';

interface Props {
  meetingId: number;
  userId: string;
  userName: string;
  isAdmin?: boolean;
}

const QuestionSection: React.FC<Props> = ({ meetingId, userId, userName, isAdmin }) => {
  const [questions, setQuestions] = useState<MeetingQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [replyContent, setReplyContent] = useState<Record<number, string>>({});
  const [replyFile, setReplyFile] = useState<Record<number, any>>({}); // Store file per question reply
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [askFile, setAskFile] = useState<any>(null);
  const [form] = Form.useForm();

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await getQuestions(meetingId);
      if (res) setQuestions(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
    const interval = setInterval(fetchQuestions, 5000); // Polling
    return () => clearInterval(interval);
  }, [meetingId]);

  const handleAsk = async (values: any) => {
    try {
      await askQuestion({
        meetingId,
        content: values.content,
        askerId: userId,
        askerName: userName,
        isAnonymous: values.anonymous || false,
        status: 'PENDING',
        attachmentName: askFile?.name,
        attachmentPath: askFile ? '/mock/path/' + askFile.name : undefined
      });
      message.success('提问成功');
      form.resetFields();
      setAskFile(null);
      fetchQuestions();
    } catch (e) {
      message.error('提问失败');
    }
  };

  const handleReply = async (questionId: number) => {
    const content = replyContent[questionId];
    if (!content) return;
    
    const file = replyFile[questionId];

    try {
      await replyQuestion({
        questionId,
        content,
        replierId: userId,
        replierName: userName,
        attachmentName: file?.name,
        attachmentPath: file ? '/mock/path/' + file.name : undefined
      });
      message.success('回复成功');
      setReplyContent({ ...replyContent, [questionId]: '' });
      setReplyFile({ ...replyFile, [questionId]: null });
      setActiveReplyId(null);
      fetchQuestions();
    } catch (e) {
      message.error('回复失败');
    }
  };

  const handleDeleteQuestion = (id: number) => {
      Modal.confirm({
          title: '删除提问',
          content: '确定要删除这条提问及其所有回复吗？',
          onOk: async () => {
              try {
                  await deleteQuestion(id);
                  message.success('删除成功');
                  fetchQuestions();
              } catch (e) {
                  message.error('删除失败');
              }
          }
      });
  };

  const handleDeleteReply = (id: number) => {
      Modal.confirm({
          title: '删除回复',
          content: '确定要删除这条回复吗？',
          onOk: async () => {
              try {
                  await deleteReply(id);
                  message.success('删除成功');
                  fetchQuestions();
              } catch (e) {
                  message.error('删除失败');
              }
          }
      });
  };

  return (
    <Card title="提问答辩区" className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto mb-4 min-h-[300px] max-h-[500px]">
        <List
          dataSource={questions}
          renderItem={item => (
            <List.Item>
              <div className="w-full">
                <div className="flex items-start space-x-3">
                  <Avatar icon={<User />} />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold">{item.isAnonymous ? '匿名用户' : item.askerName}</span>
                        <div className="flex items-center space-x-2">
                             <span className="text-gray-400 text-xs">{item.createTime ? new Date(item.createTime).toLocaleString() : ''}</span>
                             {isAdmin && (
                                 <Button 
                                    type="text" 
                                    size="small" 
                                    className="text-gray-400 hover:text-red-500" 
                                    icon={<Trash2 className="w-3 h-3" />} 
                                    onClick={() => handleDeleteQuestion(item.questionId!)}
                                 />
                             )}
                        </div>
                    </div>
                    <p className="mt-1 text-gray-800">{item.content}</p>
                    {item.attachmentName && (
                        <div className="mt-1 text-xs text-blue-500 flex items-center bg-blue-50 p-1 rounded w-fit">
                            <Paperclip className="w-3 h-3 mr-1" />
                            <a href="#" onClick={e => e.preventDefault()}>{item.attachmentName}</a>
                        </div>
                    )}
                    
                    <div className="mt-2 space-y-2">
                        {item.replies?.map(reply => (
                            <div key={reply.replyId} className="bg-gray-50 p-2 rounded text-sm group relative">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-blue-600">{reply.replierName}</span>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs text-gray-400">{reply.createTime ? new Date(reply.createTime).toLocaleTimeString() : ''}</span>
                                        {isAdmin && (
                                            <Button 
                                                type="text" 
                                                size="small" 
                                                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" 
                                                icon={<Trash2 className="w-3 h-3" />} 
                                                onClick={() => handleDeleteReply(reply.replyId!)}
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="mt-1">{reply.content}</div>
                                {reply.attachmentName && (
                                    <div className="mt-1 text-xs text-blue-500 flex items-center">
                                        <Paperclip className="w-3 h-3 mr-1" />
                                        <span>{reply.attachmentName}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                        <Tag color={item.status === 'ANSWERED' ? 'green' : 'orange'}>
                            {item.status === 'ANSWERED' ? '已回答' : '待回答'}
                        </Tag>
                        <span className="cursor-pointer text-blue-500 flex items-center text-sm" onClick={() => setActiveReplyId(activeReplyId === item.questionId ? null : (item.questionId || null))}>
                            <MessageCircle className="w-3 h-3 mr-1" /> 回复
                        </span>
                    </div>

                    {activeReplyId === item.questionId && (
                        <div className="mt-3 bg-gray-50 p-3 rounded">
                            <Input.TextArea
                                rows={2}
                                value={replyContent[item.questionId || 0]} 
                                onChange={e => setReplyContent({...replyContent, [item.questionId || 0]: e.target.value})}
                                placeholder="输入回复内容..." 
                                className="mb-2"
                            />
                            <div className="flex justify-between items-center">
                                <Upload 
                                    beforeUpload={(file) => {
                                        setReplyFile({...replyFile, [item.questionId || 0]: file});
                                        return false;
                                    }}
                                    showUploadList={false}
                                >
                                    <Button size="small" icon={<Paperclip className="w-3 h-3" />}>
                                        {replyFile[item.questionId || 0] ? replyFile[item.questionId || 0].name : '添加附件'}
                                    </Button>
                                </Upload>
                                <Button type="primary" size="small" onClick={() => handleReply(item.questionId || 0)}>发送回复</Button>
                            </div>
                        </div>
                    )}
                  </div>
                </div>
              </div>
            </List.Item>
          )}
        />
      </div>
      
      <div className="border-t pt-4">
        <Form form={form} onFinish={handleAsk}>
          <Form.Item name="content" rules={[{ required: true, message: '请输入问题' }]}>
            <Input.TextArea rows={3} placeholder="请输入您的问题..." />
          </Form.Item>
          <div className="flex justify-between items-center">
             <Upload 
                beforeUpload={(file) => {
                    setAskFile(file);
                    return false;
                }}
                onRemove={() => setAskFile(null)}
                fileList={askFile ? [askFile] : []}
             >
                <Button icon={<Paperclip className="w-4 h-4" />}>上传附件</Button>
             </Upload>
             <Button type="primary" htmlType="submit">
               提交问题
             </Button>
          </div>
        </Form>
      </div>
    </Card>
  );
};

export default QuestionSection;
