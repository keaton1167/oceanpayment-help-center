export class DocumentsService {
  listDocuments() {
    return {
      items: [
        {
          id: "doc_op_card_business",
          title: "OP Card Business Application Documentation Guide",
          language: "en",
          category: "OP Card / Business",
          status: "pending_publish",
          sourceType: "docusaurus",
          owner: "运营",
          updatedAt: "2026-07-10T14:20:00+08:00"
        },
        {
          id: "doc_source_login",
          title: "账户登录与来源限制说明",
          language: "zh-Hans",
          category: "账户 / 登录",
          status: "draft",
          sourceType: "manual",
          owner: "运营",
          updatedAt: "2026-07-10T13:45:00+08:00"
        },
        {
          id: "doc_feishu_import_sample",
          title: "飞书文档导入转换样例",
          language: "zh-Hans",
          category: "导入 / 飞书",
          status: "review",
          sourceType: "feishu_doc",
          owner: "客户关系部",
          updatedAt: "2026-07-10T11:30:00+08:00"
        }
      ]
    };
  }
}

