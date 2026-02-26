"""
python manage.py seed
→ 초기 부서, 역할, 관리자 계정, 기본 카테고리 생성
"""
from django.core.management.base import BaseCommand
from apps.accounts.models import Department, Role, User
from apps.assets.models import Category


class Command(BaseCommand):
    help = "초기 데이터(부서/역할/관리자/카테고리) 생성"

    def handle(self, *args, **options):
        # ── 부서 ──
        dept_names = ["사업개발", "마케팅", "영업", "기술", "경영지원"]
        depts = {}
        for name in dept_names:
            dept, created = Department.objects.get_or_create(name=name)
            depts[name] = dept
            tag = "생성" if created else "이미 존재"
            self.stdout.write(f"  부서 [{name}] {tag}")

        # ── 역할 ──
        role_data = [
            ("SUPER_ADMIN", "슈퍼관리자"),
            ("ADMIN", "관리자"),
            ("USER", "일반 사용자"),
        ]
        roles = {}
        for code, name in role_data:
            role, created = Role.objects.get_or_create(code=code, defaults={"name": name})
            roles[code] = role
            tag = "생성" if created else "이미 존재"
            self.stdout.write(f"  역할 [{code}] {tag}")

        # ── 관리자 계정 ──
        admin_email = "admin@company.com"
        if not User.objects.filter(email=admin_email).exists():
            admin_user = User.objects.create_superuser(
                email=admin_email,
                password="admin1234",
                name="시스템관리자",
                department=depts["사업개발"],
            )
            admin_user.roles.add(roles["SUPER_ADMIN"])
            self.stdout.write(self.style.SUCCESS(
                f"  관리자 계정 생성: {admin_email} / admin1234"
            ))
        else:
            self.stdout.write(f"  관리자 [{admin_email}] 이미 존재")

        # ── 카테고리 ──
        cat_names = ["제안서", "영상", "브로슈어", "교육", "기타"]
        for i, name in enumerate(cat_names):
            _, created = Category.objects.get_or_create(
                name=name, defaults={"sort_order": i}
            )
            tag = "생성" if created else "이미 존재"
            self.stdout.write(f"  카테고리 [{name}] {tag}")

        self.stdout.write(self.style.SUCCESS("\n✅ Seed 완료!"))
