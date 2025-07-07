import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';

interface ClipboardItem {
  id: string;
  content: string;
  timestamp: Date;
  isFavorite: boolean;
  type: 'text' | 'code' | 'url';
  language?: string | null;
  confidence?: number;
}

export const useClipboard = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [history, setHistory] = useState<ClipboardItem[]>([]);
  const toast = useToast();

  // Check if we're in Electron environment
  const isElectron = typeof window !== 'undefined' && window.electronAPI;

  // Start clipboard monitoring
  const startMonitoring = useCallback(async () => {
    if (!isElectron) return false;
    
    try {
      await window.electronAPI.startClipboardMonitoring();
      setIsMonitoring(true);
      
      toast({
        title: "Clipboard monitoring started",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      
      return true;
    } catch (error) {
      console.error('Failed to start clipboard monitoring:', error);
      toast({
        title: "Failed to start monitoring",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }
  }, [isElectron, toast]);

  // Stop clipboard monitoring
  const stopMonitoring = useCallback(async () => {
    if (!isElectron) return false;
    
    try {
      await window.electronAPI.stopClipboardMonitoring();
      setIsMonitoring(false);
      
      toast({
        title: "Clipboard monitoring stopped",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
      
      return true;
    } catch (error) {
      console.error('Failed to stop clipboard monitoring:', error);
      return false;
    }
  }, [isElectron, toast]);

  // Get current clipboard content
  const getCurrentClipboard = useCallback(async (): Promise<string> => {
    if (!isElectron) return '';
    
    try {
      return await window.electronAPI.getClipboard();
    } catch (error) {
      console.error('Failed to get clipboard:', error);
      return '';
    }
  }, [isElectron]);

  // Set clipboard content
  const setClipboard = useCallback(async (text: string): Promise<boolean> => {
    if (!isElectron) {
      // Fallback to browser clipboard API
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        console.error('Failed to set clipboard:', error);
        return false;
      }
    }
    
    try {
      return await window.electronAPI.setClipboard(text);
    } catch (error) {
      console.error('Failed to set clipboard:', error);
      return false;
    }
  }, [isElectron]);

  // Add item to history
  const addToHistory = useCallback((content: string, detectCodeFn: (content: string) => any) => {
    if (!content.trim()) return null;

    // Detect content type
    const getContentType = (content: string) => {
      if (content.startsWith('http://') || content.startsWith('https://')) {
        return { type: 'url' as const };
      }
      const codeDetection = detectCodeFn(content);
      if (codeDetection.isCode) {
        return {
          type: 'code' as const,
          language: codeDetection.language,
          confidence: codeDetection.confidence
        };
      }
      return { type: 'text' as const };
    };

    const contentType = getContentType(content);
    const newItem: ClipboardItem = {
      id: Date.now().toString(),
      content,
      timestamp: new Date(),
      isFavorite: false,
      type: contentType.type,
      language: contentType.language,
      confidence: contentType.confidence
    };

    setHistory(prev => {
      // Check if content already exists to avoid duplicates
      const exists = prev.some(item => item.content === content);
      if (exists) return prev;
      
      // Add new item and keep only last 100 items
      return [newItem, ...prev.slice(0, 99)];
    });

    return newItem;
  }, []);

  // Setup clipboard change listener
  useEffect(() => {
    if (!isElectron) return;

    const cleanup = window.electronAPI.onClipboardChange((content: string) => {
      console.log('Clipboard changed:', content.substring(0, 50) + '...');
      // Note: We'll integrate this with the main app's detectCode function
      // For now, we'll just log it
    });

    return cleanup;
  }, [isElectron]);

  return {
    isElectron,
    isMonitoring,
    history,
    startMonitoring,
    stopMonitoring,
    getCurrentClipboard,
    setClipboard,
    addToHistory,
    setHistory
  };
};
