# -*- coding: utf-8 -*-
"""把若干页内容输出到一个文件，便于查看真实排版。"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(HERE, "raw_pages.json"), "r", encoding="utf-8") as f:
    pages = json.load(f)

want = [int(x) for x in sys.argv[1].split(",")]
out_path = os.path.join(HERE, "peek_output.txt")
with open(out_path, "w", encoding="utf-8") as f:
    for p in pages:
        if p["page"] in want:
            f.write(f"\n========== PAGE {p['page']} ==========\n")
            f.write(p["text"])
            f.write("\n")
print("wrote", out_path)
