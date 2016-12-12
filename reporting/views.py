from django.shortcuts import render, HttpResponse, redirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from models import Project, Event
import time, datetime, json, uuid, base64

def index(request):
    if request.user.is_authenticated():
        # Redirect to project page
        return redirect('/reporting/project/')
    if request.POST:
        loggedin = user_login(request)
        if loggedin:
            return redirect('/reporting/project/')

    # Redirect to login/create page
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

def graph(request):
    # leverage render context to set project and user info
    if not request.user.is_authenticated():
        return redirect('/')
    else:
        if request.POST.get('project'):
            name = request.POST["project"]
            genProject(request.user, name)
            return redirect('/')
        user = User.objects.get(username=request.user)
        projects = getOrCreateProjects(user)
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
    for dateObj in daterange(from_date, to_date):
        date = dateObj.strftime('%Y-%m-%d')
        events = Event.objects.filter(token=token).filter(date=date)
        result[date] = {}
        result[date] = len(events)
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
