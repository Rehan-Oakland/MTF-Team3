item_column = ["x0", "y0", "x1", "y1", "word"]


paddle_kwargs = {
    "det_model_dir": "./Engine/inference/en_PP-OCRv3_det_infer/",
    "rec_model_dir": "./Engine/inference/en_PP-OCRv3_rec_infer/",
    "cls_model_dir": "./Engine/inference/ch_ppocr_mobile_v2.0_cls_infer/",
    "use_gpu": False,
    "use_angle_cls": False,
    "lang": "en"
}

table_headers = {
    "sayma": ["sl", "description", "quantity", "unit price", "total bill"],
    "badsha": ["sl", "description", "quantity", "price", "amount"],
    "korim": ["sl", "description", "quantity", "price", "amount"]
}

column_mapping = {
    "sayma": {
        "sl": ["description", "quantity"],
        "description": ["sl", "quantity"],
        "quantity": ["description", "unit price"],
        "unit price": ["quantity", "total bill"],
        "total bill": ["quantity", "unit price"]
    },
    "badsha": {
        "sl": ["description", "quantity"],
        "description": ["sl", "quantity"],
        "quantity": ["description", "price"],
        "price": ["quantity", "amount"],
        "amount": ["quantity", "price"]
    },
    "korim": {
        "sl": ["description", "quantity"],
        "description": ["sl", "quantity"],
        "quantity": ["description", "price"],
        "price": ["quantity", "amount"],
        "amount": ["quantity", "price"]
    }
}


swap_digits = {"y":"4", "Y":"4", "z": "2", "Z": "2", "o": "0", "O":"0",
               "&": "8", "B":"8", "A":"4", "E":"3", "b":"6", "(":"1", "s":"5",
               "S":"5", "T":"7", "g":"9", "I":"1", "i":"1", "l":"1", "G":"6",
               "u":"0", "U":"0", "D":"0", "F":"7", ")":"0", "d":"0"}






all_available ={
    "SGS": ['Bread', 'Fruit', 'Milk', 'Rice', 'Vegetable', 'Lentils', 'Meat'],
    "BADSHA": ['Oil(Liters)', 'Onion(kg)', 'Milk(Litres)', 'salt(kg)', 'Mix masala & Chillies(kg)', 'Lentil(Kg)', 'Spinach(kg)', 'Beans(kg)', 'Cauliflower(kg)', 'Tomato(kg)', 'Brinjal(kg)', 'Okra(kg)', 'Rice(kg)', 'Potato(kg)'],
    "KORIM": ['Oil', 'Onion', 'Milk', 'Salt', 'Mix Masala and chillies', 'Lentils', 'Spinach', 'Beans', 'Cauliflower', 'Tomato', 'Brinjal', 'Okra', 'Rice', 'Potato']
}

