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
2. In VSCode open Terminal 

3. Install frontend modules 

   `npm install`

4. Setp up backend virtual environment 

   `python -m venv .venv`
5. Start virtual environment on Windows

    `.venv\Scripts\activate.bat`

5. Install Python libraries

    `pip install -r api/requirements.txt`


## Run locally


## Setup DB
 1. Open pgadmin (Windows : installed when installing postgres , Mac: use homebrew to install)
 2. Create Database Receipts 
 ![alt text](image.png)

3. Start new Query 
![alt text](image-1.png)

4. Copy and paste sql commands from "api\Scripts\initdb.sql" file to Query in pgadmin

5. Run commands to create tables
![alt text](image-2.png)


## Environment file
env file is a special type of file that code is able to read environment values from and use it code.

Create a file called `.env`

Add this info to it:

```
REACT_APP_BASE_URL="http://127.0.0.1:5000"
FLASK_APP=api\app.py 
FLASK_ENV=development
SQLALCHEMY_DATABASE_URI=postgresql://username:password@localhost/database
```
**Replace username , password and database with the correct values**

**MAC: update it to FLASK_APP=app/app/py**

Note: the username and password will be the when postgres was set up and Database is the database name which you have to create locally. 


### Backend 
run `npm run start-api`

Backend will run on default port of 5000

### Frontend

run `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

