# Migration Workspace

这个目录用于旧帮助中心内容迁移的临时工作区，不直接参与站点发布。

## 目录说明

- `input/`
  - 放 WordPress 导出的原始 XML/WXR 文件。
  - 只存输入源文件，便于重复执行和回溯。

- `output/`
  - 放 `wordpress-export-to-markdown` 的第一层转换结果。
  - 这里通常会生成按文章分组的 Markdown、图片和附件目录。

- `reports/`
  - 放迁移过程中的统计结果、检查清单和异常报告。
  - 例如：分类统计、图片下载失败列表、旧链接待替换清单。

## 建议流程

1. 把原始 XML 放进 `input/`
2. 跑 WordPress 导出工具，输出到 `output/`
3. 检查 `output/` 结果并在 `reports/` 记录问题
4. 确认映射规则后，再把内容整理进正式 `docs/` 和 `static/`
