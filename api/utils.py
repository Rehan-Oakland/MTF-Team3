import numpy as np
import pandas as pd
from img2table.tables.objects.extraction import ExtractedTable, BBox
from Levenshtein import ratio
import config



def get_column_cell(extracted_table: ExtractedTable, top: int = 5) -> list:
  table_rows = list(iter(extracted_table.content.values()))
  table_rows = np.array(table_rows).flatten().tolist()
  table_df = pd.DataFrame(data = {"column": table_rows})
  table_df["height"] = table_df["column"].apply(lambda x: x.bbox.y2 - x.bbox.y1)
  table_df["left"] = table_df["column"].apply(lambda x: x.bbox.x1)
  table_df.sort_values(by = ["height", "left"], ascending = [False, True], inplace = True)
  table_df.reset_index(drop = True, inplace = True)
  return table_df.loc[:top, "column"].tolist()


def is_duplicates(row1, row2) -> bool:
  overlap = max(0, (min(row1["x2"], row2["x2"]) - max(row1["x1"], row2["x1"])))
  min_wt = min(row1["wt"], row2["wt"])
  return (overlap/min_wt) > 0.45


def drop_duplicates(dx:pd.DataFrame, dy:pd.DataFrame) -> tuple:
  if dx.shape[0] > 1:
    row1 = dx.loc[0, :].to_dict()
    row2 = dx.loc[1, :].to_dict()

    if is_duplicates(row1, row2):
      dy = pd.concat([dy, dx.loc[0, :].to_frame().T], axis = 0, ignore_index = True)
      return dx.iloc[2:, :], dy
    else:
      dy = pd.concat([dy, dx.loc[0, :].to_frame().T], axis = 0, ignore_index = True)
      return dx.iloc[1:, :], dy
  else:
    dy = pd.concat([dy, dx.loc[0, :].to_frame().T], axis = 0, ignore_index = True)
    return dx.iloc[1:, :], dy


def get_table_column(extracted_table) -> list:
  table_rows = list(iter(extracted_table.content.values()))
  table_rows = np.array(table_rows).flatten().tolist()
  table_rows = [[pred, pred.bbox.x1, pred.bbox.y1, pred.bbox.x2, pred.bbox.y2] for pred in table_rows]
  dx = pd.DataFrame(data = table_rows, columns = ["cell", "x1", "y1", "x2", "y2"])
  dx["ht"] = dx["y2"] - dx["y1"]
  dx["wt"] = dx["x2"] - dx["x1"]
  mx_ht = dx.ht.max()
  dx = dx.loc[dx["ht"] > (0.7 * mx_ht), :]
  dx.sort_values(by = ["ht"], ascending = False, inplace = True)
  dx.reset_index(drop = True, inplace = True)
  
  dy = pd.DataFrame()
  while not dx.empty:
    dx.sort_values(by = ["x1"], ascending = True, inplace = True)
    dx.reset_index(drop = True, inplace = True)
    dx, dy = drop_duplicates(dx, dy)
  
  return dy.cell.to_list()


def convert_word_bbox(paddle_bbox: list) -> list:
  bbox_array = np.array(paddle_bbox)
  mini = np.min(bbox_array, axis = 0).reshape(1, 2)
  maxi = np.max(bbox_array, axis = 0).reshape(1, 2)
  return np.concatenate((mini, maxi), axis = 0).tolist()


def convert_table_bbox(table_bbox:BBox) -> list:
  return [[table_bbox.x1, table_bbox.y1], [table_bbox.x2, table_bbox.y2]]


def bbox_area_intersection(column_bbox:BBox, word_bbox:list) -> float:

  column_bbox = convert_table_bbox(column_bbox)
  word_bbox = convert_word_bbox(word_bbox)

  bbox_xmin = word_bbox[0][0]
  bbox_xmax = word_bbox[1][0]
  column_xmin = column_bbox[0][0]
  column_xmax = column_bbox[1][0]

  bbox_ymin = word_bbox[0][1]
  bbox_ymax = word_bbox[1][1]
  column_ymin = column_bbox[0][1]
  column_ymax = column_bbox[1][1]

  xlen = (bbox_xmax - bbox_xmin) + min(0, (bbox_xmin - column_xmin)) + min(0, (column_xmax - bbox_xmax))
  ylen = (bbox_ymax - bbox_ymin) + min(0, (bbox_ymin - column_ymin)) + min(0, (column_ymax - bbox_ymax))

  xlen = max(0, xlen)
  ylen = max(0, ylen)

  intersect_area = xlen * ylen
  box_area = (bbox_xmax - bbox_xmin) * (bbox_ymax - bbox_ymin)

  ratio = intersect_area / box_area

  return round(ratio, 2)


def get_column_text(column_bbox: list, extraction: list) -> pd.DataFrame:
  data = []
  for pred in extraction:
    if bbox_area_intersection(column_bbox, pred[0]) >= 0.7:
      bbox = convert_word_bbox(pred[0])
      item = np.array(bbox).flatten().tolist()
      item.append(pred[1][0])
      data.append(item)
  
  return pd.DataFrame(data = data, columns = config.item_column)



def korim_item_overlap(row1, row2) -> bool:
  overlap = max(0, (min(row1["y1"], row2["y1"]) - max(row1["y0"], row2["y0"])))
  min_ht = min(row1["ht"], row2["ht"])
  return (overlap/min_ht) >= 0.40

def patch_korim_description(dx):
  data = dx.copy()
  data["paid_check"] = data["word"].apply(lambda x: ratio(x.lower(), "paid") >= 0.70)
  data = data.loc[~data["paid_check"], :]
  data.drop("paid_check", axis = 1, inplace = True)
  data.sort_values(by = ["y0"], ascending = True, inplace = True)
  data.reset_index(drop = True, inplace = True)
  data["ht"] = data["y1"] - data["y0"]
  check = []
  size = data.shape[0]
  for i in range(size - 1):
    row1 = data.iloc[i, :].to_dict()
    row2 = data.iloc[i + 1, :].to_dict()
    check.append(korim_item_overlap(row1, row2))
  check.append(False)
  data["bool"] = check
  index = data.loc[data["bool"]].index.tolist()
  for i in index:
    if data.loc[i, "word"] < data.loc[i + 1, "word"]:
      data.loc[i, "word"] = data.loc[i, "word"] + " " + data.loc[i + 1, "word"]
      data.drop(i + 1, axis = 0, inplace = True)
    else:
      data.loc[i + 1, "word"] = data.loc[i + 1, "word"] + " " + data.loc[i, "word"]
      data.drop(i, axis = 0, inplace = True)
    data.drop(["ht", "bool"], axis = 1, inplace = True)
    data.sort_values(by = ["y0"], ascending = True, inplace = True)
    data.reset_index(drop = True, inplace = True)
  return data

def deduplicate(dx:pd.DataFrame, dy:pd.DataFrame) -> tuple:

  if dx.shape[0] > 1:
    top_y0 = dx.loc[0, "y0"]
    top_y1 = dx.loc[0, "y1"]

    bot_y0 = dx.loc[1, "y0"]

    top_ht = top_y1 - top_y0
    intersect = max(0, top_y1 - bot_y0)
    ratio = max(1, intersect/top_ht)

    if ratio >= 0.45:
      dy = pd.concat([dy, dx.loc[0, :].to_frame().T], axis = 0, ignore_index = True)
      return dx.iloc[2:, :], dy
    else:
      dy = pd.concat([dy, dx.loc[0, :].to_frame().T], axis = 0, ignore_index = True)
      return dx.iloc[1:, :], dy
  else:
    dy = pd.concat([dy, dx.loc[0, :].to_frame().T], axis = 0, ignore_index = True)
    return dx.iloc[1:, :], dy
  
def sanitize_digits(data: pd.DataFrame, key_account: str) -> pd.DataFrame:
  translation_table = str.maketrans(config.swap_digits)
  for header in config.table_headers.get(key_account)[2:]:
    data[header] = data[header].str.translate(translation_table).str.replace(r"\W", "", regex = True)
  return data


def which_account(title: str) -> str:
  validator = lambda account, word: ratio(account, word)
  title = title.split("\n")
  accounts = dict()
  for account in ["korim enterprise", "badsha enterprise", "sayma general store"]:
    key = account.split()[0]
    accounts[key] = max([validator(account, word.lower()) for word in title])
  key_account = max(accounts, key = accounts.get)
  if accounts.get(key_account) >= 0.7:
    return key_account
  else:
    return None


def construct_excel(data: pd.DataFrame) -> None:
  pass



def similarity_ratio(extracted_item: str, available_items: list):
    receipt_items = {}
    for element in available_items:
        score = ratio(element, extracted_item)
        receipt_items[element] = score
    max_key = max(receipt_items, key = receipt_items.get)
    if receipt_items.get(max_key) <0.7:
        return extracted_item
    else:
        return max_key  
    
def receive_extracted_items(key_account:str, extracted_items: list):
    available_items = config.all_available.get(key_account)
    validated_items = [similarity_ratio(i, available_items) for i in extracted_items]
    return validated_items
 
