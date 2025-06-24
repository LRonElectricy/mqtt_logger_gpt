const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');

const store = new Store({name: 'settings'});

const logPath = path.join(__dirname, 'data', 'log.json');

function ensureLogFile() {
  if (!fs.existsSync(logPath)) {
    fs.mkdirSync(path.dirname(logPath), { recursive: true });
    fs.writeFileSync(logPath, '[]', 'utf-8');
  }
}

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  ensureLogFile();
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('get-settings', () => {
  return store.store;
});

ipcMain.handle('save-setting', (event, key, value) => {
  store.set(key, value);
});

ipcMain.handle('append-log', (event, entry) => {
  ensureLogFile();
  const content = JSON.parse(fs.readFileSync(logPath, 'utf-8'));
  content.push(entry);
  fs.writeFileSync(logPath, JSON.stringify(content, null, 2));
});

ipcMain.handle('export-log', () => {
  ensureLogFile();
  const content = fs.readFileSync(logPath, 'utf-8');
  const name = `log-export_${new Date().toISOString().slice(0,10).replace(/-/g,'')}.json`;
  const exportPath = path.join(__dirname, 'data', name);
  fs.writeFileSync(exportPath, content);
  return exportPath;
});
