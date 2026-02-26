import useSWR from 'swr';
import { useState } from 'react';
import request from '../utils/request';

// Types (could be shared)
interface EvaluationMessage {
  id: number;
  evaluationId: number;
  supplierId: number;
  senderId: number;
  senderName: string;
  senderRole: string;
  content: string;
  parentId?: number;
  attachmentName?: string;
  attachmentPath?: string;
  createTime: string;
  children?: EvaluationMessage[];
}

const fetcher = (url: string) => request.get(url).then(res => res.data);

export const useMessageSystem = (code: string | undefined, supplierId: number | null, viewStage: 'BUSINESS' | 'PRICE') => {
  const messageKey = code && supplierId ? `/api/evaluation/${code}/messages?supplierId=${supplierId}&stage=${viewStage}` : null;

  const { data: rawMessages, error, mutate: mutateMessages } = useSWR<EvaluationMessage[]>(
    messageKey,
    fetcher,
    { refreshInterval: 5000 }
  );

  // Process raw messages into a tree structure
  const messages = rawMessages ? buildMessageTree(rawMessages) : [];

  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [replyContents, setReplyContents] = useState<Record<number, string>>({});
  const [messageInput, setMessageInput] = useState('');

  const sendMessage = async (content: string, parentId?: number) => {
    if (!content.trim() || !code || !supplierId) return;

    try {
      await request.post(`/api/evaluation/${code}/message/send`, {
        content,
        parentId,
        supplierId,
        // Other necessary fields like senderName, senderRole should be passed or retrieved from a context
        senderName: 'Current User', 
        senderRole: 'EXPERT',
      });
      // Mutate to re-fetch messages
      mutateMessages();
      // Reset inputs
      if (parentId) {
        setReplyContents(prev => ({ ...prev, [parentId]: '' }));
        setActiveReplyId(null);
      } else {
        setMessageInput('');
      }
    } catch (err) {
      console.error("Failed to send message", err);
      // Handle error (e.g., show a notification)
    }
  };

  const deleteMessage = async (id: number) => {
    if (!code) return;
    try {
      await request.delete(`/api/evaluation/${code}/message/${id}`);
      mutateMessages();
    } catch (err) {
      console.error("Failed to delete message", err);
    }
  };

  return {
    messages,
    isLoading: !error && !rawMessages,
    isError: error,
    mutateMessages,
    activeReplyId,
    setActiveReplyId,
    replyContents,
    setReplyContents,
    messageInput,
    setMessageInput,
    sendMessage,
    deleteMessage,
  };
};

// Helper to build tree, can be moved to a utils file
function buildMessageTree(messages: EvaluationMessage[]): EvaluationMessage[] {
    const messageMap = new Map<number, EvaluationMessage>();
    const roots: EvaluationMessage[] = [];

    messages.forEach(msg => {
        msg.children = [];
        messageMap.set(msg.id, msg);
    });

    messages.forEach(msg => {
        if (msg.parentId) {
            const parent = messageMap.get(msg.parentId);
            if (parent) {
                parent.children = parent.children || [];
                parent.children.push(msg);
            } else {
                roots.push(msg);
            }
        } else {
            roots.push(msg);
        }
    });

    roots.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
    messageMap.forEach(msg => {
        if (msg.children && msg.children.length > 0) {
            msg.children.sort((a, b) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime());
        }
    });

    return roots;
}
