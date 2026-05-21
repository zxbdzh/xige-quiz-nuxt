# -*- coding: utf-8 -*-
"""提取《2025习概重点笔记.pdf》全文为 UTF-8 文本，便于后续解析。"""
import pdfplumber, json, os, sys

PDF = r"D:\wps_cloud_file\260758940\WPS云盘\02_教育与学习\自考专升本\2025习概重点笔记.pdf"
OUT_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_TXT = os.path.join(OUT_DIR, "raw_pages.txt")
OUT_JSON = os.path.join(OUT_DIR, "raw_pages.json")

pages_data = []
with pdfplumber.open(PDF) as pdf:
    total = len(pdf.pages)
    print(f"total pages = {total}")
    with open(OUT_TXT, "w", encoding="utf-8") as f:
        for i, page in enumerate(pdf.pages, 1):
            text = page.extract_text() or ""
            pages_data.append({"page": i, "text": text})
            f.write(f"\n===== PAGE {i} =====\n")
            f.write(text)
            f.write("\n")

with open(OUT_JSON, "w", encoding="utf-8") as f:
    json.dump(pages_data, f, ensure_ascii=False, indent=1)

print(f"saved {OUT_TXT}")
print(f"saved {OUT_JSON}")
