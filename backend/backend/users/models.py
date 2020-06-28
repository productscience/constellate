from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import CharField
from django.urls import reverse
from django.utils.translation import ugettext_lazy as _
from django.conf import settings

from taggit.managers import TaggableManager


class User(AbstractUser):

    # First Name and Last Name do not cover name patterns
    # around the globe.
    name = CharField(_("Name of User"), blank=True, max_length=255)

    def get_absolute_url(self):
        return reverse("users:detail", kwargs={"username": self.username})


class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    twitter = models.CharField(_("phone"), max_length=254, blank=True, null=True)
    website = models.URLField(_("website"), max_length=200, blank=True, null=True)
    twitter = models.CharField(_("twitter"), max_length=254, blank=True, null=True)
    facebook = models.CharField(_("facebook"), max_length=254, blank=True, null=True)
    linkedin = models.CharField(_("linkedin"), max_length=254, blank=True, null=True)
    bio = models.TextField(_("bio"), blank=True, null=True)
    models.BooleanField(_("visible"), default=False)

    tags = TaggableManager()

    class Meta:
        verbose_name = _("Profile")
        verbose_name_plural = _("Profiles")

    @property
    def name(self):
        return self.user.name

    @property
    def email(self):
        return self.user.email

    def __str__(self):
        return self.user.name

    def get_absolute_url(self):
        return reverse("profile_detail", kwargs={"pk": self.pk})
