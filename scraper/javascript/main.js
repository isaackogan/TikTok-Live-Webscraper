
$(document).on("ready", () => {
    (function() {
        let streamData = StreamDataScraper.getPersistentData();
        if (streamData["username"]) document.dispatchEvent(new CustomEvent('streamLoaded', {detail: streamData}));
        else setTimeout(() => arguments.callee(), 100);
    })();
});

document.addEventListener("streamLoaded", (event) => {

    let updater = new RedisUpdater(
        new StreamChatScraper(),
        new StreamDataScraper(),
        "http://127.0.0.1:5000/",
        "streamToken",
        5000
    );

    updater.start();

})
