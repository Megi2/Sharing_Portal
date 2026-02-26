from django.urls import path
from .views import AnnouncementCreateView, AnnouncementLatestView

urlpatterns = [
    path("latest", AnnouncementLatestView.as_view(), name="announcement-latest"),
    path("", AnnouncementCreateView.as_view(), name="announcement-create"),
]
