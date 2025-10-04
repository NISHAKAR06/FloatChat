from django.core.management.base import BaseCommand
from auth_app.models import CustomUser
from django.contrib.auth.hashers import make_password

class Command(BaseCommand):
    help = 'Changes the username and password for a user.'

    def add_arguments(self, parser):
        parser.add_argument('current_username', type=str, help='The current username of the user.')
        parser.add_argument('new_username', type=str, help='The new username for the user.')
        parser.add_argument('new_password', type=str, help='The new password for the user.')

    def handle(self, *args, **options):
        current_username = options['current_username']
        new_username = options['new_username']
        new_password = options['new_password']

        try:
            user = CustomUser.objects.get(username=current_username)
            user.username = new_username
            user.password = make_password(new_password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f"Successfully updated user '{current_username}' to '{new_username}'."))
        except CustomUser.DoesNotExist:
            self.stdout.write(self.style.ERROR(f"User with username '{current_username}' does not exist."))
