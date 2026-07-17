export class CategoriesService {
  listCategories() {
    return {
      items: [
        {
          id: "cat_account",
          level: 1,
          nameZh: "账户管理",
          nameEn: "Account",
          slug: "account",
          enabled: true
        },
        {
          id: "cat_payment",
          level: 1,
          nameZh: "支付产品",
          nameEn: "Payment",
          slug: "payment",
          enabled: true
        },
        {
          id: "cat_op_card_business",
          parentId: "cat_op_card",
          level: 2,
          nameZh: "商务申请",
          nameEn: "Business Application",
          slug: "business-application",
          enabled: true
        }
      ]
    };
  }
}

