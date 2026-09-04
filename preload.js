const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  generateFile: () => ipcRenderer.invoke('generate-file'),
  revealFile: (path) => ipcRenderer.invoke('reveal-file', path),
  onProgress: (fn) => {
    ipcRenderer.on('progress', (event, data) => fn(data));
  },
  getAssetPath: (assetName) => ipcRenderer.invoke('get-asset-path', assetName)
});
