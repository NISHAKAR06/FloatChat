from django.core.management.base import BaseCommand
from auth_app.models import CustomUser

class Command(BaseCommand):
    help = 'Lists all users with their ID, username, and role.'

    def handle(self, *args, **options):
        users = CustomUser.objects.all()
        if not users:
            self.stdout.write(self.style.WARNING("No users found in the database."))
            return

        self.stdout.write(self.style.SUCCESS(f"{'ID':<5} | {'USERNAME':<20} | {'ROLE':<10}"))
        self.stdout.write(self.style.SUCCESS("-" * 40))

        for user in users:
            self.stdout.write(f"{user.id:<5} | {user.username:<20} | {user.role:<10}")
