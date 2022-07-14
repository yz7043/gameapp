from django.http import JsonResponse
from django.contrib.auth import login
from django.contrib.auth.models import User
from game.models.player.player import Player

def register(request):
    data = request.GET
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()
    password_confirm = data.get("password_confirm", "").strip()
    if not username or not password:
        return JsonResponse({"result": "Username or password can be empty!"})
    if password != password_confirm:
        return JsonResponse({"result": "Two passwords are different!"})
    if User.objects.filter(username=username).exists():
        return JsonResponse({"result": "Username has existed!"})
    user = User(username=username)
    user.set_password(password)
    user.save()
    Player.objects.create(user=user, photo="https://winaero.com/blog/wp-content/uploads/2019/11/Photos-new-icon.png")
    login(request, user)
    return JsonResponse({"result": "Success"})
