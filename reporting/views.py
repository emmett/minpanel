from django.shortcuts import render, HttpResponse, redirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from models import Project, Event
import time, datetime, json, uuid, base64

def index(request):
    return redirect('/reporting/project/')

def project(request):
    context = {"username": request.user, "projects":projects}
    template = "project.html"
    return render(request, template, context)

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
    date = datetime.datetime.fromtimestamp(ts).strftime('%Y-%m-%d')
    if token and name:
        event = Event.objects.create(token=token, name=name, ts=ts, date=date)
        resp['status'] = 'Success'
        resp['context'] = None
    response = HttpResponse(json.dumps(resp))
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Headers"] = "content/type"
    response["Access-Control-Allow-Methods"] = "*"
    return response

def segment(request):
    token = request.GET.get('token')
    from_date = strpdate(request.GET.get('from_date'))
    to_date = strpdate(request.GET.get('to_date'))
    try:
        project = Project.objects.get(token=token)
    except:
        return HttpResponse(json.dumps({'request':request.GET, 'error': 'no project found'}))
    result = {}
    #segment by name
    for dateObj in daterange(from_date, to_date):
        date = dateObj.strftime('%Y-%m-%d')
        events = Event.objects.filter(token=token).filter(date=date)
        result[date] = {}
        result[date] = len(events)
    return HttpResponse(json.dumps(result))

def table(request):
    token = request.GET.get('token')
    from_date = strpdate(request.GET.get('from_date'))
    to_date = strpdate(request.GET.get('to_date'))
    try:
        project = Project.objects.get(token=token)
    except:
        return HttpResponse(json.dumps({'request':request.GET, 'error': 'no project found'}))
    result = []
    for dateObj in daterange(from_date, to_date):
        date = dateObj.strftime('%Y-%m-%d')
        events = [ obj.as_dict() for obj in Event.objects.filter(token=token).filter(date=date).order_by('ts')[:100]]
        result += events
    return HttpResponse(json.dumps(result))

# Helper Functions
def strpdate(date):
    return datetime.datetime.strptime(date, '%Y-%m-%d')

def daterange(start_date, end_date):
    for n in range(int ((end_date - start_date).days) + 1):
        yield start_date + datetime.timedelta(n)

def genProject(user, name):
    token = str(uuid.uuid4()).replace('-','')
    Project.objects.create(user=user, name=name, token=token)

def getOrCreateProjects(user):
    projects = user.project_set.all()
    if len(projects) == 0:
        genProject(user, 'First Project')
        projects = user.project_set.all()
    return projects
