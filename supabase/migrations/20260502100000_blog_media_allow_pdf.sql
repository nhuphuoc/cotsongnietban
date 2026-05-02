-- Cho phép PDF trong bucket blog-media (admin upload qua /api/admin/uploads/document).
-- Giữ ảnh tối đa 5MB ở API; PDF tối đa 15MB — nới giới hạn bucket để chứa được PDF.

update storage.buckets
set
  file_size_limit = 15728640,
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf'
  ]::text[]
where id = 'blog-media';
