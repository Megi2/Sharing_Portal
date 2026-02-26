from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import Department, Role, User


# ──────────────────────────────────────────────
# Auth
# ──────────────────────────────────────────────
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(email=attrs["email"], password=attrs["password"])
        if not user:
            raise serializers.ValidationError("이메일 또는 비밀번호가 올바르지 않습니다.")
        if user.status != User.Status.ACTIVE:
            raise serializers.ValidationError("비활성화된 계정입니다.")
        attrs["user"] = user
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()
    dept = serializers.CharField(source="department.name", default=None)

    class Meta:
        model = User
        fields = ["id", "name", "email", "roles", "dept", "position", "status"]

    def get_roles(self, obj):
        return obj.role_codes


# ──────────────────────────────────────────────
# User CRUD (관리자용)
# ──────────────────────────────────────────────
class UserListSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()
    dept = serializers.CharField(source="department.name", default=None)

    class Meta:
        model = User
        fields = [
            "id", "name", "dept", "position", "roles",
            "email", "lastLoginAt", "status",
        ]

    lastLoginAt = serializers.DateTimeField(source="last_login_at", read_only=True)

    def get_roles(self, obj):
        return obj.role_codes


class UserCreateSerializer(serializers.ModelSerializer):
    deptId = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    roleCodes = serializers.ListField(child=serializers.CharField(), write_only=True)
    password = serializers.CharField(write_only=True, required=False, default="changeme123")

    class Meta:
        model = User
        fields = ["name", "email", "deptId", "position", "roleCodes", "status", "password"]

    def create(self, validated_data):
        dept_id = validated_data.pop("deptId", None)
        role_codes = validated_data.pop("roleCodes", [])
        password = validated_data.pop("password", "changeme123")

        user = User.objects.create_user(
            password=password,
            department_id=dept_id,
            **validated_data,
        )
        # 역할 연결
        roles = Role.objects.filter(code__in=role_codes)
        user.roles.set(roles)
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    roleCodes = serializers.ListField(
        child=serializers.CharField(), write_only=True, required=False
    )

    class Meta:
        model = User
        fields = ["name", "position", "status", "roleCodes"]
        extra_kwargs = {f: {"required": False} for f in ["name", "position", "status"]}

    def update(self, instance, validated_data):
        role_codes = validated_data.pop("roleCodes", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if role_codes is not None:
            roles = Role.objects.filter(code__in=role_codes)
            instance.roles.set(roles)
        return instance


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ["id", "name"]
