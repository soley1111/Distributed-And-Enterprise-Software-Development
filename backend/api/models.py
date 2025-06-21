from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
from django.db import models
from django.contrib.auth.models import User
import os
from django.utils import timezone


class Note(models.Model):
    CATEGORY_CHOICES = [
        ('academic', 'Academic'),
        ('arts', 'Arts'),
        ('wellness', 'Wellness'),
        ('career', 'Career'),
        ('technology', 'Technology'),
        ('volunteering', 'Volunteering'),
        ('housing', 'Housing'),
        ('social', 'Social'),
        ('sports', 'Sports'),
        ('clubs', 'Clubs'),
    ]
    
    COMMUNITY_CHOICES = [
        ('cs101', 'CS101'),
        ('drama_club', 'Drama Club'),
        ('football_team', 'Football Team'),
        ('debate_society', 'Debate Society'),
    ]
    
    title = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notes")
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='academic')
    community = models.ForeignKey('Community', on_delete=models.CASCADE, related_name="notes")

    def __str__(self):
        return self.title
    
def profile_pic_upload_path(instance, filename):
    # This will save files to MEDIA_ROOT/profile_pics/user_<id>/<filename>
    return f'profile_pics/user_{instance.user.id}/{timezone.now().timestamp()}_{filename}'

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    profile_pic = models.ImageField(upload_to=profile_pic_upload_path, blank=True, null=True)
    university_email = models.EmailField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    dob = models.DateField(blank=True, null=True)
    course = models.CharField(max_length=100, blank=True, null=True)
    year = models.CharField(max_length=10, blank=True, null=True)  # Add this line
    interests = models.TextField(blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    achievements = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_global_admin = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username}'s Profile"
    
class Tag(models.Model):
    name = models.CharField(max_length=30, unique=True)

    def __str__(self):
        return self.name

class Community(models.Model):
    CATEGORY_CHOICES = [
        ('academic', 'Academic'),
        ('arts', 'Arts'),
        ('wellness', 'Wellness'),
        ('career', 'Career'),
        ('technology', 'Technology'),
        ('volunteering', 'Volunteering'),
        ('housing', 'Housing'),
        ('social', 'Social'),
        ('sports', 'Sports'),
        ('clubs', 'Clubs'),
    ]
    
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True, blank=True) 
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='academic')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="created_communities")
    created_at = models.DateTimeField(auto_now_add=True)
    tags = models.ManyToManyField(Tag, blank=True, related_name='communities')
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name) 
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Membership(models.Model):
    ROLE_CHOICES = [
        ('member', 'Member'),
        ('admin', 'Admin'),
        ('moderator', 'Moderator'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="memberships")
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name="members")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'community')
    
    def __str__(self):
        return f"{self.user.username} - {self.community.name} ({self.role})"

from django.db import models
from django.contrib.auth.models import User
from django.conf import settings

class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    date = models.DateField()
    time = models.TimeField()
    location = models.CharField(max_length=255, blank=True, null=True)
    virtual_link = models.URLField(blank=True, null=True)
    event_type = models.CharField(
        max_length=20,
        choices=[('in_person', 'In-Person'), ('virtual', 'Virtual')],
        default='in_person'
    )
    max_capacity = models.PositiveIntegerField(null=True, blank=True)
    required_materials = models.TextField(blank=True, null=True)
    community = models.ForeignKey('Community', on_delete=models.CASCADE, related_name='events', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_events')

class FriendRequest(models.Model):
    sender = models.ForeignKey(User, related_name='sent_requests', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='received_requests', on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=[('pending', 'Pending'), ('accepted', 'Accepted')], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('sender', 'receiver')

    def __str__(self):
        return f"{self.sender.username} -> {self.receiver.username} ({self.status})"
    
class EventSignup(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='event_signups')
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='signups')
    signed_up_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'event')  # Prevent duplicate signups

    def __str__(self):
        return f"{self.user.username} signed up for {self.event.title}"

