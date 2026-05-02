export function parsePageParams(url: URL) {
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1);
  const rawSize = parseInt(url.searchParams.get("pageSize") || "10", 10) || 10;
  const pageSize = Math.min(100, Math.max(5, rawSize));
  return { page, pageSize };
}
