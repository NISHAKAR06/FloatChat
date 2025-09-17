from django.core.management.base import BaseCommand
from auth_app.models import CustomUser

class Command(BaseCommand):
    help = 'Creates a default admin user for development.'

    def handle(self, *args, **options):
        if not CustomUser.objects.filter(username='admin').exists():
            admin_user = CustomUser.objects.create_superuser(
                username='admin',
                email='admin@example.com',
                password='adminpassword'
            )
            admin_user.role = 'admin'
            admin_user.save()
            self.stdout.write(self.style.SUCCESS("Default admin user 'admin' created with password 'adminpassword'."))
        else:
            self.stdout.write(self.style.WARNING("Default admin user 'admin' already exists."))
