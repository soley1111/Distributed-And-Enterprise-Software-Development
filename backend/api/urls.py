from django.urls import path
from . import views
from .views import EventListCreateView, EventDetailView
from .views import FriendRequestView
from .views import FriendsListView
from .views import RemoveFriendView
from .views import EventDeleteView


urlpatterns = [
    path("notes/", views.NoteListCreate.as_view(), name="note-list"),
    path("notes/delete/<int:pk>/", views.NoteDelete.as_view(), name="delete-note"),
    path("profile/", views.ProfileView.as_view(), name="profile-current"), 
    path("profiles/<str:username>/", views.ProfileView.as_view(), name="profile-detail"),
    path("communities/", views.CommunityListCreate.as_view(), name="community-list"),
    path("communities/<int:pk>/", views.CommunityDetail.as_view(), name="community-detail"),
    path("communities/slug/<slug:slug>/", views.CommunityDetailBySlug.as_view(), name="community-detail-slug"),
    path("communities/<int:pk>/join/", views.MembershipView.as_view(), name="join-community"),
    path("communities/<int:pk>/leave/", views.MembershipView.as_view(), name="leave-community"),
    path('events/', EventListCreateView.as_view(), name='event-list-create'),
    path('events/<int:pk>/', EventDetailView.as_view(), name='event-detail'),
    path('search/students/', views.search_students, name='search_students'),
    path("friend-requests/", FriendRequestView.as_view(), name="friend-requests"),
    path("friend-requests/<int:pk>/", FriendRequestView.as_view(), name="friend-request-detail"),
    path("friends/", FriendsListView.as_view(), name="friends-list"),
    path("friends/<int:pk>/remove/", RemoveFriendView.as_view(), name="remove-friend"),
    path("communities/slug/<slug:slug>/posts/", views.CommunityPostsView.as_view(), name="community-posts"),
    path("communities/<int:community_id>/set_role/", views.UpdateMembershipRoleView.as_view(), name="set-role"),
    path("communities/<int:pk>/members/", views.CommunityMembersView.as_view(), name="community-members"),
    path("memberships/<int:pk>/", views.MembershipUpdateView.as_view(), name="membership-update"),
    path('events/<int:pk>/', EventDeleteView.as_view(), name='event-delete'),
    path('events/<int:event_id>/signups/', views.EventSignupListView.as_view()),
    path('events/signup/', views.EventSignupView.as_view()),

]
