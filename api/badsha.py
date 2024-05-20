import utils
import config
import model
from Levenshtein import ratio
import pandas as pd
import numpy as np
import scipy
from img2table.tables.objects.extraction import ExtractedTable, BBox


class ColumnCell():
    def __init__(self, table: ExtractedTable, extraction: list,
                 img_shape: tuple, header: str):
      
      self.table = table
      self.extraction = extraction
      self.header = header
      self.img_shape = img_shape
      
    def cell(self, key) -> BBox:
      
      columns = utils.get_table_column(self.table)
      
      account_table = {}
      
      for header, col in zip(config.table_headers["badsha"], columns):
        account_table[header] = col
      
      return account_table.get(key)

    def extras(self):
      
      x_threshold = round(self.img_shape[1] * 0.5)
      y_threshold = round(self.img_shape[0] * 0.5)
      
      total_value = False
      data = []
      
      for pred in self.extraction:
        bbox = utils.convert_word_bbox(pred[0])
        word = pred[1][0]
        condition = [ratio(word.lower(), w) >= 0.8 for w in ["total amount", "due", "advance", "in word"]]
        if any(condition) and bbox[0][0] > x_threshold and bbox[0][1] > y_threshold:
           item = np.array(bbox).flatten().tolist()
           item.append(word)
           data.append(item)
      
      if data:
        dt = pd.DataFrame(data = data, columns = config.item_column)
        upper_bound = np.min(dt.y0.values)
        lower_bound = np.max(dt.y1.values)
        detected_words = dt.word.values.tolist()
        for pred in self.extraction:
          word = pred[1][0]
          bbox = utils.convert_word_bbox(pred[0])
          centeroid = 0.5 * (bbox[0][1] + bbox[1][1])
          if word not in detected_words and centeroid > upper_bound and centeroid < lower_bound:
            total_value = True
            item = np.array(bbox).flatten().tolist()
            item.append(word)
            t = pd.DataFrame(data = [item], columns = config.item_column)
        if total_value:
          dt = pd.concat([dt, t], axis = 0, ignore_index = True)
        
        return dt
    
    def original(self) -> pd.DataFrame:
      column_cell = self.cell(self.header)
      column_df = utils.get_column_text(column_cell.bbox, self.extraction)

      extras_df = self.extras()

      column_df = pd.merge(column_df, extras_df, on = config.item_column, how = "left", indicator = True)
      column_df = column_df.loc[column_df["_merge"] == "left_only", config.item_column]

      column_df.sort_values(by = ["y0"], ascending = True, inplace = True)
      column_df.reset_index(drop = True, inplace = True)

      if ratio(column_df.loc[0, "word"].lower(), self.header) >= 0.7:
        column_df.drop(0, axis = 0, inplace = True)
        column_df.reset_index(drop = True, inplace = True)
      
      return column_df
    
    def left(self) -> pd.DataFrame:
      head = config.column_mapping["badsha"][self.header][0]

      column_cell = self.cell(head)
      column_df = utils.get_column_text(column_cell.bbox, self.extraction)

      extras_df = self.extras()

      column_df = pd.merge(column_df, extras_df, on = config.item_column, how = "left", indicator = True)
      column_df = column_df.loc[column_df["_merge"] == "left_only", config.item_column]

      column_df.sort_values(by = ["y0"], ascending = True, inplace = True)
      column_df.reset_index(drop = True, inplace = True)

      if ratio(column_df.loc[0, "word"].lower(), head) >= 0.7:
        column_df.drop(0, axis = 0, inplace = True)
        column_df.reset_index(drop = True, inplace = True)
      
      return column_df
    
    def right(self) -> pd.DataFrame:
      head = config.column_mapping["badsha"][self.header][1]

      column_cell = self.cell(head)
      column_df = utils.get_column_text(column_cell.bbox, self.extraction)

      extras_df = self.extras()

      column_df = pd.merge(column_df, extras_df, on = config.item_column, how = "left", indicator = True)
      column_df = column_df.loc[column_df["_merge"] == "left_only", config.item_column]

      column_df.sort_values(by = ["y0"], ascending = True, inplace = True)
      column_df.reset_index(drop = True, inplace = True)

      if ratio(column_df.loc[0, "word"].lower(), head) >= 0.7:
        column_df.drop(0, axis = 0, inplace = True)
        column_df.reset_index(drop = True, inplace = True)
      
      return column_df
    

def get_column(table: ExtractedTable, extraction: list,
               img: np.ndarray, header: str) -> pd.DataFrame:
  
  column = ColumnCell(table, extraction, img.shape, header)
  
  dt = column.original()
  dt["centeroid"] = 0.5 * (dt["y0"] + dt["y1"])
  dt["gap"] = np.abs(dt["centeroid"].diff(-1))

  trimmed_avg_gap = scipy.stats.trim_mean(dt.gap.values, 0.25)
  avg_gap = dt.loc[dt["gap"] < trimmed_avg_gap, "gap"].mean()

  idx = dt.loc[dt["gap"] > trimmed_avg_gap, :].index.tolist()
  
  avg_box_len = np.mean(dt.x1 - dt.x0)
  avg_box_ht = np.mean(dt.y1 - dt.y0)

  min_x0 = round(np.min(dt.x0))
  max_x1 = round(np.max(dt.x1))

  col_centeroid = np.mean(0.5 * (dt.x1 + dt.x0))

  right_col = column.right()
  left_col = column.left()

  neighbour_df = pd.concat([right_col, left_col], axis = 0, ignore_index = True)
  neighbour_df["centeroid"] = 0.5 * (neighbour_df["y0"] + neighbour_df["y1"])

  top = dt.loc[0, "y0"]
  top_df = neighbour_df.loc[neighbour_df["centeroid"] < top, :].copy()
  look_up = pd.DataFrame()

  while not top_df.empty:
    top_df.sort_values(by = ["y0"], ascending = True, inplace = True)
    top_df.reset_index(drop = True, inplace = True)
    top_df, look_up = utils.deduplicate(top_df, look_up)
  
  top_blank = pd.DataFrame()
  top_centeroid = dt.loc[0, "centeroid"]
  size = look_up.shape[0]
  if size:
    for i in range(size):
      y0 = top_centeroid - avg_gap - (0.5 * avg_box_len)
      y1 = y0 + avg_box_ht
      x0 = col_centeroid - (0.5 * avg_box_len)
      x1 = x0 + avg_box_len
      x0, y0, x1, y1 = np.round(x0), np.round(y0), np.round(x1), np.round(y1)
      t = pd.DataFrame(data = [[x0, y0, x1, y1, np.NaN]], columns = config.item_column)
      top_blank = pd.concat([top_blank, t], axis = 0, ignore_index = True)
      top_centeroid -= avg_gap
  
  bot = dt.iloc[-1, 3]
  bot_df = neighbour_df.loc[neighbour_df["centeroid"] > bot, :].copy()
  look_down = pd.DataFrame()
  while not bot_df.empty:
    bot_df.sort_values(by = ["y0"], ascending = True, inplace = True)
    bot_df.reset_index(drop = True, inplace = True)
    bot_df, look_down = utils.deduplicate(bot_df, look_down)
  
  bot_blank = pd.DataFrame()
  bot_centeroid = dt.iloc[-1, 5]
  size = look_down.shape[0]
  if size:
    for i in range(size):
      y0 = bot_centeroid + avg_gap - (0.5 * avg_box_ht)
      y1 = y0 + avg_box_ht
      x0 = col_centeroid - (0.5 * avg_box_len)
      x1 = x0 + avg_box_len
      x0, y0, x1, y1 = np.round(x0), np.round(y0), np.round(x1), np.round(y1)
      t = pd.DataFrame(data = [[x0, y0, x1, y1, np.NaN]], columns = config.item_column)
      bot_blank = pd.concat([bot_blank, t], axis = 0, ignore_index = True)
      bot_centeroid -= avg_gap
  
  in_between = pd.DataFrame()
  for i in idx:
    upper_bound = dt.loc[i, "y1"]
    lower_bound = dt.loc[i + 1, "y0"]

    base_centeroid = dt.loc[i, "centeroid"]

    n_df = neighbour_df.loc[(neighbour_df["centeroid"] > upper_bound) &
                            (neighbour_df["centeroid"] < lower_bound)].copy()

    sorted_df = pd.DataFrame()

    while not n_df.empty:
      n_df.sort_values(by = ["y0"], ascending = True, inplace = True)
      n_df.reset_index(drop = True, inplace = True)
      n_df, sorted_df = utils.deduplicate(n_df, sorted_df)

    crop_img = img[round(upper_bound):round(lower_bound), min_x0:max_x1]

    try:
      d = model.detector.detect(crop_img, text_threshold = 0.5)
      det = d[0][0]
    except:
      det = []

    size = sorted_df.shape[0]
    if size > 1 and len(det) > 1:
      for i in range(size):
        y0 = base_centeroid + avg_gap - (0.5 * avg_box_ht)
        y1 = y0 + avg_box_ht
        x0 = col_centeroid - (0.5 * avg_box_len)
        x1 = x0 + avg_box_len
        x0, y0, x1, y1 = np.round(x0), np.round(y0), np.round(x1), np.round(y1)
        t = pd.DataFrame(data = [[x0, y0, x1, y1, np.NaN]], columns = config.item_column)
        in_between = pd.concat([in_between, t], axis = 0, ignore_index = True)
        base_centeroid += avg_gap
    elif size != 0:
      y0 = base_centeroid + avg_gap - (0.5 * avg_box_ht)
      y1 = y0 + avg_box_ht
      x0 = col_centeroid - (0.5 * avg_box_len)
      x1 = x0 + avg_box_len
      x0, y0, x1, y1 = np.round(x0), np.round(y0), np.round(x1), np.round(y1)
      t = pd.DataFrame(data = [[x0, y0, x1, y1, np.NaN]], columns = config.item_column)
      in_between = pd.concat([in_between, t], axis = 0, ignore_index = True)

  blank_df = pd.concat([top_blank, in_between, bot_blank], axis = 0, ignore_index = True)

  patch_df = pd.concat([dt.loc[:, config.item_column], blank_df], axis = 0, ignore_index = True)

  patch_df.sort_values(by = ["y0"], ascending = True, inplace = True)
  patch_df.reset_index(drop = True, inplace = True)

  return patch_df


def extract(table: ExtractedTable, extraction: list, img: np.ndarray):
  headers = config.table_headers.get("badsha")
  account_df = pd.DataFrame()
  for header in headers[1:]:
    col_df = get_column(table, extraction, img, header)
    account_df = pd.concat([account_df, col_df.loc[:, ["word"]]], axis = 1)
  account_df.reset_index(drop = False, inplace = True)
  account_df.columns = headers
  account_df["sl"] += 1
  account_df = utils.sanitize_digits(account_df, key_account = "badsha")
  return account_df.fillna("")