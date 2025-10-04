from django.core.management.base import BaseCommand, CommandError
from auth_app.models import CustomUser

class Command(BaseCommand):
    help = 'Deletes a user from the database.'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='The username of the user to delete.')

    def handle(self, *args, **options):
        username = options['username']

        try:
            user = CustomUser.objects.get(username=username)
            user.delete()
            self.stdout.write(self.style.SUCCESS(f"Successfully deleted user '{username}'."))
        except CustomUser.DoesNotExist:
            raise CommandError(f"User with username '{username}' does not exist.")
