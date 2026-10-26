#!/usr/bin/env bash
# Run this AFTER `docker compose up` (or after starting each service locally)
# and after creating an admin user with `python manage.py createsuperuser`.
#
# It saves the exact cURL command + its output into text files under docs/,
# matching what the assignment's peer-review rubric asks you to submit
# (loginuser, logoutuser, getdealerreviews, getalldealers, getdealerbyid,
# getdealersbyState, getallcarmakes, analyzereview).
#
# Usage: ./scripts/generate_task_outputs.sh

set -e
mkdir -p docs

DJANGO_URL="http://localhost:8000"
NODE_URL="http://localhost:3030"
FLASK_URL="http://localhost:5050"

run_and_save() {
  local file="$1"; shift
  local cmd="$*"
  {
    echo "\$ $cmd"
    echo "---"
    eval "$cmd"
  } > "docs/$file.txt"
  echo "Saved docs/$file.txt"
}

# Task 5: login (adjust username/password to a real user you created)
run_and_save "loginuser" \
  "curl -s -c cookies.txt -X POST $DJANGO_URL/djangoapp/login -H 'Content-Type: application/json' -d '{\"userName\":\"testuser\",\"password\":\"testpass123\"}'"

# Task 6: logout
run_and_save "logoutuser" \
  "curl -s -b cookies.txt $DJANGO_URL/djangoapp/logout"

# Task 9: all dealers
run_and_save "getalldealers" \
  "curl -s $NODE_URL/fetchDealers"

# Task 10: single dealer by id
run_and_save "getdealerbyid" \
  "curl -s $NODE_URL/fetchDealer/1"

# Task 8: reviews for a dealer
run_and_save "getdealerreviews" \
  "curl -s $NODE_URL/fetchReviews/dealer/1"

# Task 11: dealers by state (Kansas)
run_and_save "getdealersbyState" \
  "curl -s $NODE_URL/fetchDealers/Kansas"

# Task 14/15: all car makes and models
run_and_save "getallcarmakes" \
  "curl -s $DJANGO_URL/djangoapp/get_cars"

# Task 16: sentiment analysis
run_and_save "analyzereview" \
  "curl -s '$FLASK_URL/analyze/Fantastic services'"

rm -f cookies.txt
echo "Done. Review the .txt files in docs/, then copy their contents into the assignment's text fields."
