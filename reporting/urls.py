from django.conf.urls import url
from . import views


urlpatterns = [
        url(r'^$', views.index, name='index'),
        url(r'^track/$', views.track, name='track'),
        url(r'^segment/$', views.segment, name='segment'),
        url(r'^project/$', views.graph, name='graph'),
    ]