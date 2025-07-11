"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  // Clipboard operations
  getClipboard: () => electron.ipcRenderer.invoke("get-clipboard"),
  setClipboard: (text) => electron.ipcRenderer.invoke("set-clipboard", text),
  clearClipboardHistory: () => electron.ipcRenderer.invoke("clear-clipboard-history"),
  // Clipboard monitoring
  startClipboardMonitoring: () => electron.ipcRenderer.invoke("start-clipboard-monitoring"),
  stopClipboardMonitoring: () => electron.ipcRenderer.invoke("stop-clipboard-monitoring"),
  // Listen for clipboard changes
  onClipboardChange: (callback) => {
    const listener = (_event, text) => callback(text);
    electron.ipcRenderer.on("clipboard-change", listener);
    return () => electron.ipcRenderer.removeListener("clipboard-change", listener);
  }
});
