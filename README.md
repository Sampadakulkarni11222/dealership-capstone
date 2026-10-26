# Cars Dealership — Full-Stack Capstone Project

A responsive web application for a national car retailer. Users can browse
dealership branches, filter by state, view dealer details and reviews
(with sentiment analysis), and — once logged in — post their own reviews.

**Stack:** React · Django · Node.js/Express · MongoDB · Flask (sentiment
analysis) · Docker · Kubernetes · GitHub Actions CI/CD.

---

## 1. Project structure

```
dealership-capstone/
├── server/                    # Django app (also serves the React build)
│   ├── djangoproj/            # Django project settings/urls/wsgi
│   ├── djangoapp/             # Models (CarMake, CarModel), views, admin
│   │   └── static/djangoapp/
│   ├── frontend/
│   │   ├── static/            # About.html, Contact.html, style.css,
│   │   │                      # and a working vanilla-JS index.html
│   │   ├── src/components/    # React source: Login, Register, Dealers,
│   │   │                      # Dealer, PostReview, Header (.jsx)
│   │   └── package.json
│   ├── manage.py
│   ├── requirements.txt
│   └── Dockerfile
├── database/                  # Node/Express + MongoDB microservice
│   ├── app.js, models/, data/ (seed dealers & reviews), seed.js
│   ├── package.json
│   └── Dockerfile
├── sentiment_analyzer/        # Flask microservice (TextBlob sentiment)
│   ├── app.py, requirements.txt, Dockerfile
├── k8s/                       # Kubernetes manifests for every service
├── .github/workflows/ci.yml   # CI/CD pipeline
├── scripts/generate_task_outputs.sh   # cURL helper for assignment screenshots
├── docker-compose.yml         # Run the whole stack with one command
└── .env.example
```

---

## 2. Run it in VS Code (local, no Docker)

You'll run three backends (Mongo, Node, Flask) plus Django. Open four
terminals in VS Code (`` Ctrl+` `` or `` Cmd+` ``, then the `+` icon to split).

### Prerequisites
- Python 3.11+ and `pip`
- Node.js 18+ and `npm`
- MongoDB (local install, or use Docker just for Mongo: `docker run -d -p 27017:27017 --name mongo mongo:6`)
- Git

### Terminal 1 — MongoDB
```bash
mongod --dbpath ./mongo-data
# or, if you'd rather not install Mongo locally:
docker run -d -p 27017:27017 --name mongo mongo:6
```

### Terminal 2 — Node/Express database service
```bash
cd database
npm install
npm run seed      # loads sample dealers + reviews into Mongo
npm start         # runs on http://localhost:3030
```

### Terminal 3 — Flask sentiment analyzer
```bash
cd sentiment_analyzer
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py                   # runs on http://localhost:5050
```

### Terminal 4 — Django app
```bash
cd server
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser   # create an admin/root login for the admin pages
python manage.py runserver         # runs on http://localhost:8000
```

Open **http://localhost:8000/djangoapp/** — you should see the dealer list
(loaded from the Node/Mongo service), and **http://localhost:8000/djangoapp/about/**
/ **`/contact/`** for the static pages. **http://localhost:8000/admin/** is the
Django admin (log in with the superuser you just created) — this is where
you add/inspect `CarMake` / `CarModel` records for Tasks 12–15.

To populate car makes/models quickly instead of typing them into the admin:
```bash
python manage.py shell -c "from djangoapp.populate import initiate; initiate()"
```

### Optional: build the full React UI
The app works out of the box using a small vanilla-JS page
(`server/frontend/static/index.html`) so you don't need Node tooling just to
click through it. To build the polished React version (the one graded via
`Register.jsx`, `Login.jsx`, etc.):
```bash
cd server/frontend
npm install
npm run build
# copy the build output where Django's STATICFILES_DIRS/TEMPLATES can see it:
cp build/index.html static/index.html
cp -r build/static/* static/
```

---

## 3. Run everything with Docker (recommended — one command)

```bash
docker compose up --build
```

This starts Mongo, the Node database service, the Flask sentiment
analyzer, and the Django app together, wired up via the environment
variables in `docker-compose.yml`. Then seed the database once:

```bash
docker compose exec database_service npm run seed
docker compose exec django_app python manage.py migrate
docker compose exec django_app python manage.py createsuperuser
```

Visit **http://localhost:8000**. Take your `django_server.png` screenshot
of the terminal running this command for **Task 2**.

Stop everything with `docker compose down` (add `-v` to also wipe the Mongo
volume).

---

## 4. Generating the cURL-based assignment answers

Once the stack is running (Docker or local), run:

```bash
chmod +x scripts/generate_task_outputs.sh
./scripts/generate_task_outputs.sh
```

This saves `docs/loginuser.txt`, `logoutuser.txt`, `getalldealers.txt`,
`getdealerbyid.txt`, `getdealerreviews.txt`, `getdealersbyState.txt`,
`getallcarmakes.txt`, and `analyzereview.txt` — copy their contents
straight into the corresponding assignment text fields (Tasks 5, 6, 8, 9,
10, 11, 14/15, 16). Edit the username/password in the script first if you
didn't create `testuser` / `testpass123`.

---

## 5. Push the code to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Cars Dealership capstone project"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

Pushing to `main` automatically triggers `.github/workflows/ci.yml` (Task
23 — screenshot the successful run under the repo's **Actions** tab, or
copy the log text into a file named `CICD`).

---

## 6. Build & push Docker images

```bash
docker build -t <dockerhub-username>/dealership-django:latest ./server
docker build -t <dockerhub-username>/dealership-database:latest ./database
docker build -t <dockerhub-username>/dealership-sentiment:latest ./sentiment_analyzer

docker login
docker push <dockerhub-username>/dealership-django:latest
docker push <dockerhub-username>/dealership-database:latest
docker push <dockerhub-username>/dealership-sentiment:latest
```

---

## 7. Deploy to Kubernetes (e.g. IBM Cloud Code Engine / any K8s cluster)

1. Edit the `image:` fields in `k8s/database-deployment.yaml`,
   `k8s/sentiment-deployment.yaml`, and `k8s/django-deployment.yaml`,
   replacing `<YOUR_REGISTRY>` with the images you just pushed.
2. Apply the manifests:

```bash
kubectl apply -f k8s/mongo-deployment.yaml
kubectl apply -f k8s/database-deployment.yaml
kubectl apply -f k8s/sentiment-deployment.yaml
kubectl apply -f k8s/django-deployment.yaml
```

3. Check status and get the external URL:

```bash
kubectl get pods
kubectl get services
```

`django-app-service` is a `LoadBalancer` — its `EXTERNAL-IP` (or, on IBM
Cloud Code Engine, the app's public route) is your deployment URL for
**Task 24**. Save it to a file named `deploymentURL`, and take the
`deployed_*` screenshots (Tasks 25–28) against that live URL.

---

## 8. Mapping code to assignment tasks

| Task(s) | Where in this repo |
|---|---|
| 1 | This README / repo root |
| 2 | Output of `docker compose up` or `python manage.py runserver` |
| 3 | `server/frontend/static/About.html` |
| 4 | `server/frontend/static/Contact.html` |
| 5–6 | `scripts/generate_task_outputs.sh` → `docs/loginuser.txt`, `logoutuser.txt` |
| 7 | `server/frontend/src/components/Register/Register.jsx` |
| 8–11 | `scripts/generate_task_outputs.sh` → `docs/getdealerreviews.txt`, `getalldealers.txt`, `getdealerbyid.txt`, `getdealersbyState.txt` |
| 12–13 | `http://localhost:8000/admin/` (screenshot login/logout) |
| 14–15 | `docs/getallcarmakes.txt`, and Django admin for `CarMake`/`CarModel` |
| 16 | `docs/analyzereview.txt` |
| 17–22 | React/vanilla UI at `/djangoapp/` — dealers list, dealer detail, post review |
| 23 | `.github/workflows/ci.yml` — GitHub Actions **Actions** tab |
| 24–28 | Your Kubernetes/Code Engine deployment URL + screenshots taken against it |

---

## 9. Notes and honest caveats

- The Flask service uses **TextBlob** for sentiment (positive/neutral/negative)
  rather than a large ML model, so it runs anywhere without GPU/heavy downloads.
- Screenshots (Tasks 12–13, 17–22, 25–28) can't be generated for you — they
  have to be taken from your own browser session so they show *your*
  logged-in username and *your* deployment URL, which is what the rubric
  is actually checking.
- The included `index.html` is a minimal vanilla-JS UI so the app is
  clickable immediately; build the React app (`npm run build`) for the
  polished version that matches the `.jsx` source graded in Task 7.
