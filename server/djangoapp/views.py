import json
import logging

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from .models import CarMake, CarModel
from .restapis import analyze_review_sentiments, get_request, post_review

logger = logging.getLogger(__name__)


def about(request):
    return render(request, "About.html")


def contact(request):
    return render(request, "Contact.html")


def index(request):
    return render(request, "index.html")


@csrf_exempt
def login_user(request):
    if request.method != "POST":
        return JsonResponse(
            {"error": "Method not allowed. Use POST."},
            status=405,
        )
    try:
        data = json.loads(request.body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({"error": "Invalid JSON request."}, status=400)

    username = data.get("userName", "")
    password = data.get("password", "")
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return JsonResponse({"userName": username, "status": "Authenticated"})
    return JsonResponse(
        {"userName": username, "error": "Invalid username or password"},
        status=401,
    )


def logout_request(request):
    logout(request)
    return JsonResponse({"userName": ""})


@csrf_exempt
def registration(request):
    if request.method != "POST":
        return JsonResponse(
            {"error": "Method not allowed. Use POST."},
            status=405,
        )
    try:
        data = json.loads(request.body)
        username = data["userName"]
        password = data["password"]
    except (KeyError, json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({"error": "Invalid registration request."}, status=400)

    if User.objects.filter(username=username).exists():
        return JsonResponse({"userName": username, "error": "Already Registered"})

    user = User.objects.create_user(
        username=username,
        first_name=data.get("firstName", ""),
        last_name=data.get("lastName", ""),
        email=data.get("email", ""),
        password=password,
    )
    login(request, user)
    return JsonResponse({"userName": username, "status": "Authenticated"})


def get_cars(request):
    car_models = CarModel.objects.select_related("car_make")
    cars = [
        {"CarModel": car_model.name, "CarMake": car_model.car_make.name}
        for car_model in car_models
    ]
    if not cars:
        from .populate import initiate

        initiate()
        return get_cars(request)
    return JsonResponse({"CarModels": cars})


def get_dealerships(request, state="All"):
    endpoint = "/fetchDealers" if state == "All" else f"/fetchDealers/{state}"
    dealerships = get_request(endpoint)
    return JsonResponse({"status": 200, "dealers": dealerships})


def get_dealer_details(request, dealer_id):
    if not dealer_id:
        return JsonResponse({"status": 400, "message": "Bad Request"}, status=400)
    dealership = get_request(f"/fetchDealer/{dealer_id}")
    return JsonResponse({"status": 200, "dealer": dealership})


def get_dealer_reviews(request, dealer_id):
    if not dealer_id:
        return JsonResponse({"status": 400, "message": "Bad Request"}, status=400)
    reviews = get_request(f"/fetchReviews/dealer/{dealer_id}")
    for review_detail in reviews:
        response = analyze_review_sentiments(review_detail.get("review", ""))
        review_detail["sentiment"] = response.get("sentiment", "neutral")
    return JsonResponse({"status": 200, "reviews": reviews})


@csrf_exempt
def add_review(request):
    if request.user.is_anonymous:
        return JsonResponse({"status": 403, "message": "Unauthorized"}, status=403)
    if request.method != "POST":
        return JsonResponse(
            {"error": "Method not allowed. Use POST."},
            status=405,
        )
    try:
        data = json.loads(request.body)
        response = post_review(data)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({"error": "Invalid JSON request."}, status=400)
    except ValueError as exc:
        logger.exception("Unable to post review: %s", exc)
        return JsonResponse({"status": 502, "message": str(exc)}, status=502)
    return JsonResponse({"status": 200, "result": response})
