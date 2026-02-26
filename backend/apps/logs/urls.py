from django.urls import path
from .views import AccessLogExportView, AccessLogListView

urlpatterns = [
    path("", AccessLogListView.as_view(), name="log-list"),
    path("export", AccessLogExportView.as_view(), name="log-export"),
]
