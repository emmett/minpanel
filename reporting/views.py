from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from models import Project, Event
import time, datetime, json, hashlib, uuid, base64

def index(request):
    if request.user.is_authenticated():
        return HttpResponse("Authenticated")
    return HttpResponse("HI")

def user_logout(request):
    logout(request)
    return redirect('/')

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
    b64data = request.GET.get('data', None)
    data = json.loads(base64.b64decode(b64data))
    resp = {'status': 'Fail', 'context': 'An Unexpected Error Occurred'}
    if not data:
        resp['status'] = 'Fail'
        resp['context'] = 'No Event Data'

    token = data.get("token")
    name = data.get("event")
    ts = data.get("ts", time.time())
    ts = int(ts)
    if token and name:
        event = Event.objects.create(token=token, name=name, ts=ts)
        resp['status'] = 'Success'
        print resp
    print resp['status']
    response = HttpResponse(json.dumps(resp))
    response["Access-Control-Allow-Origin"] = "*" 
    return response 


