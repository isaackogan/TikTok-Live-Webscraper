import inspect
from dataclasses import dataclass
from typing import List, Union, Dict, Callable


@dataclass
class AbstractEvent:
    type: str
    data: Union[List, Dict]
    timestamp: int

    @classmethod
    def from_dict(cls, env):
        dictionary: dict = {
            k: v for k, v in env.items()
            if k in inspect.signature(cls).parameters
        }
        dictionary["data"] = env
        return cls(**dictionary)


@dataclass
class Message(AbstractEvent):
    username: str
    avatarURL: str
    roles: List[str]
    content: str


@dataclass
class SocialUpdate(AbstractEvent):
    username: str
    socialType: str


@dataclass
class Gift(AbstractEvent):
    username: str
    gift: str
    amount: int


@dataclass
class Like(AbstractEvent):
    username: str


@dataclass
class Join(AbstractEvent):
    username: str


@dataclass
class EventListener:
    type: str
    function: Callable
