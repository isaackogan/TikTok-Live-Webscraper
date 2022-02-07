import asyncio
import logging
import traceback
from asyncio import AbstractEventLoop
from typing import Optional, List

from flask import Response, Flask, request
from gevent.pywsgi import WSGIServer
from flask_cors import CORS
import logging

class Client:

    def __init__(self, **extra: dict):
        super().__init__(**extra)

        # Application Stuff
        self.__app: Flask = Flask('wrap')
        self.__app.add_url_rule("/", "data", self.post_data, methods=["POST"])
        self.__http_server: Optional[WSGIServer] = None
        self.__token: Optional[str] = None
        self.cors = CORS(self.__app, resources={r"/": {"origins": "*"}})
        self.__headers: dict = {
            "Access-Control-Allow-Origin": "*"
        }

        # TikTok Stuff
        self.username: Optional[str] = None
        self.nickname: Optional[str] = None
        self.viewers: Optional[int] = None
        self.title: Optional[str] = None

    @property
    def loop(self):
        """
        Get the currently running loop
        :return: None
        """
        return asyncio.get_running_loop()

    def run(self, hostname: str, port: int, token: str):
        """
        Start the client (blocking thread)
        :param port: App port
        :param hostname: App hostname
        :param token: Token to start with
        :return: None

        """
        self.__token = token
        self.__http_server = WSGIServer((hostname, port), self.__app, log=None)
        self.__http_server.serve_forever()

    def __update_cache(self, data: dict):
        """
        Update data cache given a dict
        :param data: Data
        :return: None

        """

        data = data.get("payload", {})
        self.username = data.get("username")
        self.nickname = data.get("viewers")
        self.viewers = data.get("viewers")
        self.title = data.get("title")


    def __create_response(self, *args, **kwargs):
        headers = kwargs.get("headers", {}).copy()
        _headers = self.__headers
        if isinstance(headers, dict):
            _headers.update(headers)
        kwargs["headers"] = _headers
        return Response(*args, **kwargs)

    async def post_data(self):
        """
        Post data to the client
        :return:

        """

        # Must Provide JSON Payload
        data: Optional[dict] = request.get_json()
        auth: Optional[str] = request.headers.get("Authorization")

        # Must be authenticated
        if not auth or auth != self.__token:
            return self.__create_response(status=403, response="No Permission")

        # Must be payload
        if not data or not isinstance(data, dict):
            return self.__create_response(status=400, response="Invalid Payload")

        # Events
        if data.get("type") == "events":
            for event in data["payload"]:
                try:
                    await self.loop.create_task(self.on_event(event))
                except:
                    logging.error(traceback.format_exc())

            return self.__create_response(status=200, response="Accepted Event Input")

        # Cache Update
        elif data.get("type") == "data":
            self.__update_cache(data)
            return self.__create_response(status=200, response="Accepted Data-Cache Input")

        # Invalid Response
        return self.__create_response(status=400, response="Invalid Payload", headers=self.__headers)

    async def on_event(self, event: dict):
        """
        Receive events & do stuff with them
        :param event: Event data
        :return: None

        """
        pass
