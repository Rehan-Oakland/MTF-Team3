from img2table.ocr import PaddleOCR
import easyocr
import config

ocr = PaddleOCR(kw = config.paddle_kwargs)
detector = easyocr.Reader(["en"], detector = True, recognizer = False, detect_network = "craft",
                          gpu = False, model_storage_directory = "./Engine/easyOCR")



if __name__ == "__main__":
    print(type(detector))