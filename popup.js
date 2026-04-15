document.addEventListener("DOMContentLoaded", () => {
    const radios = document.querySelectorAll("input[name='mode']");

    chrome.storage.sync.get(["mode", "unlockTime"], (res) => {
        let mode = res.mode || "soft";

        // Auto-reset if needed
        if (mode === "none" && res.unlockTime) {
            const elapsed = Date.now() - res.unlockTime;
            if (elapsed > 5 * 60 * 1000) {
                mode = "soft";
                chrome.storage.sync.set({ mode: "soft", unlockTime: null });
            }
        }

        const el = document.querySelector(`input[value="${mode}"]`);
        if (el) el.checked = true;
    });

    radios.forEach(r => {
        r.addEventListener("change", () => {
            if (r.value === "none") {
                chrome.storage.sync.set({
                    mode: "none",
                    unlockTime: Date.now()
                });
            } else {
                chrome.storage.sync.set({
                    mode: r.value,
                    unlockTime: null
                });
            }
        });
    });
});