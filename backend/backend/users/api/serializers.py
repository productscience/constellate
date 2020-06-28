from django.contrib.auth import get_user_model
from rest_framework import serializers
from taggit_serializer.serializers import TagListSerializerField, TaggitSerializer

User = get_user_model()
from ..models import Profile


class UserSerializer(serializers.ModelSerializer):

    profile = serializers.StringRelatedField()

    class Meta:
        model = User
        fields = ["username", "email", "name", "url", "profile"]

        extra_kwargs = {
            "url": {"view_name": "api:user-detail", "lookup_field": "username"}
        }


class ProfileSerializer(TaggitSerializer, serializers.ModelSerializer):

    tags = TagListSerializerField()

    class Meta:
        model = Profile
        fields = [
            "name",
            "email",
            "tags",
            "website",
            "twitter",
            "facebook",
            "linkedin",
            "bio",
        ]

