const UPLOAD_ENDPOINT = "/api/admin/uploads/image";

export async function uploadAdminImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch(UPLOAD_ENDPOINT, {
    method: "POST",
    body: fd,
    credentials: "include",
  });

  const json = (await res.json()) as { data?: { url?: string }; error?: { message?: string } };
  if (!res.ok) {
    throw new Error(json.error?.message ?? "Upload thất bại");
  }
  const url = json.data?.url;
  if (!url) {
    throw new Error("Phản hồi upload không hợp lệ");
  }
  return url;
}
