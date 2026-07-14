"""指路牌——本文件不是服务入口(uv 初始化残留)。

真入口:
  用户端  uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
  管理端  uvicorn admin.main:app --port 8001 --reload
完整启动手册见 docs/RUNBOOK.md。
"""


def main() -> None:
    print("本文件不是服务入口。用户端: uvicorn app.main:app --port 8000 | 管理端: uvicorn admin.main:app --port 8001 | 详见 docs/RUNBOOK.md")


if __name__ == "__main__":
    main()
