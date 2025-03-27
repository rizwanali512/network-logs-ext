console.log("📋 Console Logger Loaded!");

let logs = [];

// ✅ Intercept `console.log`, `console.warn`, `console.error`
(function () {
    const originalConsole = {
        log: console.log,
        warn: console.warn,
        error: console.error
    };

    function captureLog(type, args) {
        const message = args.map(arg => 
            typeof arg === "object" ? JSON.stringify(arg) : arg
        ).join(" ");

        logs.push({ type, message, timestamp: new Date().toISOString() });
    }

    console.log = function (...args) {
        captureLog("log", args);
        originalConsole.log.apply(console, args);
    };

    console.warn = function (...args) {
        captureLog("warn", args);
        originalConsole.warn.apply(console, args);
    };

    console.error = function (...args) {
        captureLog("error", args);
        originalConsole.error.apply(console, args);
    };
})();

// ✅ Capture JavaScript runtime errors
window.onerror = function (message, source, lineno, colno, error) {
    logs.push({
        type: "error",
        message: `Runtime Error: ${message} at ${source}:${lineno}:${colno}`,
        timestamp: new Date().toISOString()
    });
    console.error(`Runtime Error: ${message} at ${source}:${lineno}:${colno}`);
};

// ✅ Capture unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
    logs.push({
        type: "error",
        message: `Unhandled Promise Rejection: ${event.reason}`,
        timestamp: new Date().toISOString()
    });
    console.error(`Unhandled Promise Rejection: ${event.reason}`);
});

// ✅ Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "captureLogs") {
        console.log("📋 Capturing Console Logs...");
        sendResponse({ status: "Logs Captured", logs: logs || [] });
    }
    return true; // ✅ Keeps the message channel open for async response
});

