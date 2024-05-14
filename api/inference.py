from img2table.document import PDF
from img2table.document import Image
import model
import sayma

img_path = "./data/full_bgr_Sayma.jpg"

doc = Image(img_path, detect_rotation = False)
tables = doc.extract_tables(ocr = model.ocr,
                            implicit_rows=False,
                            borderless_tables=False,
                            min_confidence=50)

table = tables[0]
img = doc.images[0]

extraction = model.ocr.hocr(img)

# descriptionColumn = sayma.ColumnCell(table, extraction, img.shape, "description")

if __name__ == "__main__":
    print(sayma.get_column(table, extraction, img, "description"))