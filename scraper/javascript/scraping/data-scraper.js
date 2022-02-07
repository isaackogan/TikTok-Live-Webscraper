class StreamDataScraper{

    #started = false;
    #data = null;

    /**
     * Get Persistent Data
     * @returns {{nickname, username}} The nickname & username of the user
     */
    static getPersistentData() {
        return {
            username: ($("[data-testid='user-profile-uid']").get(0) || {})["innerHTML"],
            nickname: ($("[data-testid='user-profile-nickname']").get(0) || {})["innerHTML"]
        }

    }

    /**
     * Start Tracking
     */
    start() {
        this.#data = StreamDataScraper.getPersistentData();
        this.#started = true;
        this.#updateVariableData(this);
    }

    /**
     * Stop Tracking
     */
    stop() {
        this.#started = false;
    }

    /**
     * Get Data
     * @returns {null} Data
     */
    getData() {
        return this.#data;
    }

    /**
     * Update viewers, title
     * @param i Instance of class
     */
    #updateVariableData(i) {

        if (!i.#started) return;

        try {
            i.#data = {
                ...i.#data,
                ...{
                    streamTitle: ($("[data-testid='user-profile-live-title']").get(0) || {})["innerHTML"],
                    viewers: ($("[data-testid='live-people-count']").get(0) || {})["innerHTML"]
                }
            }
        } catch (ex) {

        }

        setTimeout(() => i.#updateVariableData(i), 500);

    }



}

