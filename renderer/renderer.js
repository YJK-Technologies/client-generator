const btnGenerate = document.getElementById('btnGenerate');
const progressWrap = document.getElementById('progressWrap');
const progressFill = document.getElementById('progressFill');
const statusText = document.getElementById('statusText');
const afterActions = document.getElementById('afterActions');
const filePathEl = document.getElementById('filePath');
const btnReveal = document.getElementById('btnReveal');
const btnShare = document.getElementById('btnShare');

const logoImg = document.getElementById('logo');

(async () => {
  if (logoImg) {
    const logoUrl = await window.electronAPI.getAssetPath('./logo.png');
    logoImg.src = logoUrl;
  }
})();

let savedFilePath = null;

function showProgress(percent, text) {
  progressWrap.classList.remove('hidden');
  progressFill.style.width = `${percent}%`;
  statusText.textContent = text;
}

window.electronAPI.onProgress((data) => {
  if (data.step === 'hostname_start') showProgress(10, 'Fetching hostname...');
  else if (data.step === 'hostname_done') showProgress(25, 'Hostname fetched.');
  else if (data.step === 'serial_start') showProgress(30, 'Fetching serial number...');
  else if (data.step === 'serial_done') showProgress(50, 'Serial fetched.');
  else if (data.step === 'encrypt_start') showProgress(60, 'Encrypting data...');
  else if (data.step === 'encrypt_done') showProgress(75, 'Encryption done.');
  else if (data.step === 'saving_start') showProgress(80, 'Saving file...');
  else if (data.step === 'saving_done') {
    showProgress(100, 'Saved successfully.');
    savedFilePath = data.path;
    filePathEl.textContent = data.path;
    afterActions.classList.remove('hidden');
  } else if (data.step === 'cancelled') {
    showProgress(0, 'Save cancelled.');
  }
});

btnGenerate.addEventListener('click', async () => {
  afterActions.classList.add('hidden');
  filePathEl.textContent = '';
  savedFilePath = null;
  progressFill.style.width = '0%';
  statusText.textContent = 'Initializing...';
  progressWrap.classList.remove('hidden');

  const result = await window.electronAPI.generateFile();
  if (!result.success) {
    statusText.textContent = 'Failed: ' + (result.message || 'Unknown error');
    progressFill.style.width = '0%';
  } else {
    statusText.textContent = 'Completed. File saved.';
  }
});

btnReveal.addEventListener('click', async () => {
  if (savedFilePath) {
    await window.electronAPI.revealFile(savedFilePath);
  }
});

btnShare.addEventListener('click', () => {
  if (!savedFilePath) return;
  window.electronAPI.revealFile(savedFilePath);
  alert('Please attach/upload the file from the opened folder and share it with your server/admin.');
});
