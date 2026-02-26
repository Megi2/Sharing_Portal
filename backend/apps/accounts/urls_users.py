from django.urls import path
from .views import UserListCreateView, UserUpdateView

urlpatterns = [
    path("", UserListCreateView.as_view(), name="user-list-create"),
    path("<uuid:pk>", UserUpdateView.as_view(), name="user-update"),
]
