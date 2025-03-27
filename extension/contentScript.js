console.log("🐞 Bug Reporter Content Script Running!");

let logs = []; // Store logs globally

// ✅ Intercept console.log, console.warn, console.error
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

// ✅ Capture Fetch API Calls
(function () {
    const originalFetch = window.fetch;

    window.fetch = async function (...args) {
        const requestUrl = args[0];
        const requestOptions = args[1] || {};
        const startTime = performance.now();

        try {
            const response = await originalFetch.apply(this, args);
            const clonedResponse = response.clone();
            const responseBody = await clonedResponse.text();

            logs.push({
                type: "network",
                method: requestOptions.method || "GET",
                url: requestUrl,
                status: response.status,
                response: responseBody.slice(0, 500), // Limit response preview
                timestamp: new Date().toISOString(),
                duration: `${(performance.now() - startTime).toFixed(2)}ms`
            });

            return response;
        } catch (error) {
            logs.push({ 
                type: "network-error", 
                message: `Failed request to ${requestUrl}: ${error}`, 
                timestamp: new Date().toISOString() 
            });
            console.error(`❌ Fetch Failed: ${requestUrl}`, error);
            throw error;
        }
    };
})();

// ✅ Capture XHR Requests
(function () {
    const originalXHR = window.XMLHttpRequest;

    function captureXHR(xhr) {
        const originalOpen = xhr.open;
        const originalSend = xhr.send;

        let requestUrl, method;
        xhr.open = function (reqMethod, reqUrl) {
            method = reqMethod;
            requestUrl = reqUrl;
            originalOpen.apply(this, arguments);
        };

        xhr.send = function (body) {
            const startTime = performance.now();

            this.addEventListener("load", function () {
                logs.push({
                    type: "network",
                    method: method,
                    url: requestUrl,
                    status: this.status,
                    response: this.responseText.slice(0, 500), // Limit response preview
                    timestamp: new Date().toISOString(),
                    duration: `${(performance.now() - startTime).toFixed(2)}ms`
                });
            });

            this.addEventListener("error", function () {
                logs.push({
                    type: "network-error",
                    message: `XHR Failed: ${requestUrl}`,
                    timestamp: new Date().toISOString()
                });
                console.error(`❌ XHR Failed: ${requestUrl}`);
            });

            originalSend.apply(this, arguments);
        };
    }

    window.XMLHttpRequest = function () {
        const xhr = new originalXHR();
        captureXHR(xhr);
        return xhr;
    };
})();

// ✅ Improved PerformanceObserver for Network Errors
if (window.PerformanceObserver) {
    let observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
            // Ensure it logs only failed requests
            if (entry.initiatorType === "xmlhttprequest" || entry.initiatorType === "fetch") {
                if (entry.responseStart === 0) { // No response received (actual failure)
                    logs.push({
                        type: "network-error",
                        message: `Failed Network Request: ${entry.name}`,
                        timestamp: new Date().toISOString()
                    });
                    console.error(`🚨 Failed Network Request: ${entry.name}`);
                }
            }
        });
    });

    observer.observe({ type: "resource", buffered: true });
}

// ✅ Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "captureLogs") {
        console.log("📋 Capturing Console Logs...");
        sendResponse({ status: "Logs Captured", logs });
        return true;
    }

    if (message.action === "captureNetworkLogs") {
        console.log("🌐 Capturing Network Logs...");
        const networkLogs = logs.filter(log => log.type === "network" || log.type === "network-error");
        sendResponse({ status: "Network Logs Captured", networkLogs });
        return true;
    }
});
