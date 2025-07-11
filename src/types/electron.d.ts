export interface ElectronAPI {
  getClipboard: () => Promise<string>;
  setClipboard: (text: string) => Promise<boolean>;
  clearClipboardHistory: () => Promise<boolean>;
  startClipboardMonitoring: () => Promise<boolean>;
  stopClipboardMonitoring: () => Promise<boolean>;
  onClipboardChange: (callback: (text: string) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
