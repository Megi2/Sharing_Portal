from django.urls import path
from .views import (
    AssetDetailView,
    AssetListCreateView,
    PermissionView,
    VersionListCreateView,
)

urlpatterns = [
    path("", AssetListCreateView.as_view(), name="asset-list-create"),
    path("<uuid:pk>", AssetDetailView.as_view(), name="asset-detail"),
    path("<uuid:pk>/versions", VersionListCreateView.as_view(), name="asset-versions"),
    path("<uuid:pk>/permissions", PermissionView.as_view(), name="asset-permissions"),
]
