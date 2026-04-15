let lastUrl = location.href;
let timerSet = false;

function enforce() {
    const currentUrl = location.href;

    chrome.storage.sync.get(["mode", "unlockTime"], (res) => {
        let mode = res.mode || "soft";

        // ⏱️ Handle 5-min timeout
        if (mode === "none" && res.unlockTime) {
            const elapsed = Date.now() - res.unlockTime;

            if (elapsed > 5 * 60 * 1000) {
                mode = "soft";
                chrome.storage.sync.set({ mode: "soft", unlockTime: null });
            } else if (!timerSet) {
                timerSet = true;
                const remaining = 5 * 60 * 1000 - elapsed;

                setTimeout(() => {
                    chrome.storage.sync.set({ mode: "soft", unlockTime: null });
                    location.reload();
                }, remaining);
            }
        }

        const isShorts = currentUrl.includes("/shorts/");
        const wasShorts = lastUrl.includes("/shorts/");

        // 🔴 HARD LOCK
        if (mode === "hard" && isShorts) {
            window.location.replace("https://www.youtube.com/feed/subscriptions");
            return;
        }

        // 🟡 SOFT LOCK
        if (mode === "soft") {
            if (isShorts && wasShorts && currentUrl !== lastUrl) {
                // Block chaining Shorts
                window.location.replace(lastUrl);
                return;
            }
        }

        lastUrl = currentUrl;
    });
}

// Watch navigation (YouTube is SPA)
setInterval(enforce, 300);

// React instantly to mode changes
chrome.storage.onChanged.addListener(() => {
    location.reload();
});