from channels.generic.websocket import AsyncJsonWebsocketConsumer
import json
class Multiplayer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        await self.accept()
        print("accept")

        self.root_name = "room"
        print("=================\n", self.root_name, self.channel_name)
        await self.channel_layer.group_add(self.root_name, self.channel_name)

    async def disconnect(self, code):
        print("disconnect")
        await self.channel_layer.group_discard(self.root_name, self.channel_name)
        
    async def receiv(self, text_data):
        data = json.loads(text_data)
        print(data)