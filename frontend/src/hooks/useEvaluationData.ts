import useSWR from 'swr';
import request from '../utils/request';

// Re-using the type from the component file
// In a real large-scale app, this would be in a dedicated types file.
interface EvaluationDetail {
  id: number;
  projectCode: string;
  title: string;
  status: string;
  currentStage: string;
  organizerName: string;
  suppliers: any[]; // Simplified for the hook
  experts: any[];
  scores: any[];
  logs: any[];
  feedbacks: any[];
}

// The fetcher function for SWR
const fetcher = (url: string): Promise<EvaluationDetail> => request.get(url);

export const useEvaluationData = (code: string | undefined) => {
  const { data, error, isLoading, mutate } = useSWR<EvaluationDetail>(
    // Only fetch if the code is available
    code ? `/api/evaluation/${code}` : null,
    fetcher,
    {
      // Set a refresh interval for polling, e.g., every 5 seconds
      refreshInterval: 5000,
      // Optional: revalidate on focus for immediate updates when user returns to the tab
      revalidateOnFocus: true, 
    }
  );

  return {
    data,
    isLoading,
    isError: error,
    mutate, // Expose mutate for manual re-fetching if needed
  };
};
