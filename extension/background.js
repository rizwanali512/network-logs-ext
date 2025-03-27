let consoleLogs = [];
let networkLogs = [];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("📩 Message received in Background:", message);

    if (message.action === "captureLogs") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "captureLogs" }, (response) => {
                    consoleLogs = response.logs || [];
                    console.log("✅ Console Logs Captured in Background:", consoleLogs);
                    sendResponse({ logs: consoleLogs });
                });
            }
        });

        return true; // ✅ Required for async sendResponse
    }

    if (message.action === "captureNetworkLogs") {
        console.log("🌐 Sending Network Logs:", networkLogs);
        sendResponse({ networkLogs }); // ✅ Ensure network logs are properly sent
        return true;
    }
});

// Capture network requests
chrome.webRequest.onCompleted.addListener(
    (details) => {
        networkLogs.push({
            timestamp: Date.now(),
            method: details.method,
            url: details.url,
            status: details.statusCode,
            requestHeaders: details.requestHeaders || [],
            responseHeaders: details.responseHeaders || [],
        });
    },
    { urls: ["<all_urls>"] },
    ["responseHeaders", "extraHeaders"]
);
