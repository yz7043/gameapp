from re import M
from django.urls import path
from game.consumers.multiplayer.index import Multiplayer

websocket_urlpatterns = [
    path("wss/multiplayer/", Multiplayer.as_asgi(), name="wss_multiplayer"),
]
