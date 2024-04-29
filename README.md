# MTF Team 3 receipts reader webapp

some info about the app 

## Prerequisites

Before starting, make sure you have the following software installed on your computer:

- [Python](https://www.python.org/downloads/) (>= 3.6)
- [Node.js](https://nodejs.org/en/download/) (>= 10.x)
- [Git](https://git-scm.com/)
- [Postgres](https://www.postgresql.org/download/)

## Setup
1. Clone the repo

   `git clone  <repository-url>`
2. Install frontend modules 

   `npm install`

3. Setp up backend virtual environment 

   `python -m venv .venv`
4. Start virtual environment on Windows

    `.venv\Scripts\activate.bat`

5. Install libraries

    `pip install -r requirements.txt`


## Run locally


## Setup DB
Run `api\Scripts\initdb.sql` 

## Environment file
Create a file called `.env`

Add this info to it:

```
REACT_APP_BASE_URL="http://127.0.0.1:5000"
FLASK_APP=api\app.py
FLASK_ENV=development
SQLALCHEMY_DATABASE_URI=postgresql://username:password@localhost/database
```

Note: the useername and password will be the when postgres was set up and Database is the database name which you have to create locally. 


### Backend 
run `npm run start-api`

Backend will run on default port of 5000

### Frontend

run `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

