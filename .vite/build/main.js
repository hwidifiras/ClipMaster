"use strict";
const { app, BrowserWindow, clipboard, ipcMain } = require("electron");
const path = require("path");
const createWindow = () => {
  const mainWindow = new BrowserWindow({
    height: 800,
    width: 1200,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true
    },
    show: false
    // Don't show until ready
  });
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    if (process.env.NODE_ENV === "development") {
      mainWindow.webContents.openDevTools();
    }
  });
  let lastClipboardContent = "";
  let clipboardMonitor = null;
  const startClipboardMonitoring = () => {
    clipboardMonitor = setInterval(() => {
      const currentContent = clipboard.readText();
      if (currentContent && currentContent !== lastClipboardContent) {
        lastClipboardContent = currentContent;
        mainWindow.webContents.send("clipboard-change", currentContent);
      }
    }, 500);
  };
  mainWindow.on("closed", () => {
    if (clipboardMonitor) {
      clearInterval(clipboardMonitor);
    }
  });
  ipcMain.handle("get-clipboard", () => {
    return clipboard.readText();
  });
  ipcMain.handle("set-clipboard", (_event, text) => {
    clipboard.writeText(text);
    lastClipboardContent = text;
    return true;
  });
  ipcMain.handle("clear-clipboard-history", () => {
    lastClipboardContent = "";
    return true;
  });
  ipcMain.handle("start-clipboard-monitoring", () => {
    startClipboardMonitoring();
    return true;
  });
  ipcMain.handle("stop-clipboard-monitoring", () => {
    if (clipboardMonitor) {
      clearInterval(clipboardMonitor);
      clipboardMonitor = null;
    }
    return true;
  });
  {
    console.log("Loading development URL:", "http://localhost:5173");
    mainWindow.loadURL("http://localhost:5173");
  }
  mainWindow.webContents.on("crashed", () => {
    console.error("Renderer process crashed");
  });
  mainWindow.webContents.on("unresponsive", () => {
    console.error("Renderer process became unresponsive");
  });
  mainWindow.webContents.on("did-fail-load", (_event, errorCode, errorDescription, validatedURL) => {
    console.error("Failed to load page:", errorCode, errorDescription, validatedURL);
  });
};
app.on("ready", createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
//# sourceMappingURL=main.js.map
