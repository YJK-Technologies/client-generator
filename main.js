// const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
// const path = require('path');
// const { exec } = require('child_process');
// const crypto = require('crypto');
// const fs = require('fs');

// // IMPORTANT: Replace this passphrase with a secure value from env when packaging.
// const PASSPHRASE = process.env.CLIENT_GEN_PASSPHRASE || "Chanakya";
// const AES_KEY = crypto.createHash('sha256').update(String(PASSPHRASE)).digest(); // 32 bytes

// function createWindow() {
//   const win = new BrowserWindow({
//     width: 560,
//     height: 420,
//     webPreferences: {
//       preload: path.join(__dirname, 'preload.js'),
//       contextIsolation: true,
//       nodeIntegration: false
//     }
//   });

//   win.removeMenu();
//   win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
// }

// app.whenReady().then(createWindow);

// app.on('window-all-closed', () => app.quit());

// function getHostname() {
//   return Promise.resolve(require('os').hostname());
// }

// const getSerialNumber = () => {
//   return new Promise((resolve) => {
//     const platform = process.platform;
//     if (platform === 'win32') {
//       exec('wmic bios get serialnumber', (err, stdout) => {
//         if (!err && stdout.includes('SerialNumber')) {
//           const lines = stdout.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
//           if (lines.length >= 2) return resolve(lines[1]);
//         }
//         // fallback to powershell
//         exec('powershell "(Get-WmiObject Win32_BIOS).SerialNumber"', (err2, stdout2) => {
//           if (!err2 && stdout2.trim()) return resolve(stdout2.trim());
//           resolve('UNKNOWN_SERIAL');
//         });
//       });
//     } else if (platform === 'linux') {
//       // same as your current logic
//       exec('cat /sys/class/dmi/id/product_serial', (err, stdout) => {
//         if (!err && stdout.trim()) return resolve(stdout.trim());
//         exec('dmidecode -s system-serial-number', (err2, stdout2) => {
//           if (!err2 && stdout2.trim()) return resolve(stdout2.trim());
//           resolve('UNKNOWN_SERIAL');
//         });
//       });
//     } else if (platform === 'darwin') {
//       exec("ioreg -l | awk '/IOPlatformSerialNumber/ { print $4;}'", (err, stdout) => {
//         if (!err && stdout.trim()) return resolve(stdout.replace(/\"|\n/g, '').trim());
//         resolve('UNKNOWN_SERIAL');
//       });
//     } else {
//       resolve('UNKNOWN_SERIAL');
//     }
//   });
// };

// function aesEncrypt(plainText) {
//   const iv = crypto.randomBytes(16);
//   const cipher = crypto.createCipheriv('aes-256-cbc', AES_KEY, iv);
//   let encrypted = cipher.update(plainText, 'utf8', 'base64');
//   encrypted += cipher.final('base64');
//   const payload = iv.toString('base64') + ':' + encrypted;
//   return payload;
// }

// ipcMain.handle('generate-file', async (event) => {
//   try {
//     event.sender.send('progress', { step: 'hostname_start', percent: 10 });
//     const hostname = await getHostname();
//     event.sender.send('progress', { step: 'hostname_done', percent: 25 });

//     event.sender.send('progress', { step: 'serial_start', percent: 30 });
//     const serial = await getSerialNumber();
//     event.sender.send('progress', { step: 'serial_done', percent: 50 });

//     event.sender.send('progress', { step: 'encrypt_start', percent: 55 });
//     const payloadObj = {
//       hostname,
//       serial,
//     };
//     const payloadJson = JSON.stringify(payloadObj, null, 2);
//     const encrypted = aesEncrypt(payloadJson);
//     event.sender.send('progress', { step: 'encrypt_done', percent: 75 });

//     event.sender.send('progress', { step: 'saving_start', percent: 80 });
//     const { canceled, filePath } = await dialog.showSaveDialog({
//       title: 'Save license file (Notepad)',
//       defaultPath: `client-info-${hostname}.txt`,
//       filters: [{ name: 'Text Files', extensions: ['txt'] }]
//     });

//     if (canceled) {
//       event.sender.send('progress', { step: 'cancelled', percent: 0 });
//       return { success: false, message: 'Save cancelled by user' };
//     }

//     fs.writeFileSync(filePath, encrypted, 'utf8');

//     event.sender.send('progress', { step: 'saving_done', percent: 100, path: filePath });
//     return { success: true, filePath };
//   } catch (err) {
//     console.error('Generation error', err);
//     return { success: false, message: err.message || 'Error during generation' };
//   }
// });

// ipcMain.handle('reveal-file', async (event, filePath) => {
//   try {
//     if (filePath && fs.existsSync(filePath)) {
//       shell.showItemInFolder(filePath);
//       return { success: true };
//     } else return { success: false, message: 'File not found' };
//   } catch (err) {
//     return { success: false, message: err.message };
//   }
// });

// main.js (Electron Client Generator App)
const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const { pathToFileURL } = require('url');

const PASSPHRASE = "Yjk";
// const PASSPHRASE = process.env.CLIENT_GEN_PASSPHRASE || "Yjk";
const AES_KEY = crypto.createHash('sha256').update(String(PASSPHRASE)).digest(); // 32 bytes

function createWindow() {
  const win = new BrowserWindow({
    width: 560,
    height: 420,
    title: "Client Info Generator - YJK Technologies",
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.removeMenu();
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());

//Local Run
ipcMain.handle('get-asset-path', (event, assetName) => {
  const assetPath = path.join(__dirname, 'renderer', assetName); 
  return pathToFileURL(assetPath).href;
});

//Exe Run
// ipcMain.handle('get-asset-path', (event, assetName) => {
//   const assetPath = path.join(process.resourcesPath, 'assets', assetName); 
//   return pathToFileURL(assetPath).href;
// });

function getHostname() {
  return Promise.resolve(os.hostname());
}

const getSerialNumber = () => {
  return new Promise((resolve) => {
    const platform = process.platform;
    if (platform === 'win32') {
      exec('wmic bios get serialnumber', (err, stdout) => {
        if (!err && stdout.includes('SerialNumber')) {
          const lines = stdout.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
          if (lines.length >= 2) return resolve(lines[1]);
        }
        // fallback to PowerShell
        exec('powershell "(Get-WmiObject Win32_BIOS).SerialNumber"', (err2, stdout2) => {
          if (!err2 && stdout2.trim()) return resolve(stdout2.trim());
          resolve('UNKNOWN_SERIAL');
        });
      });
    } else if (platform === 'linux') {
      exec('cat /sys/class/dmi/id/product_serial', (err, stdout) => {
        if (!err && stdout.trim()) return resolve(stdout.trim());
        exec('dmidecode -s system-serial-number', (err2, stdout2) => {
          if (!err2 && stdout2.trim()) return resolve(stdout2.trim());
          resolve('UNKNOWN_SERIAL');
        });
      });
    } else if (platform === 'darwin') {
      exec("ioreg -l | awk '/IOPlatformSerialNumber/ { print $4;}'", (err, stdout) => {
        if (!err && stdout.trim()) return resolve(stdout.replace(/\"|\n/g, '').trim());
        resolve('UNKNOWN_SERIAL');
      });
    } else {
      resolve('UNKNOWN_SERIAL');
    }
  });
};

// ====== AES-256-GCM Encryption (Recommended) ======
function aesEncrypt(plainText) {
  const iv = crypto.randomBytes(12); // 12 bytes IV recommended for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', AES_KEY, iv);

  const encrypted = Buffer.concat([
    cipher.update(plainText, 'utf8'),
    cipher.final()
  ]);

  const authTag = cipher.getAuthTag();

  // format: iv:ciphertext:authTag
  return (
    iv.toString('base64') +
    ':' +
    encrypted.toString('base64') +
    ':' +
    authTag.toString('base64')
  );
}

ipcMain.handle('generate-file', async (event) => {
  try {
    event.sender.send('progress', { step: 'hostname_start', percent: 10 });
    const hostname = await getHostname();
    event.sender.send('progress', { step: 'hostname_done', percent: 25 });

    event.sender.send('progress', { step: 'serial_start', percent: 30 });
    const serial = await getSerialNumber();
    event.sender.send('progress', { step: 'serial_done', percent: 50 });

    event.sender.send('progress', { step: 'encrypt_start', percent: 55 });
    const payloadObj = {
      hostname,
      serial,
    };
    const payloadJson = JSON.stringify(payloadObj, null, 2);
    const encrypted = aesEncrypt(payloadJson);
    event.sender.send('progress', { step: 'encrypt_done', percent: 75 });

    event.sender.send('progress', { step: 'saving_start', percent: 80 });
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Save license file',
      defaultPath: `client-info.txt`,
      filters: [{ name: 'Text Files', extensions: ['txt'] }]
    });

    if (canceled) {
      event.sender.send('progress', { step: 'cancelled', percent: 0 });
      return { success: false, message: 'File save cancelled by user' };
    }

    fs.writeFileSync(filePath, encrypted, 'utf8');

    event.sender.send('progress', { step: 'saving_done', percent: 100, path: filePath });
    return { success: true, filePath };
  } catch (err) {
    console.error('Generation error', err);
    return { success: false, message: err.message || 'Error during generation' };
  }
});

ipcMain.handle('reveal-file', async (event, filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      shell.showItemInFolder(filePath);
      return { success: true };
    } else return { success: false, message: 'File not found' };
  } catch (err) {
    return { success: false, message: err.message };
  }
});
