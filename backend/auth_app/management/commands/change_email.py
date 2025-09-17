from django.core.management.base import BaseCommand, CommandError
from auth_app.models import CustomUser

class Command(BaseCommand):
    help = "Changes a user's email address."

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help="The username of the user whose email you want to change.")
        parser.add_argument('new_email', type=str, help="The new email address for the user.")

    def handle(self, *args, **options):
        username = options['username']
        new_email = options['new_email']

        try:
            user = CustomUser.objects.get(username=username)
            user.email = new_email
            user.save()
            self.stdout.write(self.style.SUCCESS(f"Successfully changed email for user '{username}' to '{new_email}'."))
        except CustomUser.DoesNotExist:
            raise CommandError(f"User with username '{username}' does not exist.")
