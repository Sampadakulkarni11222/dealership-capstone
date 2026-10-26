"""
Run via `python manage.py shell -c "from djangoapp.populate import initiate; initiate()"`
or automatically the first time /djangoapp/get_cars is hit with an empty DB.
"""


def initiate():
    from .models import CarMake, CarModel

    car_make_data = [
        {"name": "NissanX", "description": "Great cars. Japanese technology"},
        {"name": "Toyota", "description": "Great cars. Japanese technology"},
        {"name": "Ford", "description": "American company known for pickup trucks"},
        {"name": "BMW", "description": "German luxury and performance vehicles"},
        {"name": "Chevrolet", "description": "One of the largest American car brands"},
    ]

    car_make_instances = []
    for data in car_make_data:
        car_make, _ = CarMake.objects.get_or_create(
            name=data["name"], defaults={"description": data["description"]}
        )
        car_make_instances.append(car_make)

    car_model_data = [
        {"name": "Sentra", "type": "Sedan", "year": 2022, "car_make": car_make_instances[0]},
        {"name": "Camry", "type": "Sedan", "year": 2023, "car_make": car_make_instances[1]},
        {"name": "Corolla", "type": "Sedan", "year": 2022, "car_make": car_make_instances[1]},
        {"name": "F-150", "type": "Truck", "year": 2023, "car_make": car_make_instances[2]},
        {"name": "Mustang", "type": "Coupe", "year": 2022, "car_make": car_make_instances[2]},
        {"name": "X5", "type": "SUV", "year": 2023, "car_make": car_make_instances[3]},
        {"name": "3 Series", "type": "Sedan", "year": 2023, "car_make": car_make_instances[3]},
        {"name": "Malibu", "type": "Sedan", "year": 2022, "car_make": car_make_instances[4]},
    ]

    for data in car_model_data:
        CarModel.objects.get_or_create(
            name=data["name"],
            car_make=data["car_make"],
            defaults={"type": data["type"], "year": data["year"]},
        )
