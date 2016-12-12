from __future__ import unicode_literals

from django.db import models

class Project(models.Model):
    name = models.CharField(max_length=100)
    token = models.CharField(max_length=100)
    def __unicode__(self):
        return self.name

class Event(models.Model):
    ts = models.IntegerField()
    name = models.CharField(max_length=100)
    token = models.CharField(max_length=100)
    date = models.CharField(max_length=100)
