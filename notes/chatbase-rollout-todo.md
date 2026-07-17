# Chatbase 上线待办

## 等待生产环境发布

- [ ] 发布帮助中心构建产物，并确认 `build/chatbase-sitemap.xml` 已同步到生产环境。
- [ ] 在无既有来源状态的浏览器中确认下列地址能返回 XML，而非 IAM 登录页：
  `https://support.oceanpayment.com/chatbase-sitemap.xml?source=odpm`
- [ ] 在 Chatbase 的 `Data sources > Website > Sitemap` 添加上述生产 sitemap。
- [ ] 确认抓取页数、中文/英文内容和容量套餐符合预期后，点击 `Retrain agent`。
- [ ] 验证通过后删除当前用于测试的 Crawl links 与 Individual links，避免重复训练数据。

## 上线前的 Chatbase 配置

- [ ] 配置 Agent Instructions：仅依据知识库回答、按提问语言作答、禁止编造规则/时效/状态。
- [ ] 配置中英文欢迎语与快捷问题。
- [ ] 制定并测试“无知识库答案”的兜底话术。
- [ ] 在运营邮箱、隐私提示与处理流程确认后，再配置转人工/工单 Action。
- [ ] 完成 Playground 中英文测试集并记录结果。

## 已完成验证

- [x] 带 `?source=odpm` 的单篇文档可由 Chatbase 正常抓取。
- [x] 已验证退款撤销、Refund History 与小程序 10 分钟重新登录等精确内容。
- [x] 本地构建已生成 187 条中英文 Chatbase sitemap URL。
