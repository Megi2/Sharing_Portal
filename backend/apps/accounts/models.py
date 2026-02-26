"""
accounts/models.py
ERD 섹션 1) 사용자/권한: USERS, DEPARTMENTS, ROLES, USER_ROLES
"""
import uuid

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


# ──────────────────────────────────────────────
# Department
# ──────────────────────────────────────────────
class Department(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField("부서명", max_length=100)

    class Meta:
        db_table = "departments"
        ordering = ["name"]

    def __str__(self):
        return self.name


# ──────────────────────────────────────────────
# Role
# ──────────────────────────────────────────────
class Role(models.Model):
    class Code(models.TextChoices):
        SUPER_ADMIN = "SUPER_ADMIN", "슈퍼관리자"
        ADMIN = "ADMIN", "관리자"
        USER = "USER", "일반 사용자"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField("역할 코드", max_length=20, unique=True, choices=Code.choices)
    name = models.CharField("역할명", max_length=50)

    class Meta:
        db_table = "roles"

    def __str__(self):
        return self.name


# ──────────────────────────────────────────────
# Custom User Manager
# ──────────────────────────────────────────────
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("이메일은 필수입니다.")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


# ──────────────────────────────────────────────
# User
# ──────────────────────────────────────────────
class User(AbstractBaseUser, PermissionsMixin):
    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "활성"
        INACTIVE = "INACTIVE", "비활성"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField("이메일", unique=True)
    name = models.CharField("이름", max_length=100)
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="users",
        db_column="dept_id",
    )
    position = models.CharField("직급/직책", max_length=100, blank=True, default="")
    status = models.CharField(
        "상태", max_length=10, choices=Status.choices, default=Status.ACTIVE
    )
    roles = models.ManyToManyField(Role, through="UserRole", related_name="users", blank=True)

    # Django auth 필드
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    last_login_at = models.DateTimeField("마지막 로그인", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    class Meta:
        db_table = "users"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.email})"

    @property
    def role_codes(self):
        return list(self.roles.values_list("code", flat=True))


# ──────────────────────────────────────────────
# User ↔ Role (N:M through table)
# ──────────────────────────────────────────────
class UserRole(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column="user_id")
    role = models.ForeignKey(Role, on_delete=models.CASCADE, db_column="role_id")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "user_roles"
        unique_together = ("user", "role")
