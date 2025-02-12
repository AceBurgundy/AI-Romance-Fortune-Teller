/* eslint-disable no-undef */

const { app, BrowserWindow, ipcMain } = require('electron');
const { join, resolve } = require('path');
const squirrelStartup = require('electron-squirrel-startup');
const { existsSync } = require('fs');

let icon;

if (squirrelStartup) app.quit();

switch (process.platform) {
  case 'win32':
    icon = resolve(__dirname, '../src/assets/logo', 'switch.ico');
    break;
  case 'darwin':
    icon = resolve(__dirname, '../src/assets/logo', 'switch.icns');
    break;
  case 'linux':
    icon = resolve(__dirname, '../src/assets/logo', 'switch.png');
    break;
}

const createWindow = () => {
  const window = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      preload: join(__dirname, 'preload.js'),
      devTools: true
    },
    minHeight: 540,
    minWidth: 720,
    height: 720,
    width: 1080,
    enableBlinkFeatures: 'Autofill',
    autoHideMenuBar: true,
    fullscreen: true,
    icon,
    show: false
  });

  window.loadFile(
      join(__dirname, 'index.html')
  );

  window.webContents.openDevTools();

  window.once('ready-to-show', () => {
    window.maximize();
    window.show();
  });

  window.on('resize', () =>
    window.webContents.send('window-resize', [window.getBounds().width, window.getBounds().height])
  );

  ipcMain.handle('window-bounds', () =>
    [window.getBounds().width, window.getBounds().height]
  );
};

app.on('ready', () => {
  const views = join(__dirname, './scripts/backend/view.js');

  if (existsSync(views) === true) {
    require(views);
  }

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

process.on('uncaughtException', error => {
  console.log(error.stack);
  app.quit();
});

process.on('unhandledRejection', reason => {
  console.log(reason);
  app.quit();
});
