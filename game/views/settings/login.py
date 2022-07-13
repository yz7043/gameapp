from django.http import JsonResponse
from django.contrib.auth import authenticate, login

def login_acc(request):
    data = request.GET
    username = data.get("username")
    password = data.get("password")
    user = authenticate(username=username, password=password)
    if not user:
        return JsonResponse({
            "result": "Username or password is incorrect!"
        })
    login(request, user)
    return JsonResponse({
            "result": "Success"
        })
