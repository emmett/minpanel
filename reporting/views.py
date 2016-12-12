from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from models import Project, Event
import time, datetime, json, hashlib, uuid

def index(request):
    if request.user.is_authenticated():
        return HttpResponse("Authenticated")
    return HttpResponse("HI")

def user_login(request):
    try:
        username = User.objects.get(email=request.POST['email']).username
        user = authenticate(username=username, password=request.POST['password'])
        if user is not None:
            if user.is_active:
                login(request, user)
                return username
            else:
                return False
        else:
            return False
    except:
        print("Try Again, an error occurred")

def track(request):
    resp = {'status': 'pending', 'context': None}
    if len(request.GET) == 0:
        resp['status'] = 'Fail'
        resp['context'] = 'No Event Data'
    token = request.GET.get("token")
    name = request.GET.get("name")
    ts = request.GET.get("ts", time.time())
    ts = int(ts)
    if token and name:
        event = Event.objects.create(token=token, name=name, ts=ts)
        resp['status'] = 'Success'
    return HttpResponse(json.dumps(resp))

