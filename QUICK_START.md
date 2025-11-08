# Quick Start - Chạy Demo Nhanh

## Bước 1: Cài đặt Dependencies

```bash
npm install
```

## Bước 2: Tạo file .env

Tạo file `.env` trong thư mục gốc:

```bash
cat > .env << 'EOF'
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key_here
EOF
```

**Lưu ý**: Thay `your_supabase_url_here` và `your_supabase_key_here` bằng giá trị thực từ Supabase Dashboard.

## Bước 3: Deploy Edge Functions (Quan trọng!)

Bạn cần deploy 2 edge functions trước:

```bash
# Deploy chat function
supabase functions deploy chat

# Deploy list-documents function  
supabase functions deploy list-documents

# Set LOVABLE_API_KEY (nếu chưa set)
supabase secrets set LOVABLE_API_KEY=your_lovable_key
```

## Bước 4: Chạy Dev Server

```bash
npm run dev
```

Mở browser tại: **http://localhost:8080**

## Checklist trước khi chạy

- [ ] Đã cài đặt dependencies (`npm install`)
- [ ] Đã tạo file `.env` với Supabase credentials
- [ ] Đã deploy edge function `chat`
- [ ] Đã deploy edge function `list-documents`
- [ ] Đã set `LOVABLE_API_KEY` secret
- [ ] Đã kiểm tra Airweave config trong `supabase/functions/_shared/airweave-config.ts`

## Nếu gặp lỗi

Xem file `DEMO_SETUP.md` để biết chi tiết troubleshooting.

