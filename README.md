TikTok Livestream Scraper
==================
A Chrome Extension to scrape data and POST it to an API,
as well as a sample python client that takes the requests & performs
actions with it.

# Table of Contents

- [Usage](#Usage)
- [Authors](#authors)
- [Project License](#license)

## Usage

This covers the usage for both the scraper & sample client provided in this repository.

### Scraping & Sending POST Requests

Follow these steps to READ TikTok live chats and send them via POST request
to an REST API of your choice (make sure CORS is set up for the `*.tiktok.com` domain) .

1. Clone the repository to your desktop
2. Edit the extension- under `./scraper/javascript/main.js` configure to your preferences.
   1. Custom POST URL, Auth token, Send Frequency
3. Load the `scraper` folder as a Chrome Extension at `chrome://extensions`
   1. Enable developer tools at the aforementioned URL
   2. Click **Load Unpacked** to load from file
   3. Select the `scraper` folder and load the extension
4. Navigate to the livestream on https://tiktok.com that you want to view. Example schema: `https://www.tiktok.com/@jakeandrich/live`
5. Keep the page loaded & data will be sent constantly to the requested URL

### Reading POST Requests (Sample Client)

Follow these steps to RECEIVE the POST requests via a custom client that
allows you to subscribe to events and perform actions on them.

1. Clone the repository to your desktop
2. Edit the project- under `./client/main.py` configure to your preferences
   1. Custom API host, port, Auth token, register listeners
3. Make sure to install all requirements. For flask, `pip install flask[async]`. You MUST have the async extesion or it will not run!
4. Run main.py

## Authors

* **Isaac Kogan** - *Initial work* - [isaackogan](https://github.com/isaackogan)

See also the list of [contributors](https://github.com/ChromegleApp/Omegle-IP-Puller/contributors) who participated in this project.

## License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.