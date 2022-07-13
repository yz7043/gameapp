from django.http import JsonResponse
from django.contrib.auth import logout

def logout_acc(request):
    user = request.user
    if not user.is_authenticated:
        return JsonResponse({
            "result": "Success"
            })
    logout(request)
    return JsonResponse({"result": "Success"})
