function getResourceURL(path) {
    return `chrome-extension://${chrome.runtime.id}/` + path
}
