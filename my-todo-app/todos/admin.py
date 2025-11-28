from django.contrib import admin
from .models import Todo


@admin.register(Todo)
class TodoAdmin(admin.ModelAdmin):
    list_display = ('title', 'completed', 'due_date', 'is_overdue', 'created_at')
    list_filter = ('completed', 'created_at', 'due_date')
    search_fields = ('title', 'description')
    date_hierarchy = 'created_at'
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Task Information', {
            'fields': ('title', 'description')
        }),
        ('Due Date & Status', {
            'fields': ('due_date', 'completed')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
