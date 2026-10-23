"""准备1180宋本的原件与逐页书影；供本地导入/部署使用，不由请求触发。

依赖只用于离线准备：pypdfium2、Pillow。使用 --source 指定已下载PDF。
输出位于 data/uploads/shanhaijing/editions/song-1180，校验后才生成就绪标记。
"""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SHA256 = "ee948b889c4f46e8e963d543bf370afc5b8de205803f3db7efd49b44aea50cf7"
PAGE_COUNT = 144


def prepare(source: Path, target: Path) -> None:
    """校验原件，复制到运行目录，并以可重复执行方式生成全部书影。"""
    import pypdfium2 as pdfium
    from PIL import Image

    with source.open("rb") as stream:
        if hashlib.file_digest(stream, "sha256").hexdigest() != SHA256:
            raise ValueError("原件校验值不符，不能作为1180宋本导入")
    target.mkdir(parents=True, exist_ok=True)
    pdf_path = target / "song-1180-color.pdf"
    if pdf_path.exists():
        with pdf_path.open("rb") as stream:
            if hashlib.file_digest(stream, "sha256").hexdigest() != SHA256:
                raise ValueError("运行目录已有不同PDF，请检查后再导入")
    else:
        partial = target / "song-1180-color.pdf.part"
        shutil.copyfile(source, partial)
        partial.replace(pdf_path)
    pages = target / "pages"
    pages.mkdir(exist_ok=True)
    with pdfium.PdfDocument(str(pdf_path)) as document:
        if len(document) != PAGE_COUNT:
            raise ValueError("PDF页数不符")
        for number in range(1, PAGE_COUNT + 1):
            output = pages / f"{number:03d}.webp"
            if output.exists():
                with Image.open(output) as existing:
                    existing.verify()
            else:
                page = document[number - 1]
                bitmap = page.render(scale=2600 / page.get_width())
                try:
                    with bitmap.to_pil().convert("RGB") as image:
                        partial = output.with_suffix(".part")
                        image.save(partial, format="WEBP", quality=90, method=4)
                        partial.replace(output)
                finally:
                    bitmap.close()
                    page.close()
            if number % 5 == 0 or number == PAGE_COUNT:
                print(f"书影准备 {number}/{PAGE_COUNT}", flush=True)
    marker = {"source_sha256": SHA256, "page_count": PAGE_COUNT, "width": 2600}
    (target / "ready.json").write_text(
        json.dumps(marker, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"导入完成：{target}", flush=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--source",
        type=Path,
        default=ROOT / "output/pdf/shanhaijing-song-1180/song-1180-color.pdf",
    )
    parser.add_argument(
        "--target",
        type=Path,
        default=ROOT / "data/uploads/shanhaijing/editions/song-1180",
    )
    args = parser.parse_args()
    prepare(args.source, args.target)
