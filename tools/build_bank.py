# -*- coding: utf-8 -*-
"""
将 raw_pages.json 解析为题库 JSON。
结构:
{
  "meta": {...},
  "chapters": [
    {
      "id": "ch00", "no": 0, "title": "导论 ...",
      "mcq": [ { "id": "ch00-q1", "no": 1, "stem": "...", "options": {"A":"...","B":"...","C":"...","D":"..."}, "answer": "C", "explain": "..."} ],
      "kps": [ { "id": "ch00-kp1", "no": 1, "title": "...", "points": ["...","..."] } ]
    }, ...
  ]
}
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.abspath(os.path.join(HERE, "..", "server", "data"))
os.makedirs(DATA_DIR, exist_ok=True)

with open(os.path.join(HERE, "raw_pages.json"), "r", encoding="utf-8") as f:
    raw_pages = json.load(f)

def clean_line(s):
    # 去掉页眉页脚水印行
    drop_kw = [
        "公众号:keep学长", "keep学长自考托管班", "更多资料",
        "//选择题部分", "//主观题部分", "选择题汇总", "主观题汇总",
        "要偷偷努力，希望自己也能成为别人的梦想",
        "怕什么真理无穷",
    ]
    for k in drop_kw:
        if k in s:
            return ""
    if re.fullmatch(r"\s*-\s*\d+\s*-\s*", s):
        return ""
    if re.fullmatch(r"\s*[博观而约取厚积薄发]\s*", s):  # 单字行
        return ""
    return s.rstrip()

# === 选择题部分: pages 8-30 ===
mcq_lines = []
for p in raw_pages:
    if 8 <= p["page"] <= 30:
        for line in p["text"].split("\n"):
            ln = clean_line(line)
            if ln:
                mcq_lines.append(ln)

# 章节分隔：
# 形如 "- 导论 -" / "- 第X章 标题 -" 单行
# 或者 "第X章" 单独成行，下一行 "- 标题 -"
CHAP_HEAD = re.compile(r"^-\s*(导论|第[一二三四五六七八九十百0-9]+章[^-\n]*)\s*-\s*$")
CHAP_HEAD_ONLY = re.compile(r"^(第[一二三四五六七八九十百0-9]+章)\s*$")
SUBTITLE_LINE = re.compile(r"^-\s*([^-\n]+?)\s*-\s*$")
# 题号行：行首 "1." 到 "99."，后面跟题干
Q_HEAD = re.compile(r"^(\d{1,3})\.\s*(.+)$")
# 选项匹配，支持 A.  A、  A:  A:  A) 等
OPT_INLINE = re.compile(r"\s*([ABCD])[\.、:：\)]\s*")

def split_options_line(line):
    """从一行里抽出形如 A.xxx B.xxx ... 的选项段"""
    parts = re.split(r"\s+(?=[ABCD][\.、:：\)])", line)
    opts = {}
    for part in parts:
        m = re.match(r"^([ABCD])[\.、:：\)]\s*(.+)$", part.strip())
        if m:
            opts[m.group(1)] = m.group(2).strip()
    return opts

chapters = {}
cur_chap = None
cur_q = None
i = 0
while i < len(mcq_lines):
    line = mcq_lines[i]
    m_ch = CHAP_HEAD.match(line)
    m_ch_only = CHAP_HEAD_ONLY.match(line) if not m_ch else None
    if m_ch or m_ch_only:
        if m_ch:
            title = m_ch.group(1).strip()
        else:
            title = m_ch_only.group(1).strip()
            # 尝试合并下一行 "- xxx -"
            if i + 1 < len(mcq_lines):
                m_sub = SUBTITLE_LINE.match(mcq_lines[i+1])
                if m_sub:
                    title = title + " " + m_sub.group(1).strip()
                    i += 1
        if title == "导论":
            no, ch_id = 0, "ch00"
        else:
            m_no = re.match(r"第([一二三四五六七八九十百0-9]+)章", title)
            ch_no = m_no.group(1) if m_no else ""
            ch_id = f"ch_{ch_no}"
        cur_chap = chapters.setdefault(ch_id, {"id": ch_id, "title": title, "raw_no": title, "mcq": [], "kps": []})
        if not cur_chap.get("title") or len(cur_chap["title"]) < len(title):
            cur_chap["title"] = title
        cur_q = None
        i += 1
        continue
    m_q = Q_HEAD.match(line)
    if m_q and cur_chap is not None:
        qno = int(m_q.group(1))
        rest = m_q.group(2)
        stem_parts = [rest]
        opts = {}
        def is_boundary(ln):
            return bool(Q_HEAD.match(ln) or CHAP_HEAD.match(ln) or CHAP_HEAD_ONLY.match(ln))
        j = i + 1
        while j < len(mcq_lines):
            ln = mcq_lines[j]
            if is_boundary(ln):
                break
            if re.search(r"(^|\s)A[\.、:：\)]\s*", ln):
                opt_buf = [ln]
                k = j + 1
                while k < len(mcq_lines):
                    nl = mcq_lines[k]
                    if is_boundary(nl):
                        break
                    opt_buf.append(nl)
                    k += 1
                merged = " ".join(opt_buf)
                opts = split_options_line(merged)
                j = k
                break
            else:
                stem_parts.append(ln)
                j += 1
        stem = re.sub(r"\s+", "", "".join(stem_parts))
        # 仅保留 4 个全的选项
        if len(opts) >= 2:
            cur_chap["mcq"].append({
                "no": qno,
                "stem": stem,
                "options": opts,
            })
        i = j
        continue
    i += 1

# === 答案解析: pages 31-74 ===
# 每章块开头: "第X章 章名"，紧跟 "题号 ... " / "答案 X X X ..."
# 后面是 "N.正确答案：X. xxx\n解析：..."
ans_lines = []
for p in raw_pages:
    if 31 <= p["page"] <= 74:
        for line in p["text"].split("\n"):
            ln = clean_line(line)
            if ln:
                ans_lines.append(ln)

# 章节起点：单独一行 "第X章" 或 "- 第X章" 或 "导论"
CHAP_HEAD2 = re.compile(r"^-?\s*(导论|第[一二三四五六七八九十百0-9]+章)[^\n]{0,40}-?\s*$")
ANS_ROW = re.compile(r"^答案\s+(.+)$")
NUM_ROW = re.compile(r"^题号\s+(.+)$")
ANS_DETAIL = re.compile(r"^(\d{1,3})\.正确答案[：:]\s*([ABCD])[\.、:：\)\s]*(.*)$")

chap_answers = {}   # ch_id -> { qno: {answer, explain, option_comments} }
cur_ch_id = None
cur_answers_arr = None
expecting_answers = False

def title_to_ch_id(title):
    if title.startswith("导论"):
        return "ch00"
    m = re.match(r"第([一二三四五六七八九十百0-9]+)章", title)
    if not m:
        return None
    return f"ch_{m.group(1)}"

i = 0
while i < len(ans_lines):
    line = ans_lines[i]
    m_ch = CHAP_HEAD2.match(line)
    if m_ch and "正确答案" not in line:
        cid = title_to_ch_id(line.strip(" -"))
        if cid:
            cur_ch_id = cid
            chap_answers.setdefault(cur_ch_id, {})
        i += 1; continue
    m_num = NUM_ROW.match(line)
    if m_num and cur_ch_id:
        # 下一行应该是 "答案 ..."
        if i+1 < len(ans_lines):
            m_a = ANS_ROW.match(ans_lines[i+1])
            if m_a:
                tokens = re.findall(r"[ABCD]+", m_a.group(1))
                for idx, ans in enumerate(tokens, 1):
                    chap_answers[cur_ch_id].setdefault(idx, {})["answer"] = ans
                i += 2; continue
    m_d = ANS_DETAIL.match(line)
    if m_d and cur_ch_id:
        qno = int(m_d.group(1)); ans_letter = m_d.group(2); rest = m_d.group(3)
        # 收集后续解析直到下一题/下一章
        buf = [rest]
        j = i + 1
        while j < len(ans_lines):
            nl = ans_lines[j]
            if ANS_DETAIL.match(nl) or CHAP_HEAD2.match(nl) or NUM_ROW.match(nl):
                break
            buf.append(nl); j += 1
        full = "\n".join([b for b in buf if b])
        rec = chap_answers[cur_ch_id].setdefault(qno, {})
        rec["answer"] = ans_letter
        # 提取解析正文（"解析："开头到第一个 A./B./C./D. 解释为止）
        explain_match = re.search(r"解析[：:](.+?)(?=(?:^|\n)[ABCD][\.、:：\)])", full, re.S | re.M)
        if explain_match:
            rec["explain"] = re.sub(r"\s+", "", explain_match.group(1))
        else:
            rec["explain"] = re.sub(r"\s+", "", full)
        i = j; continue
    i += 1

# === 主观题部分(知识点速览): pages 75-123 ===
sub_lines = []
for p in raw_pages:
    if 75 <= p["page"] <= 125:
        for line in p["text"].split("\n"):
            ln = clean_line(line)
            if ln:
                sub_lines.append(ln)

# 章节起点: "导论" / "第X章：标题" 单独成行；后面会有 "知识点列表"
# 然后形如 "一、xxx" / "二、xxx" 是大节标题，"1.xxx" 是要点

CHAP_HEAD3 = re.compile(r"^(导论|第[一二三四五六七八九十百0-9]+章)[：:]?\s*(.*)$")
KP_TITLE = re.compile(r"^([一二三四五六七八九十百]+)、\s*(.+)$")
KP_POINT = re.compile(r"^(\d{1,2})\.\s*(.+)$")
SKIP_KW = ["知识点列表", "欢迎大家来到", "在这一章中", "深入探讨之旅"]

chap_kps = {}   # ch_id -> [ { title, points: [] } ]
cur_ch_id = None
cur_section = None
i = 0
while i < len(sub_lines):
    line = sub_lines[i]
    m_ch = CHAP_HEAD3.match(line)
    # 注意：必须排除选项行被误判，这里 line 通常很短
    if m_ch and len(line) < 50 and "正确答案" not in line and "解析" not in line:
        cid = title_to_ch_id(line)
        if cid:
            full_title = line.strip()
            cur_ch_id = cid
            chap_kps.setdefault(cur_ch_id, [])
            cur_section = None
            i += 1; continue
    if any(k in line for k in SKIP_KW):
        i += 1; continue
    m_t = KP_TITLE.match(line)
    if m_t and cur_ch_id:
        title = m_t.group(2).strip()
        cur_section = {"title": title, "points": []}
        chap_kps[cur_ch_id].append(cur_section)
        i += 1; continue
    m_p = KP_POINT.match(line)
    if m_p and cur_section is not None:
        cur_section["points"].append(m_p.group(2).strip())
        i += 1; continue
    # 续行: 没有编号开头但仍是上一个点的延续
    if cur_section is not None and cur_section["points"] and not re.match(r"^[一二三四五六七八九十0-9]", line):
        cur_section["points"][-1] += line.strip()
    i += 1

# === 合并 ===
# 合并 mcq + answer + 主观题
out_chapters = []
all_ch_ids = sorted(set(list(chapters.keys()) + list(chap_answers.keys()) + list(chap_kps.keys())),
                    key=lambda x: (x != "ch00", x))

cn2num = {"一":1,"二":2,"三":3,"四":4,"五":5,"六":6,"七":7,"八":8,"九":9,"十":10,
          "十一":11,"十二":12,"十三":13,"十四":14,"十五":15,"十六":16,"十七":17}

CHAP_TITLES = {
    "ch00": "导论",
    "ch_一": "第一章 新时代坚持和发展中国特色社会主义",
    "ch_二": "第二章 以中国式现代化全面推进中华民族伟大复兴",
    "ch_三": "第三章 坚持党的全面领导",
    "ch_四": "第四章 坚持以人民为中心",
    "ch_五": "第五章 全面深化改革开放",
    "ch_六": "第六章 推动高质量发展",
    "ch_七": "第七章 建设现代化经济体系",
    "ch_八": "第八章 发展全过程人民民主",
    "ch_九": "第九章 全面依法治国",
    "ch_十": "第十章 建设社会主义文化强国",
    "ch_十一": "第十一章 以保障和改善民生为重点加强社会建设",
    "ch_十二": "第十二章 建设社会主义生态文明",
    "ch_十三": "第十三章 维护和塑造国家安全",
    "ch_十四": "第十四章 建设巩固国防和强大人民军队",
    "ch_十五": "第十五章 坚持“一国两制”和推进祖国完全统一",
    "ch_十六": "第十六章 推动构建人类命运共同体",
    "ch_十七": "第十七章 全面从严治党",
}

def sort_key(cid):
    if cid == "ch00":
        return -1
    m = cid.replace("ch_","")
    return cn2num.get(m, 999)

all_ch_ids = sorted(set(list(chapters.keys()) + list(chap_answers.keys()) + list(chap_kps.keys())), key=sort_key)

total_mcq = 0
total_kp = 0
for cid in all_ch_ids:
    title = CHAP_TITLES.get(cid) or (chapters.get(cid) or {}).get("title", cid)
    ch_no = sort_key(cid)
    mcq_arr = []
    src_mcq = (chapters.get(cid) or {}).get("mcq", [])
    src_ans = chap_answers.get(cid, {})
    for q in src_mcq:
        ans_rec = src_ans.get(q["no"], {})
        if "answer" in ans_rec and len(q["options"]) == 4:
            mcq_arr.append({
                "id": f"{cid}-q{q['no']}",
                "no": q["no"],
                "stem": q["stem"],
                "options": q["options"],
                "answer": ans_rec["answer"],
                "explain": ans_rec.get("explain", ""),
            })
    mcq_arr.sort(key=lambda x: x["no"])
    kps_arr = []
    for kp in chap_kps.get(cid, []):
        if kp["points"]:
            kps_arr.append({"title": kp["title"], "points": kp["points"]})
    total_mcq += len(mcq_arr)
    total_kp += sum(len(k["points"]) for k in kps_arr)
    out_chapters.append({
        "id": cid, "no": ch_no, "title": title,
        "mcq": mcq_arr,
        "kps": kps_arr,
    })

bank = {
    "meta": {
        "source": "2025习概重点笔记.pdf",
        "subject": "习近平新时代中国特色社会主义思想概论",
        "totalChapters": len(out_chapters),
        "totalMcq": total_mcq,
        "totalKp": total_kp,
    },
    "chapters": out_chapters,
}

with open(os.path.join(DATA_DIR, "bank.json"), "w", encoding="utf-8") as f:
    json.dump(bank, f, ensure_ascii=False, indent=1)

print("Done.")
print("totalChapters:", len(out_chapters))
print("totalMcq:", total_mcq)
print("totalKp:", total_kp)
for c in out_chapters:
    print(f"  {c['id']:8s} mcq={len(c['mcq'])} kp_sections={len(c['kps'])} title={c['title']}")
