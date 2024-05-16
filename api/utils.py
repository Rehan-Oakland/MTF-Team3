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
  

