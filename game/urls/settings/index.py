from django.urls import path
from game.views.settings.getinfo import getinfo
from game.views.settings.login import login_acc
from game.views.settings.logout import logout_acc
urlpatterns = [
    path("getinfo/", getinfo, name="settings_getinfo"),
    path("login/", login_acc, name="login_acc"),
    path("logout/", logout_acc, name="logout_acc"),
]
