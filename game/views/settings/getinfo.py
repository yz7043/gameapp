from django.http import JsonResponse
from game.models.player.player import Player
AC_PLATFORM = "AC_OS"
def getinfo_ac(request):
    player = Player.objects.all()[0]
    return JsonResponse({
        "result": "success",
        "username": player.user.username,
        "photo": player.photo,
    })

def getinfo_web(request):
    user = request.user
    if not user.is_authenticated:
        return JsonResponse({
            "result": "Not login"
        })
    else:
        player = Player.objects.all()[0]
        return JsonResponse({
            "result": "success",
            "username": player.user.username,
            "photo": player.photo,
        })

def getinfo(request):
    platform = request.GET.get('platform')
    if platform == AC_PLATFORM:
        return getinfo_ac(request)
    else:
        return getinfo_web(request)
