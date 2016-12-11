from django.contrib import admin
from models import Project, Event

class ProjectAdmin(admin.ModelAdmin):
    list_display = ["name", "token"]
    class Meta:
        model = Project

class EventAdmin(admin.ModelAdmin):
    list_display = ["name", "ts", "token"]
    class Meta:
        model = Event

admin.site.register(Project, ProjectAdmin)
admin.site.register(Event, EventAdmin)
