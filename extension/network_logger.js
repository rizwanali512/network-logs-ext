console.log("🌐 Network Logger Loaded!");

let networkLogs = [];

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

            networkLogs.push({
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
            networkLogs.push({ 
                type: "network-error", 
                message: `Failed request to ${requestUrl}: ${error}`, 
                timestamp: new Date().toISOString() 
            });
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
                networkLogs.push({
                    type: "network",
                    method: method,
                    url: requestUrl,
                    status: this.status,
                    response: this.responseText.slice(0, 500), // Limit response preview
                    timestamp: new Date().toISOString(),
                    duration: `${(performance.now() - startTime).toFixed(2)}ms`
                });
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

// ✅ Capture Failed Network Requests
if (window.PerformanceObserver) {
    let observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
            if (entry.initiatorType === "xmlhttprequest" || entry.initiatorType === "fetch") {
                networkLogs.push({
                    type: "network-error",
                    message: `Failed Network Request: ${entry.name}`,
                    timestamp: new Date().toISOString()
                });
                console.error(`Failed Network Request: ${entry.name}`);
            }
        });
    });

    observer.observe({ type: "resource", buffered: true });
}

// ✅ Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "captureNetworkLogs") {
        console.log("📡 Capturing Network Logs...");
        sendResponse({ status: "Network Logs Captured", networkLogs: networkLogs || [] });
    }
    return true; // ✅ Keeps the message channel open
});
