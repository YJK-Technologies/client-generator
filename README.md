# Client Info Notepad Generator (Electron)

Simple Electron app that:
- Fetches machine hostname and serial number (platform-dependent).
- Encrypts the information using AES-256-CBC with a random IV.
- Saves the encrypted payload as a `.txt` file.
- Shows generation progress and allows revealing the file in Explorer.

## Usage (development)
1. Install dependencies:
   ```
   npm install
   ```
2. Start app:
   ```
   npm start
   ```

## Packaging into .exe
Use `electron-builder` or `electron-forge`. Example with electron-builder:
1. `npm install --save-dev electron-builder`
2. Add build config to package.json and run `npx electron-builder --win`.

## Important
- Replace the hardcoded passphrase before packaging:
  - Use environment variable `CLIENT_GEN_PASSPHRASE` or modify main.js.
- Respect user privacy and acquire consent before collecting machine identifiers.
