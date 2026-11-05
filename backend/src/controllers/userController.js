import { findUserById, toUserDTO } from "../services/userService.js";

// Controller to get profile of the currently logged-in user
export const authMe = async (req, res) => {
  try {
    const userId = req.user.id; // Extracted from decoded JWT by authMiddleware

    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({
        message: "Không tìm thấy người dùng",
      });
    }

    return res.status(200).json({
      user: toUserDTO(user),
    });
  } catch (error) {
    console.error("Lỗi khi gọi authMe", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
