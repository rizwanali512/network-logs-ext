# Chrome Extension: Console & Network Logs Capture

This Chrome extension captures **console logs** and **network requests** from the active tab, allowing users to download logs in `.txt` and `.har` formats for debugging purposes.

## 🚀 Features
- 📜 Capture **console logs** and download them as a `.txt` file.
- 🌐 Capture **network requests** and download them as a `.har` file.
- 🛠 Simple UI with a popup to trigger log capture.
- ✅ Asynchronous handling for efficient data collection.

---

## 📥 Installation & Setup

### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/rizwanali512/network-logs-ext.git
cd network-logs-ext
```

### **2️⃣ Load the Extension in Chrome**
1. Open **Google Chrome**.
2. Navigate to `chrome://extensions/`.
3. Enable **Developer Mode** (toggle in the top-right corner).
4. Click **Load Unpacked** and select the extension folder.

---

## 🛠 Usage Instructions

### **Capturing Logs**
1. Click the **extension icon** in Chrome's toolbar.
2. Click **"Capture Console Logs"** to download `console_logs.txt`.
3. Click **"Capture Network Logs"** to download `network_logs.txt`.
4. Click **"Download HAR"** to save network logs as a `.har` file.

### **File Outputs**
- **console_logs.txt** → Logs captured from the browser's console.
- **network_logs.txt** → Network requests in plain text.
- **network_logs.har** → Network request logs in HAR format.

---

## 🏗 Project Structure
```
📂 extension
 ├── 📂 icons               # Extension icons
 ├── background.js      # Handles message passing & network logs
 ├── content.js         # Captures console logs
 ├── popup.js           # UI interactions & downloads
 ├── popup.html             # Popup UI
 ├── manifest.json          # Extension metadata & permissions
 ```

---

## 🛠 Development & Debugging

### **Live Debugging**
1. Open `chrome://extensions/`.
2. Locate your extension and click **"Background Page"** under `Inspect views`.
3. Open **Console** to check logs & debug messages.

### **Updating the Extension**
- After modifying code, **refresh the extension** in `chrome://extensions/`.

---

## 📜 Permissions
The extension requests the following permissions:
- **tabs** → To query active tabs for sending messages.
- **webRequest** → To capture network requests.
- **storage** → (If needed) To store log history.
- **activeTab** → To interact with the active tab.

---

## 📄 License
This project is licensed under the **MIT License**. See the `LICENSE` file for details.

---

## 📬 Contact & Support
For any issues or contributions, feel free to open an **Issue** or submit a **Pull Request** on GitHub.

📧 Email: [rizwandiplana@gmail.com](mailto:rizwandiplana@gmail.com)  
🔗 GitHub: [rizwanali512](https://github.com/rizwanali512)

