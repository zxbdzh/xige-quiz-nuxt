# -*- coding: utf-8 -*-
"""分析 raw_pages.txt 的章节结构和题目区域。"""
import re, os, json

HERE = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(HERE, "raw_pages.txt"), "r", encoding="utf-8") as f:
    txt = f.read()

pages = re.split(r"\n===== PAGE (\d+) =====\n", txt)
# pages[0]='', then alternating: page_num, page_text...
page_map = {}
for i in range(1, len(pages), 2):
    page_map[int(pages[i])] = pages[i+1]

result = {"chapters": [], "question_zones": []}

# 抓章节标题（更精确：行首是 "第X章" 或 "第X单元" 等）
chap_pat = re.compile(r"^(第[一二三四五六七八九十百0-9]+(章|单元|讲|节))[\s\S]{0,40}$", re.M)
chap_titles = []
for p, t in page_map.items():
    for m in re.finditer(r"(第[一二三四五六七八九十百0-9]+(章|单元|讲|节)[^\n]{0,40})", t):
        chap_titles.append({"page": p, "title": m.group(1).strip()})

# 定位含选择题的页面：含 A. B. C. D. 的页面
q_pages = []
for p, t in page_map.items():
    if re.search(r"A[．.][^A-Z\n]{2,}\s*B[．.]", t) or re.search(r"A、[^A-Z\n]{2,}\s*B、", t):
        q_pages.append(p)

result["chapter_titles_with_page"] = chap_titles
result["question_page_count"] = len(q_pages)
result["question_pages"] = q_pages
result["total_pages"] = len(page_map)

# 找出"答案"区域
ans_pages = [p for p, t in page_map.items() if "答案" in t or "参考答案" in t]
result["answer_pages"] = ans_pages

with open(os.path.join(HERE, "analysis.json"), "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=1)

print("analysis saved")
print("chapter heading count:", len(chap_titles))
print("question page count:", len(q_pages))
print("answer page count:", len(ans_pages))
