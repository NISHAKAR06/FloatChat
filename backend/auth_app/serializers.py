from rest_framework import serializers
from .models import CustomUser, Profile
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'username'

    def validate(self, attrs):
        # Allow login with either username or email
        username_or_email = attrs.get(self.username_field)

        # Try to get user by email first
        try:
            user_obj = CustomUser.objects.get(email=username_or_email)
            username = user_obj.username
            attrs[self.username_field] = username
        except CustomUser.DoesNotExist:
            # If email not found, use as username
            username = username_or_email

        authenticate_kwargs = {
            self.username_field: username,
            'password': attrs['password'],
        }
        user = authenticate(**authenticate_kwargs)

        if user and user.is_active:
            self.user = user
        else:
            raise serializers.ValidationError({
                'detail': 'Invalid credentials'
            })

        data = super().validate(attrs)
        refresh = self.get_token(self.user)
        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)

        # Add user data
        user_serializer = CustomUserSerializer(self.user)
        data['user'] = user_serializer.data
        return data

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'role')

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ('id', 'user')

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'password')

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        validated_data['role'] = 'user'  # Set default role
        return super().create(validated_data)
