import { useEffect } from 'react';

/**
 * Custom hook for setting document title
 * @param title - The title to set (without the app name suffix)
 * @param showAppName - Whether to append the app name to the title
 */
export const useDocumentTitle = (title: string, showAppName: boolean = true) => {
  const appName = '采购管理系统';
  
  useEffect(() => {
    const fullTitle = showAppName ? `${title} - ${appName}` : title;
    document.title = fullTitle;
    
    // Cleanup function to restore default title when component unmounts
    return () => {
      document.title = appName;
    };
  }, [title, showAppName]);
};

export default useDocumentTitle;