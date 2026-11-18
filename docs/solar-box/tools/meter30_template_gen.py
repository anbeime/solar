#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
计量3.0「调控调试清单」模板自动生成器  ·  MVP
P113 四可验收建档 → RP76 光储智脑一体机「设备建档 Skill」

规则来源（实读，非编造）：
  南方电网售电《增量光伏"四可"设备验收及计量建档指引（增量）》广州 15 页
  4.1.1~4.1.13（计量建档）/ 5.1.2（表地址=出厂编号后12位）
  PDF: 光伏“四可”设备验收及计量建档指引-广州.pdf

功能：设备参数(JSON) → 按规范自动推导类型码/终端类别/测量点号/资产编号/地址
      → 规则校验 → 输出 xlsx 导入模板。P 列及以后校验参数按 4.1.13 留空。

零模型依赖，仅 openpyxl。
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

try:
    from openpyxl import Workbook
    from openpyxl.styles import Font, PatternFill, Alignment
    from openpyxl.utils import get_column_letter
except ImportError:
    sys.exit("缺少 openpyxl，请安装：pip install openpyxl")

# ---------- 规范规则表（4.1.2 / 4.1.5 实读）----------
DEVICE_TYPE_CODE: dict[str, int] = {
    "24版电能表": 1, "21版电能表": 2, "普通电能表": 3,
    "光伏智能断路器": 4, "协议转换单元": 5, "分支装置": 6,
}
ALIASES = {
    "24版电表": "24版电能表", "21版电表": "21版电能表", "普通电表": "普通电能表",
    "智能量测断路器": "光伏智能断路器", "断路器": "光伏智能断路器",
}
TERMINAL_TYPE_CODE = {
    "负荷管理终端": "03", "配变监测计量终端": "04", "集中器": "05", "采集器": "06",
    "厂站电能量采集终端": "07", "售电管理装置": "08", "智能融合终端": "26",
}
METER_TYPES = {"24版电能表", "21版电能表", "普通电能表"}
# 分支装置类：4=光伏智能断路器(智能量测断路器) 与 6=分支装置共用 110+ 测量点(4.1.7/5.1.2)
BRANCH_TYPES = {"分支装置", "光伏智能断路器"}

# 测量点号起始（4.1.7）
MP_START = {
    ("公变", "协议转换单元"): 901,
    ("专变", "协议转换单元"): 51,
    ("公变", "分支装置"): 110,
    ("专变", "分支装置"): 110,
}

# 输出列：全部来自规范 4.1.2~4.1.13，P 列及以后为校验参数（4.1.13，导入留空）
HEADER = [
    "供电单位编号\n4.1.3", "户号\n4.1.4", "户名(光伏项目名称)\n4.1.4",
    "下发设备类型\n4.1.2", "终端类别\n4.1.5", "光伏用户分类\n4.1.6",
    "下发设备测量点号\n4.1.7", "下发设备资产编号\n4.1.9", "下发设备地址\n4.1.10",
    "台区编号\n4.1.12", "台区名称\n4.1.12", "分支控制点编号\n4.1.11", "轮次号\n4.1.11",
]
CHECK_COL = 16  # P 列


def canonical_type(name: str) -> tuple[int, str]:
    key = ALIASES.get(str(name).strip(), str(name).strip())
    if key not in DEVICE_TYPE_CODE:
        raise ValueError(f"未知设备类型 {name!r}；合法={list(DEVICE_TYPE_CODE)}")
    return DEVICE_TYPE_CODE[key], key


def canonical_terminal(name: Any) -> str:
    if name in (None, ""):
        return ""
    key = str(name).strip()
    if key in TERMINAL_TYPE_CODE:
        return TERMINAL_TYPE_CODE[key]
    if key in TERMINAL_TYPE_CODE.values():
        return key
    raise ValueError(f"未知终端类别 {name!r}；合法={TERMINAL_TYPE_CODE}")


def table_addr_from_serial(serial: str) -> str:
    """5.1.2：表地址 = 除校验位外出厂编号后 12 位。"""
    s = str(serial).strip()
    if len(s) < 12:
        raise ValueError(f"出厂编号 {serial!r} 不足 12 位，无法取表地址(5.1.2)")
    return s[-12:]


def assign_measurement_points(devices: list[dict], access: str) -> None:
    """4.1.7/4.1.8：公变协议转换单元 901+ / 专变 51+ / 分支装置 110+；全局唯一。"""
    counters = {
        "协议转换单元": MP_START[(access, "协议转换单元")],
        "分支装置": MP_START[(access, "分支装置")],
    }
    used: set[int] = set()
    for d in devices:
        _, canon = canonical_type(d["设备类型"])
        d["_canonical"] = canon
        if canon == "协议转换单元":
            mp = counters["协议转换单元"]
            counters["协议转换单元"] += 1
        elif canon in BRANCH_TYPES:
            mp = counters["分支装置"]
            counters["分支装置"] += 1
        elif canon in METER_TYPES:
            # 4.1.7：电能表测量点号与营销系统采集关系一致 → 必须由输入提供
            if d.get("营销测量点号") is None:
                raise ValueError(f"电能表 {canon} 缺少『营销测量点号』(4.1.7)")
            mp = int(d["营销测量点号"])
        else:
            if d.get("测量点号") is None:
                raise ValueError(f"{canon} 缺少『测量点号』")
            mp = int(d["测量点号"])
        if mp in used:
            raise ValueError(f"测量点号 {mp} 重复，违反 4.1.8（同一户号下不得相同）")
        used.add(mp)
        d["_mp"] = mp


def build_rows(payload: dict) -> tuple[list[list[Any]], list[str]]:
    access = payload["接入方式"]
    if access not in ("公变", "专变"):
        raise ValueError("接入方式只能是 公变 / 专变")
    control = payload.get("控制方式", "刚性")
    devices = payload["设备"]
    assign_measurement_points(devices, access)

    rows: list[list[Any]] = []
    warnings: list[str] = []
    for idx, d in enumerate(devices):
        code, canon = canonical_type(d["设备类型"])
        if canon in METER_TYPES:
            addr = table_addr_from_serial(d.get("出厂编号", d.get("通信地址", "")))
            if "出厂编号" not in d:
                warnings.append(f"设备{idx+1} {canon} 未给出厂编号，用通信地址直填（5.1.2 需复核）")
        else:
            addr = str(d.get("通信地址", "")).strip()
        if not addr:
            raise ValueError(f"设备{idx+1} 缺少通信地址(4.1.10)")
        # 4.1.9：资产编号无则填通信地址
        asset = str(d.get("资产编号", "")).strip() or addr

        # 4.1.11：专变刚性分支装置的分支控制点号=A/B/C…，轮次号=1/2/3…
        ctrl_point, round_no = "", ""
        if access == "专变" and control == "刚性" and canon in BRANCH_TYPES:
            ctrl_point = f"{payload['户号']}{chr(ord('A') + idx)}"
            round_no = idx + 1

        # 4.1.12：公变接入必须台区编号/名称
        if access == "公变" and not payload.get("台区编号"):
            raise ValueError("公变接入缺少『台区编号』(4.1.12)")

        rows.append([
            payload.get("供电单位编号", ""),
            payload["户号"],
            payload["户名"],
            code,
            canonical_terminal(d.get("终端类别")),
            1,  # 4.1.6 光伏用户分类默认 1
            d["_mp"],
            asset,
            addr,
            payload.get("台区编号", ""),
            payload.get("台区名称", ""),
            ctrl_point,
            round_no,
        ])
    return rows, warnings


def validate(rows: list[list[Any]]) -> list[str]:
    """生成后自检：对齐规范硬约束。"""
    errs: list[str] = []
    mps: set[int] = set()
    for i, r in enumerate(rows, 1):
        code, terminal, pv_class, mp, asset, addr = r[3], r[4], r[5], r[6], r[7], r[8]
        if code not in DEVICE_TYPE_CODE.values():
            errs.append(f"行{i} 设备类型码 {code} 非 1~6(4.1.2)")
        if terminal and terminal not in TERMINAL_TYPE_CODE.values():
            errs.append(f"行{i} 终端类别 {terminal} 非法(4.1.5)")
        if pv_class != 1:
            errs.append(f"行{i} 光伏用户分类应为 1(4.1.6)")
        if mp in mps:
            errs.append(f"行{i} 测量点号 {mp} 重复(4.1.8)")
        mps.add(mp)
        if not asset:
            errs.append(f"行{i} 资产编号为空且未回退通信地址(4.1.9)")
        if not addr:
            errs.append(f"行{i} 通信地址为空(4.1.10)")
    if len(rows) > len(mps):
        errs.append("存在重复测量点号(4.1.8)")
    return errs


def write_xlsx(rows: list[list[Any]], out: Path, source_note: str) -> None:
    wb = Workbook()
    ws = wb.active
    ws.title = "调控调试清单"
    ws.append(HEADER)
    for r in rows:
        ws.append(r)

    head_fill = PatternFill("solid", fgColor="1F4E78")
    for c in range(1, len(HEADER) + 1):
        cell = ws.cell(row=1, column=c)
        cell.font = Font(bold=True, color="FFFFFF", size=10)
        cell.fill = head_fill
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    widths = [14, 16, 22, 12, 12, 12, 16, 22, 22, 14, 18, 18, 10]
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.row_dimensions[1].height = 34
    ws.freeze_panes = "A2"

    # P 列及以后为校验参数（4.1.13）：留空，仅表头提示
    ws.cell(row=1, column=CHECK_COL, value="校验参数留空\n4.1.13 下发时填")
    ws.cell(row=1, column=CHECK_COL).font = Font(bold=True, color="9C5700")
    ws.cell(row=1, column=CHECK_COL).fill = PatternFill("solid", fgColor="FFF2CC")
    ws.column_dimensions[get_column_letter(CHECK_COL)].width = 20

    info = wb.create_sheet("生成依据")
    info.append(["字段/规则", "规范出处"])
    for line in source_note.strip().splitlines():
        if "｜" in line:
            a, b = line.split("｜", 1)
            info.append([a.strip(), b.strip()])
    info.column_dimensions["A"].width = 26
    info.column_dimensions["B"].width = 80
    for cell in info[1]:
        cell.font = Font(bold=True)

    out.parent.mkdir(parents=True, exist_ok=True)
    wb.save(out)


SOURCE_NOTE = """
设备类型码1~6｜4.1.2：1=24版电能表 2=21版电能表 3=普通电能表 4=光伏智能断路器 5=协议转换单元 6=分支装置
供电单位编号｜4.1.3：按南网供电单位编号表填入
户号/户名｜4.1.4：户号=光伏发电户户号，户名=光伏项目名称
终端类别｜4.1.5：03负荷管理/04配变监测/05集中器/06采集器/07厂站/08售电/26智能融合
光伏用户分类｜4.1.6：默认值 1
测量点号｜4.1.7：公变协议转换单元901+/专变51+，分支装置110+，电能表与营销采集关系一致
测量点唯一｜4.1.8：同一户号下不同终端测量点号不得相同
资产编号｜4.1.9：无则填通信地址
下发设备地址｜4.1.10：填通信地址
分支控制点/轮次｜4.1.11：专变刚性分支装置必填，点号=用户编号+A/B/C，轮次=1/2/3
台区编号/名称｜4.1.12：公变接入必填
校验参数｜4.1.13：P列及以后为校验参数，导入可留空，下发时按现场实际填写
表地址｜5.1.2：除校验位外出厂编号后 12 位
""".strip()

SAMPLE: dict = {
    "接入方式": "专变",
    "控制方式": "刚性",
    "供电单位编号": "0300",          # 演示值，实际按 4.1.3 表填
    "户号": "DEMO20261118",           # 演示样例，非真实户号
    "户名": "演示光伏项目",
    "台区编号": "",
    "台区名称": "",
    "设备": [
        {"设备类型": "24版电能表", "出厂编号": "000000000000123456789012", "营销测量点号": 1,
         "终端类别": "智能融合终端"},
        {"设备类型": "光伏智能断路器", "通信地址": "000000000002", "资产编号": "ZA-DELTA-002"},
        {"设备类型": "协议转换单元", "通信地址": "000000000003"},
        {"设备类型": "分支装置", "通信地址": "000000000004"},
    ],
}


def self_test() -> None:
    import copy
    p = copy.deepcopy(SAMPLE)
    p["户号"] = "DEMO001"
    rows, warns = build_rows(p)
    errs = validate(rows)
    assert not errs, f"自检失败: {errs}"
    # 关键字段断言（红卡验收标准：设备类型/测量点/校验参数正确）
    assert [r[3] for r in rows] == [1, 4, 5, 6], rows
    assert [r[6] for r in rows] == [1, 110, 51, 111], "测量点号分配错"
    assert rows[0][7] == "123456789012", "表地址应=出厂编号后12位(5.1.2)"
    assert rows[2][7] == "000000000003", "资产编号应回退通信地址(4.1.9)"
    assert rows[1][11] == "DEMO001B" and rows[1][12] == 2, "专变刚性分支控制点/轮次错(4.1.11)"
    assert rows[3][11] == "DEMO001D" and rows[3][12] == 4, "专变刚性分支控制点/轮次错(4.1.11)"
    # 4.1.8 唯一性反例
    bad = copy.deepcopy(SAMPLE)
    bad["户号"] = "DEMO002"
    # 两块电能表填同一营销测量点号 → 应触发 4.1.8 唯一性
    bad["设备"].append({"设备类型": "普通电能表", "出厂编号": "000000000000999999999999",
                        "营销测量点号": 1, "终端类别": "智能融合终端"})
    try:
        build_rows(bad)
    except ValueError as e:
        assert "重复" in str(e), e
    else:
        raise AssertionError("未拦截重复测量点号(4.1.8)")
    print("SELF_TEST_OK  规则断言全通过；警告:", warns)


def main() -> int:
    ap = argparse.ArgumentParser(description="计量3.0 调控调试清单模板自动生成器")
    ap.add_argument("--input", type=Path, help="设备参数 JSON")
    ap.add_argument("--out", type=Path, default=Path("调控调试清单.xlsx"))
    ap.add_argument("--sample", action="store_true", help="用内置演示样例运行")
    ap.add_argument("--self-test", action="store_true", help="跑规则自检（不产出文件）")
    args = ap.parse_args()

    if args.self_test:
        self_test()
        return 0
    if args.sample:
        payload = SAMPLE
    elif args.input:
        payload = json.loads(args.input.read_text(encoding="utf-8"))
    else:
        ap.error("需要 --input 或 --sample 或 --self-test")

    rows, warns = build_rows(payload)
    errs = validate(rows)
    if errs:
        print("VALIDATION_FAILED:", *errs, sep="\n  - ")
        return 2
    write_xlsx(rows, args.out, SOURCE_NOTE)
    print(f"GENERATED {args.out}  rows={len(rows)}  warnings={warns}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
