# Agent 输出质量 eval

L4 的回归网。distillation 会让数字员工"进化"，但没有固定 case + 断言，你无法判断
进化后是变好还是变坏。这套 eval 给一组固定输入 + 结构性断言，蒸馏 / 提示词 / 模型
改动后重跑对比。

## 分工

- **机器（本目录已备好）**：check 引擎（[checks.py](checks.py)）+ 运行 harness（[harness.py](harness.py)）+ CLI（[run_evals.py](run_evals.py)）。已被 `tests/test_evals.py` 覆盖，无需网络即可回归。
- **你（领域内容）**：`cases/*.json` 里的 golden cases——什么输入、什么算"好输出"，是你的判断，机器替不了。

## 写一个 case

把 `cases/example_visual_prompt.json.example` 复制成 `cases/xxx.json`，填真实 `employeeKey`，改 `checks`：

```json
{
  "id": "唯一标识",
  "employeeKey": "真实员工 key",
  "input": "喂给员工的输入",
  "checks": [
    { "type": "min_length", "value": 80 },
    { "type": "contains", "value": "必须出现的词" },
    { "type": "not_contains", "value": "禁止出现的词" },
    { "type": "regex", "pattern": "竖屏|9:16" }
  ]
}
```

支持的 check：`contains` / `not_contains` / `regex`(pattern) / `min_length`(value) /
`max_length`(value) / `is_json` / `json_has_keys`(keys)。LLM 输出有随机性，所以只做
结构性断言，别写精确匹配。

## 跑

```bash
python -m evals.run_evals            # 跑 evals/cases 下全部 case，任一失败退出码非 0
python -m evals.run_evals --dir X    # 指定目录
```

退出码非 0 → 可直接挂进 CI 当回归门。
