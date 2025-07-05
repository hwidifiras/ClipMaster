// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Add your API methods here
  getClipboard: () => ipcRenderer.invoke('get-clipboard'),
  setClipboard: (text: string) => ipcRenderer.invoke('set-clipboard', text),
  onClipboardChange: (callback: (text: string) => void) => {
    ipcRenderer.on('clipboard-change', (_, text) => callback(text));
  }
});
