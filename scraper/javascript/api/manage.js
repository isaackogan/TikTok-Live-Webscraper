class RedisUpdater {

    #chatScraper;
    #dataScraper;
    #started;
    #postURL;
    #uploadToken;
    #requestFrequency;

    constructor(chatScraper, dataScraper, postURL, uploadToken, requestFrequency) {
        this.#chatScraper = chatScraper;
        this.#dataScraper = dataScraper;
        this.#postURL = postURL;
        this.#started = false;
        this.#uploadToken = uploadToken;
        this.#requestFrequency = requestFrequency;
    }

    /**
     * Start the updater
     */
    start() {
        this.#chatScraper.start();
        this.#dataScraper.start();
        this.#started = true;
        this.#sendAPIUpdates(this);
    }

    /**
     * Stop the updater
     */
    stop() {
        this.#started = false;
    }

    /**
     * Send an API update
     * @param i
     */
    #sendAPIUpdates(i) {
        if (!i.#started) return;

        let recentData = this.#dataScraper.getData();
        let recentEvents = this.#chatScraper.retrieveEvents();

        this.#postData(recentData, this.#uploadToken, "data");
        this.#postData(recentEvents, this.#uploadToken, "events");

        setTimeout(() => i.#sendAPIUpdates(i), this.#requestFrequency);

    }

    /**
     * Post Data to an API URL
     * @param data URL to post data to
     * @param authorization Auth for post data
     * @param type Type of update
     */
    #postData(data, authorization, type) {
        if (!this.#postURL) {
            console.log(data);
            return;
        }

        let request = new XMLHttpRequest();
        request.open("POST", this.#postURL, true);
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        request.setRequestHeader("Authorization", authorization);
        request.send(JSON.stringify({
            "type": type,
            "payload": data
        }));

    }

}
