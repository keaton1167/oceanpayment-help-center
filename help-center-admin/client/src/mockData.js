export const metrics = [
  { label: "全部文档", value: 232, tone: "neutral" },
  { label: "草稿", value: 7, tone: "draft" },
  { label: "待审核", value: 4, tone: "review" },
  { label: "待发布", value: 3, tone: "publish" },
  { label: "资源异常", value: 2, tone: "danger" },
  { label: "英文待复核", value: 6, tone: "warning" }
];

export const documents = [
  {
    title: "OP Card Business Application Documentation Guide",
    language: "en",
    category: "OP Card / Business",
    status: "待发布",
    source: "Docusaurus",
    owner: "运营",
    updatedAt: "2026-07-10 14:20"
  },
  {
    title: "账户登录与来源限制说明",
    language: "zh-Hans",
    category: "账户 / 登录",
    status: "草稿",
    source: "手动创建",
    owner: "运营",
    updatedAt: "2026-07-10 13:45"
  },
  {
    title: "飞书文档导入转换样例",
    language: "zh-Hans",
    category: "导入 / 飞书",
    status: "待审核",
    source: "飞书文档",
    owner: "客户关系部",
    updatedAt: "2026-07-10 11:30"
  }
];

export const taskLogs = [
  { name: "项目初始化扫描", type: "scan", status: "success", duration: "12s" },
  { name: "飞书单篇导入 mock", type: "import", status: "mock", duration: "3s" },
  { name: "资源完整性检查", type: "resource", status: "warning", duration: "8s" },
  { name: "build.zip 生成占位", type: "build", status: "pending", duration: "-" }
];

