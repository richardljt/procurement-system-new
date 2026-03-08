import { useState } from 'react';
import request from '../utils/request';

// Types
interface ScoreFormState {
  tech: { completeness: number; innovation: number; feasibility: number };
  qual: { certificate: number; cases: number };
  service: { content: number; response: number };
  other: { credit: number };
  price: { score: number };
  comment: string;
}

const defaultScoreState: ScoreFormState = {
  tech: { completeness: 0, innovation: 0, feasibility: 0 },
  qual: { certificate: 0, cases: 0 },
  service: { content: 0, response: 0 },
  other: { credit: 0 },
  price: { score: 0 },
  comment: ''
};

export const useScoring = (evaluationData: any, currentExpertId: number) => {
  const [scores, setScores] = useState<ScoreFormState>(defaultScoreState);
  const [scoreCache, setScoreCache] = useState<Record<number, ScoreFormState>>({});
  const [isEditing, setIsEditing] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateTotalScore = (viewStage: 'BUSINESS' | 'PRICE') => {
    if (viewStage === 'PRICE') {
      return scores.price?.score || 0;
    }
    const { tech, qual, service, other } = scores;
    return (
      (tech?.completeness || 0) + (tech?.innovation || 0) + (tech?.feasibility || 0) +
      (qual?.certificate || 0) + (qual?.cases || 0) +
      (service?.content || 0) + (service?.response || 0) +
      (other?.credit || 0)
    );
  };

  const handleSubmitScore = async (activeTab: number, viewStage: 'BUSINESS' | 'PRICE', code: string | undefined, onSuccess: () => void) => {
    if (!activeTab || !code) return;
    if (!confirm('确定要提交评分吗？提交后将计入总分且不可再修改。')) return;

    setIsSubmitting(true);
    try {
      const totalScore = calculateTotalScore(viewStage);
      const details = JSON.stringify(scores);

      await request.post(`/api/evaluation/${code}/score`, {
        supplierId: activeTab,
        score: totalScore,
        details: details,
        comment: scores.comment,
        expertId: currentExpertId,
        stage: viewStage,
      });

      alert('评分提交成功！');
      setScoreCache(prev => {
        const newCache = { ...prev };
        delete newCache[activeTab];
        return newCache;
      });
      setIsEditing(false);
      onSuccess(); // Callback to trigger main data refetch
    } catch (err) {
      console.error(err);
      alert('提交失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    scores,
    setScores,
    scoreCache,
    setScoreCache,
    isEditing,
    setIsEditing,
    isSubmitting,
    calculateTotalScore,
    handleSubmitScore,
    defaultScoreState,
  };
};
