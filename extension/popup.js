document.getElementById("captureLogs").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "captureLogs" }, (response) => {
        console.log("📝 Raw Console Logs:", response?.logs);
        if (response?.logs?.length) {
            alert("📋 Console Logs Captured! Check Console.");
            saveLogsToFile(response.logs, "console_logs", "txt");
        } else {
            console.warn("⚠️ No console logs captured.");
        }
    });

    // chrome.runtime.sendMessage({ action: "captureNetworkLogs" }, (response) => {
    //     console.log("🌐 Raw Network Logs:", response?.networkLogs);
    //     if (response?.networkLogs?.length) {
    //         alert("📡 Network Logs Captured! Check Console.");
    //         saveLogsToFile(response.networkLogs, "network_logs", "txt");
    //         saveLogsToHAR(response.networkLogs);
    //     } else {
    //         console.warn("⚠️ No network logs captured.");
    //     }
    // });
});

document.getElementById("downloadHAR").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "captureNetworkLogs" }, (response) => {
        console.log("🌐 Raw Network Logs:", response?.networkLogs);
        if (response?.networkLogs?.length) {
            alert("📡 Network Logs Captured! Check Console.");
            saveLogsToFile(response.networkLogs, "network_logs", "txt");
            saveLogsToHAR(response.networkLogs);
        } else {
            console.warn("⚠️ No network logs captured.");
        }
    });
});

/**
 * Saves logs to a file (TXT).
 */
function saveLogsToFile(logs, filenamePrefix, fileType) {
    let logContent = logs
        .map(log => `[${log.timestamp}] [${log.type?.toUpperCase() || "LOG"}] ${log.message || JSON.stringify(log)}`)
        .join("\n");

    let blob = new Blob([logContent], { type: "text/plain" });
    let url = URL.createObjectURL(blob);

    let a = document.createElement("a");
    a.href = url;
    a.download = `${filenamePrefix}_${new Date().toISOString().replace(/[:.]/g, "-")}.${fileType}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
}


/**
 * Saves network logs as a HAR file.
 */
function saveLogsToHAR(networkLogs) {
    console.log("📂 Generating HAR file...");

    const harData = {
        log: {
            version: "1.2",
            creator: {
                name: "Chrome Extension",
                version: "1.0"
            },
            entries: networkLogs.map(log => ({
                startedDateTime: new Date(log.timestamp).toISOString(),
                request: {
                    method: log.method || "GET",
                    url: log.url || "Unknown URL",
                    headers: log.requestHeaders || []
                },
                response: {
                    status: log.status || 0,
                    statusText: log.statusText || "",
                    headers: log.responseHeaders || []
                },
                timings: {
                    wait: log.time || 0
                }
            }))
        }
    };

    let blob = new Blob([JSON.stringify(harData, null, 2)], { type: "application/json" });
    let url = URL.createObjectURL(blob);

    let a = document.createElement("a");
    a.href = url;
    a.download = `network_logs_${new Date().toISOString().replace(/[:.]/g, "-")}.har`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
    console.log("✅ HAR file downloaded successfully!");
}
