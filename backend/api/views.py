from django.shortcuts import render, get_object_or_404
from django.contrib.auth.models import User
from rest_framework import generics, views
from .serializers import UserSerializer, NoteSerializer, ProfileSerializer, CommunitySerializer, MembershipSerializer, CreateCommunitySerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Note, Community, Membership, Profile
from rest_framework import status, filters
from rest_framework.response import Response
from django.db import models
from rest_framework.exceptions import PermissionDenied
from rest_framework import permissions
from .models import Event, EventSignup
from .serializers import EventSerializer
from django.http import JsonResponse
from django.db.models import Q
from .models import User
from .models import FriendRequest
from .serializers import FriendRequestSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import IsAdminUser
from django.db.models import Q
from .serializers import EventSignupSerializer



class NoteListCreate(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['category', 'community']
    ordering_fields = ['created_at']

    def get_queryset(self):
        queryset = Note.objects.all()
        
        # Get the author filter from query params
        author = self.request.query_params.get('author')
        if author:
            queryset = queryset.filter(author__username=author)
        
        # Apply other filters if provided
        category = self.request.query_params.get('category')
        community = self.request.query_params.get('community')
        
        if category:
            queryset = queryset.filter(category=category)
        if community:
            queryset = queryset.filter(community=community)
            
        # Apply ordering
        ordering = self.request.query_params.get('ordering', '-created_at')
        if ordering in self.ordering_fields:
            queryset = queryset.order_by(ordering)
            
        return queryset

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user)
        else:
            print(serializer.errors)


class NoteDelete(generics.DestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Note.objects.all()

    def perform_destroy(self, instance):
        user = self.request.user
        if instance.author == user:
            instance.delete()
        else:
            membership = Membership.objects.filter(user=user, community__name=instance.community).first()
            if membership and membership.role in ['moderator', 'admin']:
                instance.delete()
            else:
                raise PermissionDenied("You do not have permission to delete this post.")


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'user__username'
    lookup_url_kwarg = 'username'

    def get_queryset(self):
        queryset = Community.objects.annotate(
            member_count=models.Count('members')
        )
        
        # Filter by category if provided
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by membership status if provided
        membership = self.request.query_params.get('membership')
        user_filter = self.request.query_params.get('user')
        
        if membership and user_filter:
            try:
                user = User.objects.get(username=user_filter)
                if membership == 'joined':
                    queryset = queryset.filter(members__user=user)
                elif membership == 'not_joined':
                    queryset = queryset.exclude(members__user=user)
            except User.DoesNotExist:
                pass
        
        return queryset

    def get_object(self):
        if 'username' in self.kwargs:
            username = self.kwargs['username']
            return get_object_or_404(Profile, user__username=username)
        else:
            profile, created = Profile.objects.get_or_create(user=self.request.user)
            return profile

    def perform_update(self, serializer):
        # Handle file deletion if needed
        if 'profile_pic' in self.request.data and self.request.data['profile_pic'] == 'null':
            instance = self.get_object()
            if instance.profile_pic:
                instance.profile_pic.delete()
        serializer.save()
    
class CommunityListCreate(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'category', 'tags__name']
    ordering_fields = ['name', 'created_at', 'member_count']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateCommunitySerializer
        return CommunitySerializer
    
    def get_queryset(self):
        queryset = Community.objects.annotate(
            member_count=models.Count('members')
        )
        
        # Filter by category if provided
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by membership status if provided
        membership = self.request.query_params.get('membership')

        if membership and self.request.user.is_authenticated:
            if membership == 'joined':
                queryset = queryset.filter(members__user=self.request.user)
            elif membership == 'not_joined':
                queryset = queryset.exclude(members__user=self.request.user)
        
        return queryset
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        
        # Return the full community data including calculated fields
        community = Community.objects.get(id=serializer.data['id'])
        response_serializer = CommunitySerializer(community, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class CommunityDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def perform_destroy(self, instance):
        user = self.request.user
        is_admin_member = instance.members.filter(user=user, role='admin').exists()
    
        if not is_admin_member and not user.is_superuser:
            raise PermissionDenied("Only community admins or global admins can delete the community.")

        instance.delete()

class MembershipView(generics.CreateAPIView, generics.DestroyAPIView):
    serializer_class = MembershipSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Membership.objects.filter(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        try:
            community = Community.objects.get(id=kwargs.get('pk'))
        except Community.DoesNotExist:
            return Response(
                {"detail": "Community not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if already a member
        if Membership.objects.filter(user=request.user, community=community).exists():
            return Response(
                {"detail": "You are already a member of this community."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create membership with default 'member' role
        membership = Membership.objects.create(
            user=request.user,
            community=community,
            role='member'
        )
        
        # Return the updated community data
        community_serializer = CommunitySerializer(community, context={'request': request})
        return Response(community_serializer.data, status=status.HTTP_201_CREATED)

    
    def destroy(self, request, *args, **kwargs):
        community_id = kwargs.get('pk')
        try:
            membership = Membership.objects.get(
                user=request.user,
                community_id=community_id
            )
        except Membership.DoesNotExist:
            return Response(
                {"detail": "You are not a member of this community."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Prevent admins from leaving (must transfer admin first)
        if membership.role == 'admin':
            other_admins = Membership.objects.filter(
                community=membership.community,
                role='admin'
            ).exclude(user=request.user).exists()
            if not other_admins:
                return Response(
                    {"detail": "You are the only admin. Assign another admin before leaving."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        membership.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
        
class CommunityDetailBySlug(generics.RetrieveAPIView):
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer
    lookup_field = 'slug'

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class CommunityPostsView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, slug):
        community = get_object_or_404(Community, slug=slug)
        notes = Note.objects.filter(community=community)
        serializer = NoteSerializer(notes, many=True)
        return Response(serializer.data)

class EventListCreateView(generics.ListCreateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

    def perform_destroy(self, instance):
        if instance.created_by != self.request.user:
            raise PermissionDenied("You do not have permission to delete this event.")
        instance.delete()

from django.http import JsonResponse
from django.db.models import Q
from .models import Profile  # Use Profile instead of User

def search_students(request):
    username = request.GET.get('username', '')
    course = request.GET.get('course', '')
    interests = request.GET.get('interests', '')

    students = User.objects.all()

    if username:
        students = students.filter(username__icontains=username)
    if course:
        students = students.filter(profile__course__icontains=course)
    if interests:
        students = students.filter(profile__interests__icontains=interests)

    serializer = UserSerializer(students, many=True)
    return JsonResponse(serializer.data, safe=False)

class FriendRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        receiver_id = request.data.get('receiver_id')
        try:
            receiver = User.objects.get(id=receiver_id)
            if receiver == request.user:
                return Response({"detail": "You cannot add yourself as a friend."}, status=status.HTTP_400_BAD_REQUEST)
            
            # Prevent duplicate friend requests
            if FriendRequest.objects.filter(
                models.Q(sender=request.user, receiver=receiver) | 
                models.Q(sender=receiver, receiver=request.user)
            ).exists():
                return Response({"detail": "Friend request already exists."}, status=status.HTTP_400_BAD_REQUEST)
            
            FriendRequest.objects.create(sender=request.user, receiver=receiver)
            return Response({"detail": "Friend request sent."}, status=status.HTTP_201_CREATED)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    def get(self, request):
        requests = FriendRequest.objects.filter(receiver=request.user, status='pending')
        serializer = FriendRequestSerializer(requests, many=True)
        return Response(serializer.data)

    def patch(self, request, pk):
        try:
            friend_request = FriendRequest.objects.get(id=pk, receiver=request.user)
            action = request.data.get('action')
            if action == 'accept':
                friend_request.status = 'accepted'
                friend_request.save()
                return Response({"detail": "Friend request accepted."})
            elif action == 'decline':
                friend_request.delete()
                return Response({"detail": "Friend request declined."})
            else:
                return Response({"detail": "Invalid action."}, status=status.HTTP_400_BAD_REQUEST)
        except FriendRequest.DoesNotExist:
            return Response({"detail": "Friend request not found."}, status=status.HTTP_404_NOT_FOUND)

class FriendsListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        friends = User.objects.filter(
            sent_requests__receiver=user, sent_requests__status="accepted"
        ) | User.objects.filter(
            received_requests__sender=user, received_requests__status="accepted"
        )
        friends_data = [{"id": friend.id, "username": friend.username} for friend in friends]
        return Response(friends_data)

class RemoveFriendView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            friend = User.objects.get(pk=pk)
            # Remove the friendship (both directions)
            request.user.sent_requests.filter(receiver=friend, status="accepted").delete()
            request.user.received_requests.filter(sender=friend, status="accepted").delete()
            return Response({"detail": "Friend removed successfully."}, status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response({"detail": "Friend not found."}, status=status.HTTP_404_NOT_FOUND)
        

class UpdateMembershipRoleView(APIView):
    permission_classes = [IsAdminUser]  # Only superusers can do this

    def post(self, request, *args, **kwargs):
        community_id = kwargs.get('community_id')
        username = request.data.get('username')
        new_role = request.data.get('role')

        if new_role not in ['member', 'moderator', 'admin']:
            return Response({'detail': 'Invalid role'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            community = Community.objects.get(id=community_id)
            user = User.objects.get(username=username)
            membership = Membership.objects.get(user=user, community=community)
            membership.role = new_role
            membership.save()
            return Response({'detail': f"{username}'s role updated to {new_role}"})
        except (Community.DoesNotExist, User.DoesNotExist, Membership.DoesNotExist):
            return Response({'detail': 'User or community not found'}, status=status.HTTP_404_NOT_FOUND)
        
class EventDeleteView(generics.DestroyAPIView):
    queryset = Event.objects.all()
    permission_classes = [IsAuthenticated]

    def perform_destroy(self, instance):
        user = self.request.user
        is_creator = instance.created_by == user
        is_global_admin = getattr(user, 'is_global_admin', False)

        is_community_admin_or_mod = Membership.objects.filter(
            user=user,
            community=instance.community,
            role__in=["admin", "moderator"]
        ).exists()

        if not (is_creator or is_global_admin or is_community_admin_or_mod):
            raise PermissionDenied("You don't have permission to delete this event.")

        instance.delete()

class MembershipUpdateView(generics.UpdateAPIView):
    queryset = Membership.objects.all()
    serializer_class = MembershipSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        membership = self.get_object()
        user = self.request.user
        community = membership.community  # Ensure this is fetched

    # Check if user is a global admin
        is_global_admin = user.is_superuser

    # Check if user is admin of the same community
        is_community_admin = Membership.objects.filter(
            community=community,
            user=user,
            role='admin'
        ).exists()

        if not is_global_admin and not is_community_admin:
            raise PermissionDenied("You don't have permission to promote this member.")

        serializer.save()

        
class CommunityMembersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        community = get_object_or_404(Community, pk=pk)
        members = Membership.objects.filter(community=community)
        serializer = MembershipSerializer(members, many=True)
        return Response(serializer.data)
    
class EventSignupView(generics.CreateAPIView):
    serializer_class = EventSignupSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        event_id = self.request.data.get('event')
        if not event_id:
            raise PermissionDenied("Event ID required.")
        
        try:
            event = Event.objects.get(id=event_id)
        except Event.DoesNotExist:
            raise PermissionDenied("Event not found.")

        user = self.request.user

        # Check if user is already signed up
        if EventSignup.objects.filter(event=event, user=user).exists():
            raise PermissionDenied("You are already signed up for this event.")

        # Check if user is a member of the community
        is_member = Membership.objects.filter(community=event.community, user=user).exists()
        if not is_member:
            raise PermissionDenied("You must be a member of the community to join this event.")
        
        # Check if event is full
        if event.max_capacity and EventSignup.objects.filter(event=event).count() >= event.max_capacity:
            raise PermissionDenied("This event has reached maximum capacity.")
        
        serializer.save(user=user, event=event)
        
class EventSignupListView(generics.ListAPIView):
    serializer_class = EventSignupSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        event_id = self.kwargs.get('event_id')
        return EventSignup.objects.filter(event_id=event_id)