# Hướng dẫn Deploy Edge Functions

## Vấn đề: Lỗi "Không thể tải danh sách tài liệu"

Lỗi này xảy ra vì edge function `list-documents` chưa được deploy. Hãy làm theo các bước sau:

## Bước 1: Cài đặt Supabase CLI (nếu chưa có)

```bash
npm install -g supabase
```

## Bước 2: Login vào Supabase

```bash
supabase login
```

Sẽ mở browser để đăng nhập.

## Bước 3: Link project

```bash
supabase link --project-ref bklyhywskfszswgkbayk
```

## Bước 4: Deploy Edge Functions

### Deploy function `chat`:
```bash
supabase functions deploy chat
```

### Deploy function `list-documents`:
```bash
supabase functions deploy list-documents
```

## Bước 5: Set Environment Variables

Set `LOVABLE_API_KEY` (nếu chưa set):
```bash
supabase secrets set LOVABLE_API_KEY=your_lovable_api_key --project-ref bklyhywskfszswgkbayk
```

## Bước 6: Kiểm tra

Sau khi deploy, refresh lại trang web. Danh sách tài liệu sẽ tự động load.

## Troubleshooting

### Lỗi: "Function not found"
- Đảm bảo đã deploy cả 2 functions: `chat` và `list-documents`
- Kiểm tra tên function phải chính xác

### Lỗi: "Permission denied"
- Đảm bảo đã login: `supabase login`
- Kiểm tra bạn có quyền truy cập project

### Lỗi: "Collection không tồn tại"
- Kiểm tra `collectionId` trong `supabase/functions/_shared/airweave-config.ts`
- Đảm bảo collection ID đúng trong Airweave

### Vẫn không thấy documents
- Mở Developer Tools (F12) → Console để xem lỗi chi tiết
- Kiểm tra Network tab để xem response từ edge function
- Kiểm tra Supabase Dashboard → Edge Functions để xem logs

