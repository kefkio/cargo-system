from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.db.models import ManyToManyField
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Custom UserAdmin:
    - Dynamically lists all concrete non-M2M/non-reverse fields in list_display
    - Shows M2M fields in detail view via filter_horizontal
    - Avoids admin.E109 errors
    """

    # Dynamically get all fields for list_display, safe for admin
    list_display = tuple(
        f.name
        for f in User._meta.get_fields()
        if f.concrete and not f.many_to_many and not f.one_to_many and f.name != 'id'
    )

    # Optional: make email clickable in list view
    def email_link(self, obj):
        return format_html('<a href="mailto:{0}">{0}</a>', obj.email)
    email_link.short_description = "Email"

    # Filters and ordering
    list_filter = ('is_staff', 'is_superuser', 'is_active')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('username',)

    # ManyToMany fields for the detail view
    filter_horizontal = tuple(
        f.name
        for f in User._meta.get_fields()
        if isinstance(f, ManyToManyField)
    )

    def get_fieldsets(self, request, obj=None):
        """
        Dynamically generate fieldsets for the detail view.
        Standard sections + extra concrete fields.
        """
        # Standard sections
        fieldsets = [
            (None, {'fields': ('username', 'email', 'password')}),
            ('Permissions', {'fields': ('is_staff', 'is_superuser', 'is_active', 'groups', 'user_permissions')}),
            ('Important dates', {'fields': ('last_login', 'date_joined')}),
        ]

        # Existing fields to avoid duplication
        existing_fields = set(
            f for fs in fieldsets for f in fs[1]['fields']
        )

        # Add extra concrete fields dynamically
        extra_fields = [
            f.name
            for f in self.model._meta.get_fields()
            if f.concrete and f.name not in existing_fields and f.name != 'id' and not f.many_to_many
        ]

        if extra_fields:
            fieldsets.append(('Extra info', {'fields': tuple(extra_fields)}))

        return fieldsets