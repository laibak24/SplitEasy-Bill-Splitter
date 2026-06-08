# SplitEasy – Serverless Bill Splitting Application

A cloud-native bill splitting application built using AWS serverless services. SplitEasy allows users to securely create, manage, and track shared expenses while leveraging modern DevOps practices and scalable cloud infrastructure.

## Live Demo

**Frontend (CloudFront HTTPS URL)**
https://d24cnfvnjyoevy.cloudfront.net/

**Repository**
https://github.com/laibak24/SplitEasy-Bill-Splitter

---

# Project Overview

SplitEasy simplifies expense sharing among friends, roommates, and teams. Users can securely authenticate, create bills, split costs among participants, and view their expense history through a responsive web interface.

The application follows a serverless architecture using AWS services, ensuring scalability, high availability, minimal operational overhead, and cost efficiency.

---

# Features

### Authentication

* User registration and login using Amazon Cognito
* Secure JWT-based authentication
* Persistent login sessions
* Sign out functionality

### Bill Splitting

* Create shared expenses
* Automatically calculate equal splits
* Support multiple participants
* Store split history

### Dashboard

* Total splits tracked
* Total amount managed
* Number of participants involved
* Expense history overview

### Cloud Infrastructure

* Serverless backend using AWS Lambda
* REST APIs via API Gateway
* DynamoDB data storage
* CloudFront CDN delivery
* S3 static website hosting

---

# System Architecture

```text
┌─────────────────────┐
│      React UI       │
│   (Vite Frontend)   │
└──────────┬──────────┘
           │ HTTPS
           ▼
┌─────────────────────┐
│     CloudFront      │
│   Global CDN Layer  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│         S3          │
│ Static Website Host │
└─────────────────────┘


User Authentication Flow
────────────────────────

User
 │
 ▼
Amazon Cognito
 │
 ▼
JWT Token
 │
 ▼
React Frontend
 │
 ▼
API Gateway
 │
 ▼
AWS Lambda
 │
 ▼
DynamoDB


Expense Management Flow
───────────────────────

User
 │
 ▼
Frontend Form
 │
 ▼
API Gateway
 │
 ▼
CreateSplit Lambda
 │
 ▼
DynamoDB


History Retrieval Flow
──────────────────────

User
 │
 ▼
Dashboard
 │
 ▼
API Gateway
 │
 ▼
GetSplits Lambda
 │
 ▼
DynamoDB
```

---

# Technology Stack

## Frontend

* React.js
* Vite
* JavaScript
* CSS

## Backend

* AWS Lambda
* API Gateway
* Node.js

## Database

* Amazon DynamoDB

## Authentication

* Amazon Cognito

## Infrastructure

* AWS SAM (Serverless Application Model)
* CloudFormation

## Hosting & Delivery

* Amazon S3
* Amazon CloudFront

## Version Control

* Git
* GitHub

---

# AWS Services Used

| Service        | Purpose                            |
| -------------- | ---------------------------------- |
| Cognito        | Authentication and User Management |
| API Gateway    | REST API Management                |
| Lambda         | Serverless Business Logic          |
| DynamoDB       | NoSQL Database                     |
| S3             | Frontend Hosting                   |
| CloudFront     | CDN and HTTPS Delivery             |
| CloudFormation | Infrastructure as Code             |
| AWS SAM        | Deployment Automation              |

---

# Project Structure

```text
SplitEasy-Bill-Splitter/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── dist/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── createSplit.js
│   │   ├── getSplits.js
│   │   └── calculate.js
│   │
│   └── tests/
│
├── infra/
│   └── template.yaml
│
├── README.md
├── .gitignore
└──samconfig.toml
```

---

# Deployment Architecture

```text
CloudFront
      │
      ▼
S3 Static Website
      │
      ▼
React Frontend
      │
      ▼
API Gateway
      │
 ┌────┴────┐
 ▼         ▼
Create   Get
Split    Splits
Lambda   Lambda
   │
   ▼
DynamoDB
```

---

# API Endpoints

## Create Split

```http
POST /splits
```

Creates a new bill split.

---

## Get Splits

```http
GET /splits
```

Retrieves all splits created by the authenticated user.

---

# Security Features

* Cognito User Pool Authentication
* JWT Token Validation
* Protected API Endpoints
* HTTPS Delivery through CloudFront
* Serverless Infrastructure Isolation
* IAM Role-Based Permissions

---

# Deployment Steps

## Backend Deployment

```bash
sam build
sam deploy
```

---

## Frontend Deployment

```bash
npm install
npm run build

aws s3 sync dist s3://YOUR_BUCKET_NAME --delete
```

---

## CloudFront Cache Refresh

```bash
aws cloudfront create-invalidation \
--distribution-id DISTRIBUTION_ID \
--paths "/*"
```

---

# Future Enhancements

* Unequal expense splitting
* Group management
* Expense categories
* Export reports
* Email notifications
* Dark mode UI
* Multi-currency support
* Mobile application

---

# Team Members

* Ansharah Asad [22K-4411]
* Laiba Khan [22K-4610]

# License

This project was developed for academic purposes as part of a DevOps course project and demonstrates the implementation of serverless cloud architecture using AWS services.
