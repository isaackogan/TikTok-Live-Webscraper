import logging
import traceback
from typing import List, Optional, Type

from .struct import Message, AbstractEvent, SocialUpdate, Join, Like, Gift, EventListener
from ..client import Client


class Bot(Client):

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.listeners = {
            "message": [],
            "social": [],
            "gift": [],
            "like": [],
            "join": []
        }

    def run(self, hostname: str, port: int, token: str, listeners: Optional[List[EventListener]] = None):
        if listeners is None:
            listeners = list()
        self.register_events(*listeners)
        super(Bot, self).run(hostname, port, token)

    async def on_event(self, event: dict):
        """
        Receive events & do stuff with them
        :param event: Event data
        :return: None

        """
        this: Type[AbstractEvent] = {
            "message": Message,
            "social": SocialUpdate,
            "gift": Gift,
            "like": Like,
            "join": Join
        }.get(event.get("type"), AbstractEvent)
        await self._on_event(this.from_dict(env=event))

    def register_events(self, *listeners: EventListener):

        for listener in listeners:

            if isinstance(listener, EventListener):
                self.listeners[listener.type].append(listener.function)
            else:
                logging.error(f"Non-Listener passed to event registry: {listener}")

    async def _on_event(self, event: AbstractEvent):

        for handler in self.listeners[event.type]:

            try:
                self.loop.create_task(handler(event))
            except:
                logging.error(traceback.format_exc())
