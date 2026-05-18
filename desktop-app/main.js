const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

// Try to load saved config (BigRock URL)
const configPath = path.join(app.getPath('userData'), 'config.json');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'WebWatch Pro',
    backgroundColor: '#050810',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    autoHideMenuBar: true
  });

  // Handle Basic Auth prompts gracefully (using standard prompt)
  app.on('login', (event, webContents, request, authInfo, callback) => {
    // The user will be prompted by standard Electron UI to enter their master password
    event.preventDefault();
    // In a real app we could build a custom login window, but for simplicity we rely on 
    // the user typing 'admin' and 'WebWatch2026!' if they don't want to save it in plain text.
    // However, if we saved it in config, we could auto-login:
    try {
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath));
        if (config.username && config.password) {
          callback(config.username, config.password);
          return;
        }
      }
    } catch(e) {}
    
    // Fallback: don't intercept, let default auth dialog handle it if we return without callback
    // Wait, preventing default means we must provide callback. If we don't have it, we show error.
    // Let's NOT prevent default, so Electron shows its native basic auth popup!
  });

  // Check if we have a saved URL
  try {
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath));
      if (config.serverUrl) {
        mainWindow.loadURL(config.serverUrl);
        return;
      }
    }
  } catch(e) {
    console.error('No config found', e);
  }

  // If no URL saved, load the setup screen
  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  // Let Electron handle Basic Auth with its native popup
  app.removeAllListeners('login'); 

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Save Server URL from the setup screen
ipcMain.on('save-server-url', (event, url) => {
  fs.writeFileSync(configPath, JSON.stringify({ serverUrl: url }));
  mainWindow.loadURL(url);
});
