import Joi from "joi";
const RedWalletSchema = Joi.object()
  .options({ abortEarly: false })
  .keys({
    walletAddress: Joi.string().required().label("walletAddress"),
    caseNumber: Joi.string().required().label("caseNumber"),
    country: Joi.string().required().label("country"),
    department: Joi.string().required().label("department"),
    category: Joi.string().required().label("category"),
    subCategory: Joi.string().required().label("subCategory"),
    noticeContent: Joi.string().required().label("noticeContent"),
    actionLink: Joi.string().required().label("actionLink"),
    imageLink: Joi.string().required().label("imageLink"),
    investigationOffice: Joi.string().required().label("investigationOffice"),
    issueDate: Joi.string().required().label("issueDate"),
    lastDate: Joi.string().required().label("lastDate"),
    fromWalletAddress: Joi.string().optional().label("fromWalletAddress"),
  });

export { RedWalletSchema };
