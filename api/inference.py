from img2table.document import PDF
from img2table.document import Image
import utils
import model
import sayma
import badsha
import korim


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
        path = f"./data/{account}.xlsx"
        df.to_excel(path)
        return {
            "status": "success",
            "file": path
        }
    else:
        return {
            "status":"failed",
            "file": ""
        }



if __name__ == "__main__":
    print(extraction("./data/full_Badsha_bgr.jpg"))