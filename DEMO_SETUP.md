# Hướng dẫn chạy Demo

## Yêu cầu

- Node.js 18+ (hoặc sử dụng nvm)
- npm hoặc yarn
- Supabase CLI (để deploy edge functions)
- Tài khoản Supabase project

## Bước 1: Cài đặt Dependencies

```bash
npm install
```

## Bước 2: Cấu hình Environment Variables

Tạo file `.env` trong thư mục gốc với nội dung:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

Bạn có thể lấy các giá trị này từ:
- Supabase Dashboard → Project Settings → API
- `VITE_SUPABASE_URL`: Project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: anon/public key

## Bước 3: Setup Supabase (nếu chưa có)

### 3.1. Cài đặt Supabase CLI

```bash
npm install -g supabase
```

### 3.2. Login vào Supabase

```bash
supabase login
```

### 3.3. Link project (nếu chưa link)

```bash
supabase link --project-ref your-project-ref
```

### 3.4. Deploy Edge Functions

Deploy function `chat`:
```bash
supabase functions deploy chat
```

Deploy function `list-documents`:
```bash
supabase functions deploy list-documents
```

### 3.5. Set Environment Variables cho Edge Functions

Set `LOVABLE_API_KEY` cho edge function `chat`:
```bash
supabase secrets set LOVABLE_API_KEY=your_lovable_api_key --project-ref your-project-ref
```

## Bước 4: Chạy Development Server

```bash
npm run dev
```

Ứng dụng sẽ chạy tại: `http://localhost:8080`

## Bước 5: Test ứng dụng

1. **Đăng ký/Đăng nhập**: 
   - Truy cập `http://localhost:8080`
   - Bạn sẽ được redirect đến trang `/auth`
   - Đăng ký tài khoản mới hoặc đăng nhập

2. **Sử dụng Chat**:
   - Sau khi đăng nhập, bạn sẽ thấy giao diện chat
   - Sidebar bên phải (desktop) hoặc nút "Bộ lọc" (mobile) để chọn tài liệu
   - Danh sách tài liệu sẽ tự động load từ Airweave
   - Chọn tài liệu muốn filter, sau đó gửi câu hỏi

3. **Xem Sources**:
   - Mỗi câu trả lời sẽ có section "X nguồn tài liệu"
   - Click để xem chi tiết các tài liệu được sử dụng

## Troubleshooting

### Lỗi: "Cannot connect to Supabase"
- Kiểm tra lại `VITE_SUPABASE_URL` và `VITE_SUPABASE_PUBLISHABLE_KEY` trong file `.env`
- Đảm bảo file `.env` nằm trong thư mục gốc của project

### Lỗi: "Edge function not found"
- Đảm bảo đã deploy edge functions: `supabase functions deploy chat` và `supabase functions deploy list-documents`
- Kiểm tra tên function phải chính xác

### Lỗi: "LOVABLE_API_KEY not configured"
- Set secret: `supabase secrets set LOVABLE_API_KEY=your_key --project-ref your-project-ref`
- Lấy API key từ Lovable dashboard

### Lỗi: "Collection không tồn tại"
- Kiểm tra `collectionId` trong `supabase/functions/_shared/airweave-config.ts`
- Đảm bảo collection ID đúng trong Airweave

### Danh sách tài liệu không hiển thị
- Kiểm tra console browser để xem lỗi
- Kiểm tra edge function `list-documents` đã được deploy chưa
- Kiểm tra Airweave API key và collection ID

## Cấu trúc Edge Functions

- `chat`: Xử lý RAG chat, gọi Airweave và Lovable AI
- `list-documents`: Lấy danh sách documents từ Airweave

## Notes

- Edge functions cần được deploy trước khi sử dụng
- Environment variables cho edge functions được set qua Supabase CLI
- Frontend environment variables được đọc từ file `.env`

