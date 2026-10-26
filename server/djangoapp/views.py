import json
import logging

from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from .models import CarMake, CarModel
from .restapis import get_request, analyze_review_sentiments, post_review

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------
# Static pages
# ---------------------------------------------------------------------
def about(request):
    return render(request, "About.html")


def contact(request):
    return render(request, "Contact.html")


def index(request):
    """Landing / home page - served by the React front end in dev,
    Django simply serves the compiled index.html in production."""
    return render(request, "index.html")


# ---------------------------------------------------------------------
# Auth: login / logout / register  (called from the React front end)
# ---------------------------------------------------------------------
@csrf_exempt
def login_user(request):
    data = json.loads(request.body)
    username = data["userName"]
    password = data["password"]
    user = authenticate(username=username, password=password)
    data = {"userName": username}
    if user is not None:
        login(request, user)
        data = {"userName": username, "status": "Authenticated"}
    return JsonResponse(data)


def logout_request(request):
    username = request.user.username if request.user.is_authenticated else ""
    logout(request)
    return JsonResponse({"userName": ""})


@csrf_exempt
def registration(request):
    data = json.loads(request.body)
    username = data["userName"]
    password = data["password"]
    first_name = data.get("firstName", "")
    last_name = data.get("lastName", "")
    email = data.get("email", "")

    if User.objects.filter(username=username).exists():
        return JsonResponse({"userName": username, "error": "Already Registered"})

    user = User.objects.create_user(
        username=username,
        first_name=first_name,
        last_name=last_name,
        email=email,
        password=password,
    )
    login(request, user)
    return JsonResponse({"userName": username, "status": "Authenticated"})


# ---------------------------------------------------------------------
# CarMake / CarModel
# ---------------------------------------------------------------------
def get_cars(request):
    car_models = CarModel.objects.select_related("car_make")
    cars = []
    for cm in car_models:
        cars.append({"CarModel": cm.name, "CarMake": cm.car_make.name})
    if not cars:
        # populate database with sample data if empty (first run helper)
        from .populate import initiate
        initiate()
        return get_cars(request)
    return JsonResponse({"CarModels": cars})


# ---------------------------------------------------------------------
# Dealers / Reviews - proxied to the Node/Express + MongoDB service
# ---------------------------------------------------------------------
def get_dealerships(request, state="All"):
    if state == "All":
        endpoint = "/fetchDealers"
    else:
        endpoint = f"/fetchDealers/{state}"
    dealerships = get_request(endpoint)
    return JsonResponse({"status": 200, "dealers": dealerships})


def get_dealer_details(request, dealer_id):
    if dealer_id:
        endpoint = f"/fetchDealer/{dealer_id}"
        dealership = get_request(endpoint)
        return JsonResponse({"status": 200, "dealer": dealership})
    return JsonResponse({"status": 400, "message": "Bad Request"})


def get_dealer_reviews(request, dealer_id):
    if dealer_id:
        endpoint = f"/fetchReviews/dealer/{dealer_id}"
        reviews = get_request(endpoint)
        for review_detail in reviews:
            response = analyze_review_sentiments(review_detail.get("review", ""))
            review_detail["sentiment"] = response.get("sentiment", "neutral")
        return JsonResponse({"status": 200, "reviews": reviews})
    return JsonResponse({"status": 400, "message": "Bad Request"})


@csrf_exempt
def add_review(request):
    if not request.user.is_anonymous:
        data = json.loads(request.body)
        try:
            response = post_review(data)
            return JsonResponse({"status": 200, "result": response})
        except Exception:
            return JsonResponse(
                {"status": 401, "message": "Error in posting review"}
            )
    return JsonResponse({"status": 403, "message": "Unauthorized"})
