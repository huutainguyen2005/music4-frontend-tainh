/**
 * Tạo blob URL xem trước cho file vừa chọn và thu hồi blob URL cũ (nếu có) để không rò rỉ bộ nhớ.
 * Dùng: setPreview(replaceBlobUrl(preview, file))
 */
export const replaceBlobUrl = (previous, file) => {
  if (typeof previous === "string" && previous.startsWith("blob:")) {
    URL.revokeObjectURL(previous);
  }
  return URL.createObjectURL(file);
};
