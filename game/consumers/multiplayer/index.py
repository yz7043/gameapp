from cgitb import text
from cmath import log
from channels.generic.websocket import AsyncJsonWebsocketConsumer
import json
from django.conf import settings
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)
class Multiplayer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        
        await self.accept()
        

    async def disconnect(self, code):
        print("disconnect")
        await self.channel_layer.group_discard(self.room_name, self.channel_name)
        
    async def receive(self, text_data):
        data = json.loads(text_data)
        event = data["event"]
        if event == "create_player":
            await self.create_player(data)
        elif event == "move_to":
            await self.move_to(data)
        elif event == "shoot_fireball":
            await self.shoot_fireball(data)

    async def create_player(self, data):
        # send to group
        self.room_name = None
        
        for i in range(1000):
            name = "room-%d" % (i)
            if not cache.has_key(name) or len(cache.get(name)) < settings.ROOM_CAPACITY:
                self.room_name = name
                print(self.room_name, "added")
                break
        if self.room_name is None:
            return
        if not cache.has_key(self.room_name):
            cache.set(self.room_name, [], 3600)
        for player in cache.get(self.room_name):
            await self.send(text_data=json.dumps({
                'event': "create_player",
                'uuid': player['uuid'],
                'username': player['username'],
                'photo': player['photo']
            }))
        await self.channel_layer.group_add(self.room_name, self.channel_name)
        # create user

        players = cache.get(self.room_name)
        players.append({
            "uuid": data["uuid"],
            "username": data["username"],
            "photo": data["photo"]
        })
        cache.set(self.room_name, players, 3600)
        logger.debug("Send Create Player uuid: {}, username: {})".format(data.get("uuid"), data.get("username")))
        await self.channel_layer.group_send(
            self.room_name,
            {
                "type": "group_send_event",
                "event": "create_player",
                "uuid": data["uuid"],
                "username": data["username"],
                "photo": data["photo"]
            }
        )

    async def group_send_event(self, data):
        await self.send(text_data=json.dumps(data))
    
    async def move_to(self, data):
        logger.debug("Player {} move to ({}, {})".format(data.get("uuid"), data.get("tx"), data.get("ty")))
        await self.channel_layer.group_send(
            self.room_name,
            {
                "type": "group_send_event",
                "event": "move_to",
                "uuid": data.get("uuid"),
                "tx": data.get("tx"),
                "ty": data.get("ty"),
            }
        )

    async def shoot_fireball(self, data):
        logger.debug("Player {} shoot_fireball to ({},{}) with ball_uuid {}".format(data.get("uuid"),data.get("tx"),data.get("ty"),data.get("ball_uuid") ))
        await self.channel_layer.group_send(
            self.room_name,
            {
                "type": "group_send_event",
                "event": "shoot_fireball",
                "uuid": data.get("uuid"),
                "tx": data.get("tx"),
                "ty": data.get("ty"),
                "ball_uuid": data.get("ball_uuid")
            }
        )
