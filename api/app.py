from flask import Flask, jsonify, request 
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy


app = Flask(__name__)
cors = CORS(app)
# TODO: update postgres
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://username:password@localhost/database_name'
db = SQLAlchemy(app)




@app.route('/', methods = ['GET', 'POST']) 
def home(): 
    if(request.method == 'GET'): 
  
        data = "hello world"
        return jsonify({'data': data}) 
    
if __name__ == '__main__': 
  
    app.run(debug = True) 