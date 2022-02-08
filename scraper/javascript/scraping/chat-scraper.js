class StreamChatScraper {

    #started = false;
    #observer = null;
    #outboundEvents = [];

    constructor() {
        this.#observer = new MutationObserver((mutations) => {
            StreamChatScraper.#onElementMutation(mutations, this);
        });

    }

    /**
     * Start Observing
     * @returns {boolean} Whether successfully started
     */
    start() {

        if (this.#started) {
            Logger.ERROR("You have already started the stream scraper")
            return false;
        }

        const chatBox = $("[data-testid='chat-room']").get(0);

        if (chatBox == null) {
            Logger.ERROR("Failed to load chat-box (could not retrieve <%s> element)", "chat-room")
            return false;
        }

        this.#observer.observe(chatBox, {subtree: true, childList: true, attributes: true});
        Logger.INFO("Started observing the chat-box in this livestream!")
        return true;

    }

    /**
     * Stop Observing
     * @returns {boolean} Whether successfully stopped
     */
    stop() {

        if (!this.#started) {
            Logger.ERROR("The stream scraper is not currently active")
            return false;
        }

        this.#started = false;
        this.#observer.disconnect();

        Logger.INFO("Stopped observing the chat-box in this livestream!");
        return true;
    }

    /**
     * Parse mutations & run parsed data through onGeneralMessage event
     * @param mutations DOM Mutation
     * @param instance Instance of StreamScraper
     */
    static #onElementMutation(mutations, instance) {

        for (let mutationRecord of mutations) {

            // Attribute Change (User Joined)
            if (mutationRecord["type"] === "attributes" && mutationRecord.target.tagName === "SPAN") {
                instance.#onGeneralMessage(mutationRecord.target)
            }

            // ChildList Change (Message Sent)
            if (mutationRecord["type"] === "childList") {
                if (mutationRecord.addedNodes.length > 0) {
                    for (let node of mutationRecord.addedNodes) {
                        instance.#onGeneralMessage(node)
                    }
                }
            }

        }
    }

    /**
     * When a message is sent to the chat, parse the message & push to cached events
     * @param element DOM Element of sent message
     */
    #onGeneralMessage(element) {
        let data = MessageParser.parseGeneralMessage(element);
        if (data === null) return;

        data["timestamp"] = Math.round(+new Date()/1000);
        this.#outboundEvents.push(data)
    }

    /**
     * Retrieve outbound events. This CLEARS the cached events
     * @returns {*[]} Outbound events
     */
    retrieveEvents() {
        let events = this.#outboundEvents;
        this.clearEvents();
        return events;
    }

    /**
     * Clear outbound events
     */
    clearEvents() {
        this.#outboundEvents = [];
    }

}


const MessageParser = {

    parseGeneralMessage(element) {
        let messageData = null;

        // Has ID
        if (element.getAttribute("data-testid")) {
            let messageType = element.getAttribute("data-testid");

            // Chat Message
            if (messageType === "chat-message") messageData = MessageParser.parseChatMessage(element);

            // Social Message
            else if (messageType === "social-message") messageData = MessageParser.parseSocialMessage(element);

        }

        // Has No ID
        else {
            let classes = element.classList.toString().toLowerCase();

            // Join Message (Inline)
            if (classes.includes("entermessage")) messageData = MessageParser.parseJoinMessage(element)

            // A No-Id Chatroom message
            if (classes.includes("chatroommessage")) {

                // Sent Likes to Host
                if (classes.includes("likemessage")) messageData = MessageParser.parseLikeMessage(element);

                // Other (Gift Message)
                else {

                    // MIGHT be Gift Message
                    messageData = MessageParser.parseGiftMessage(element);
                    if (messageData["gift"] == null) messageData = null;

                }

            }

        }

        return messageData;

    },

    parseSocialMessage(element) {
        const data = {
            type: "social",
            username: null,
            socialType: null,
        }

        for (let node of element.getElementsByTagName("span")) {
            let classes = node.classList.toString().toLowerCase();

            // Username
            if (classes.includes("nickname")) data["username"] = node.innerText;

            // Social Type
            if (node.getAttribute("data-testid") === "social-message-text") {
                if (node.innerText.includes("shared")) data["socialType"] = "share"
                else if (node.innerText.includes("follow")) data["socialType"] = "follow"
            }

        }

        return data;

    },

    parseGiftMessage(element) {
        const data = {
          type: "gift",
          username: null,
          gift: null,
          amount: null
        }

        let images = element.getElementsByTagName("img");
        if (images.length > 0) data["gift"] = images[0].src;

        for (let node of element.getElementsByTagName("span")) {
            let classes = node.classList.toString().toLowerCase();

            // Username
            if (classes.includes("nickname")) data["username"] = node.innerText;

            // Amount
            if (node.innerText[0] === "x") {
                const parsed = parseInt(node.innerText.substr(1));
                if (!isNaN(parsed)) data["amount"] = parsed;
            }
        }

        return data;

    },

    parseLikeMessage(element) {
        const data = {
            type: "like",
            username: null
        }

        for (let node of element.getElementsByTagName("span")) {
            let classes = node.classList.toString().toLowerCase();

            // Username
            if (classes.includes("nickname")) data["username"] = node.innerText;

        }

        return data;

    },

    parseJoinMessage(element) {
        const data = {
            type: "join",
            username: null
        }

        for (let node of element.getElementsByTagName("span")) {
            if (node.getAttribute("data-testid") === "enter-viewer-name") {
                data["username"] = node.innerText;
            }
        }

        return data;

    },

    parseChatMessage(element) {
        const data = {
            type: "message",
            avatarURL: (element.getElementsByTagName("img")[0] || {})["src"],
            roles: [],
            username: null,
            content: null
        }

        for (let node of element.getElementsByTagName("span")) {
            let classes = node.classList.toString().toLowerCase();

            // Their name
            if (node.getAttribute("data-testid") === "message-owner-name") data["username"] = node.innerText;

            // The comment they left
            else if (classes.includes("comment")) data["content"] = node.innerText;

            // They have a role
            else if (classes.includes("isfriend")) data.roles.push(node.innerText)

        }

        return data;

    }

}
