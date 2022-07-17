from cgitb import text
from channels.generic.websocket import AsyncJsonWebsocketConsumer
import json
from django.conf import settings
from django.core.cache import cache

class Multiplayer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.room_name = None
        for i in range(1000):
            name = "room-%d" % (i)
            if not cache.has_key(name) or len(cache.get(name)) < settings.ROOM_CAPACITY:
                self.room_name = name
                print(self.room_name, "added")
                break
        if self.room_name is None:
            return
        await self.accept()
        if not cache.has_key(self.room_name):
            cache.set(self.room_name, [], 3600)
        print(cache.has_key(self.room_name))
        for player in cache.get(self.room_name):
            await self.send(text_data=json.dumps({
                'event': "create_player",
                'uuid': player['uuid'],
                'username': player['username'],
                'photo': player['photo']
            }))
        await self.channel_layer.group_add(self.room_name, self.channel_name)

    async def disconnect(self, code):
        print("disconnect")
        await self.channel_layer.group_discard(self.room_name, self.channel_name)
        
    async def receive(self, text_data):
        data = json.loads(text_data)
        event = data["event"]
        if event == "create_player":
            await self.create_player(data)
    
    async def create_player(self, data):
        players = cache.get(self.room_name)
        print(data)
        players.append({
            "uuid": data["uuid"],
            "username": data["username"],
            "photo": data["photo"]
        })
        cache.set(self.room_name, players, 3600)
        await self.channel_layer.group_send(
            self.room_name,
            {
                "type": "group_create_player",
                "event": "create_player",
                "uuid": data["uuid"],
                "username": data["username"],
                "photo": data["photo"]
            }
        )
        print("added a player", cache.get(self.room_name))
    async def group_create_player(self, data):
        await self.send(text_data=json.dumps(data))