"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  // Add your API methods here
  getClipboard: () => electron.ipcRenderer.invoke("get-clipboard"),
  setClipboard: (text) => electron.ipcRenderer.invoke("set-clipboard", text),
  onClipboardChange: (callback) => {
    electron.ipcRenderer.on("clipboard-change", (_, text) => callback(text));
  }
});
