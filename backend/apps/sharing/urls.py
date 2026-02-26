from django.urls import path
from .views import ShareRequestApproveView, ShareRequestListCreateView, ShareRequestRejectView

urlpatterns = [
    path("", ShareRequestListCreateView.as_view(), name="share-request-list-create"),
    path("<uuid:pk>/approve", ShareRequestApproveView.as_view(), name="share-request-approve"),
    path("<uuid:pk>/reject", ShareRequestRejectView.as_view(), name="share-request-reject"),
]
