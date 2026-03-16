from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework_simplejwt.views import TokenRefreshView  # ← 추가

urlpatterns = [
    path("admin/", admin.site.urls),
    # API
    path("api/auth/", include("apps.accounts.urls")),
    path("api/auth/token/refresh", TokenRefreshView.as_view(), name="token-refresh"),  # ← 추가
    path("api/users/", include("apps.accounts.urls_users")),
    path("api/assets/", include("apps.assets.urls")),
    path("api/share-requests/", include("apps.sharing.urls")),
    path("api/logs/", include("apps.logs.urls")),
    path("api/announcements/", include("apps.announcements.urls")),
    # Swagger
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger"),
]