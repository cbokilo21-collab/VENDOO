#!/bin/bash

# Add cbokilo26@gmail.com to Firestore users collection using Firebase CLI
firebase firestore:add users --data '{
  "name": "cbokilo26",
  "email": "cbokilo26@gmail.com",
  "userType": "buyer",
  "createdAt": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'"
}'
