from discord import Webhook, RequestsWebhookAdapter
from TikTokStream.ext.bot import Bot
from TikTokStream.ext.struct import Message, Join, EventListener, Gift, SocialUpdate

bot: Bot = Bot()


async def on_message(message: Message):
    print(f"<{message.username}>: {message.content}")


async def on_gift(gift: Gift):
    print(f"{gift.username} sent {gift.amount}x {gift.gift}")


bot.run(
    "127.0.0.1",  # Hostname to run API on
    5000,  # Port for API
    "streamToken",  # Token for Authenticating Requests
    listeners=[  # Listeners
        EventListener("gift", on_gift),
        EventListener("message", on_message),
    ]
)
