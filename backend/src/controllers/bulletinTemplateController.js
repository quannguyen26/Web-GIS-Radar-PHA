import { findActiveTemplate } from "../services/bulletinTemplateService.js";

// GET /api/bulletin-templates/current
// The active template for the caller's organization type (from the token),
// with its field description. 404 if that type has no template yet.
export const getCurrentTemplate = async (req, res) => {
  try {
    const template = await findActiveTemplate(req.user.organizationType);
    if (!template) {
      return res
        .status(404)
        .json({ message: "Chưa có mẫu bản tin cho loại đơn vị của bạn" });
    }

    return res.status(200).json({
      id: template.id,
      code: template.code,
      version: template.version,
      name: template.name,
      organizationType: template.organization_type,
      fields: template.fields,
    });
  } catch (error) {
    console.error("Lỗi khi gọi getCurrentTemplate", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
