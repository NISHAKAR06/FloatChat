from django.core.management.base import BaseCommand
from auth_app.models import CustomUser


class Command(BaseCommand):
    help = 'Update user emails from @oceanic.ai to @floatchat.in'

    def handle(self, *args, **kwargs):
        updated_count = 0
        
        # Update admin user
        try:
            admin_users = CustomUser.objects.filter(email='admin@oceanic.ai')
            for admin_user in admin_users:
                self.stdout.write(f'Found admin: {admin_user.email}')
                admin_user.email = 'admin@floatchat.in'
                admin_user.save()
                self.stdout.write(self.style.SUCCESS(f'✅ Updated to: {admin_user.email}'))
                updated_count += 1
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error updating admin: {e}'))
        
        # Update demo user  
        try:
            demo_users = CustomUser.objects.filter(email='user@oceanic.ai')
            for demo_user in demo_users:
                self.stdout.write(f'Found user: {demo_user.email}')
                demo_user.email = 'user@floatchat.in'
                demo_user.save()
                self.stdout.write(self.style.SUCCESS(f'✅ Updated to: {demo_user.email}'))
                updated_count += 1
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error updating demo user: {e}'))
        
        self.stdout.write(self.style.SUCCESS(f'\nTotal users updated: {updated_count}'))
        
        # List all users
        self.stdout.write('\n=== Current Users ===')
        for user in CustomUser.objects.all():
            self.stdout.write(f'Email: {user.email} | Username: {user.username} | Role: {user.role}')
