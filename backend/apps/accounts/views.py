from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import (
    LoginSerializer,
    UserCreateSerializer,
    UserListSerializer,
    UserProfileSerializer,
    UserUpdateSerializer,
)


# ──────────────────────────────────────────────
# POST /api/auth/login
# ──────────────────────────────────────────────
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]

        # last_login_at 갱신
        user.last_login_at = timezone.now()
        user.save(update_fields=["last_login_at"])

        refresh = RefreshToken.for_user(user)
        return Response({
            "accessToken": str(refresh.access_token),
            "refreshToken": str(refresh),
            "user": UserProfileSerializer(user).data,
        })


# ──────────────────────────────────────────────
# GET /api/auth/me
# ──────────────────────────────────────────────
class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserProfileSerializer(request.user).data)


# ──────────────────────────────────────────────
# GET  /api/users/          → 목록
# POST /api/users/          → 생성
# ──────────────────────────────────────────────
class UserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.select_related("department").prefetch_related("roles").all()
    filterset_fields = ["status"]
    search_fields = ["name", "email"]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return UserCreateSerializer
        return UserListSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        dept = self.request.query_params.get("dept")
        role = self.request.query_params.get("role")
        if dept:
            qs = qs.filter(department__name__icontains=dept)
        if role:
            qs = qs.filter(roles__code=role)
        return qs


# ──────────────────────────────────────────────
# PATCH /api/users/{id}/    → 수정
# ──────────────────────────────────────────────
class UserUpdateView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserUpdateSerializer
    http_method_names = ["patch"]
    lookup_field = "pk"
