from django.conf.urls import url
from . import views


urlpatterns = [
        url(r'^$', views.index, name='index'),
        url(r'^track/$', views.track, name='track'),
        url(r'^segment/$', views.segment, name='segment'),
        url(r'^table/$', views.table, name='table'),
        url(r'^project/$', views.project, name='project'),
    ]