from __future__ import unicode_literals
from django.contrib.auth.models import User
from django.db import models

class Project(models.Model):
    user = models.ForeignKey(User)
    name = models.CharField(max_length=100)
    token = models.CharField(max_length=100)
    def __unicode__(self):
        return self.name

class Event(models.Model):
    ts = models.IntegerField()
    name = models.CharField(max_length=100)
    token = models.CharField(max_length=100)
    date = models.CharField(max_length=100)
