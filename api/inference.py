from img2table.document import PDF
from img2table.document import Image
import utils
import model
import sayma
import badsha
import korim



# def validate(src: str) -> str:
#     doc = Image(src, detect_rotation = False)
#     tables = doc.extract_tables(ocr = model.ocr, implicit_rows = False,
#                                 borderless_tables = False, min_confidence = 50)
    
#     if w:=len(tables) > 1:
#         fo



def extraction(src: str) -> str:
    doc = Image(src, detect_rotation = False)
    tables = doc.extract_tables(ocr = model.ocr,
                                implicit_rows = False,
                                borderless_tables = False,
                                min_confidence = 50)
    table = tables[0]
    img = doc.images[0]

    extraction = model.ocr.hocr(img)

    title = table.title

    account = utils.which_account(title)
    if account and account == "korim":
        df = korim.extract(table, extraction, img)
        path = f"./data/{account}.xlsx"
        df.to_excel(path)
        return {
            "status": "success",
            "file": path
        }
    elif account and account == "sayma":
        df = sayma.extract(table, extraction, img)
        path = f"./data/{account}.xlsx"
        df.to_excel(path)
        return {
            "status": "success",
            "file": path
        }
    elif account and account == "badsha":
        df = badsha.extract(table, extraction, img)
        df["description"] = utils.receive_extracted_items("badsha", df["description"].tolist())
        path = f"./data/{account}.xlsx"
        df.to_excel(path)
        return {
            "status": "success",
            "file": path,
            "validation": "failed"
        }
    else:
        return {
            "status":"failed",
            "file": "",
            "validation": "failed"
        }



if __name__ == "__main__":
    print(extraction("./data/badsha_account_image.jpg"))