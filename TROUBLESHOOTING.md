# Troubleshooting - Nguyên nhân lỗi "Không thể tải danh sách tài liệu"

## 🔍 Các nguyên nhân có thể:

### 1. **Edge Function chưa được deploy** ⚠️ (Nguyên nhân phổ biến nhất)

**Triệu chứng:**
- Lỗi "Không thể tải danh sách tài liệu"
- Console browser hiển thị: "Function not found" hoặc 404

**Giải pháp:**
```bash
# Cài đặt Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref bklyhywskfszswgkbayk

# Deploy function
supabase functions deploy list-documents
```

### 2. **Supabase CLI chưa được cài đặt**

**Kiểm tra:**
```bash
which supabase
# Nếu không có output → chưa cài đặt
```

**Giải pháp:**
```bash
npm install -g supabase
```

### 3. **Lỗi khi gọi Airweave API**

**Triệu chứng:**
- Edge function đã deploy nhưng vẫn lỗi
- Console logs hiển thị lỗi từ Airweave

**Kiểm tra:**
1. Mở Supabase Dashboard → Edge Functions → `list-documents` → Logs
2. Xem lỗi chi tiết trong logs

**Nguyên nhân có thể:**
- Airweave API key không đúng
- Collection ID không đúng
- Airweave API bị lỗi tạm thời

**Giải pháp:**
- Kiểm tra `supabase/functions/_shared/airweave-config.ts`
- Đảm bảo `apiKey` và `collectionId` đúng

### 4. **Lỗi Network/CORS**

**Triệu chứng:**
- Lỗi CORS trong console
- Network request bị block

**Giải pháp:**
- Kiểm tra CORS headers trong edge function (đã có sẵn)
- Kiểm tra Supabase project settings

### 5. **Lỗi Authentication**

**Triệu chứng:**
- User chưa đăng nhập
- Session expired

**Giải pháp:**
- Đảm bảo user đã đăng nhập
- Refresh page để renew session

## 🔧 Cách Debug:

### Bước 1: Kiểm tra Console Browser

1. Mở Developer Tools (F12)
2. Vào tab **Console**
3. Tìm lỗi liên quan đến `list-documents`
4. Copy lỗi để phân tích

### Bước 2: Kiểm tra Network Tab

1. Vào tab **Network**
2. Tìm request đến `list-documents`
3. Xem:
   - Status code (404 = function chưa deploy)
   - Response body (lỗi chi tiết)
   - Request headers

### Bước 3: Kiểm tra Supabase Dashboard

1. Vào Supabase Dashboard
2. Edge Functions → `list-documents`
3. Xem **Logs** để biết lỗi chi tiết

### Bước 4: Test Edge Function trực tiếp

```bash
# Test function locally (nếu có Supabase CLI)
supabase functions serve list-documents

# Hoặc test qua curl
curl -X POST https://bklyhywskfszswgkbayk.supabase.co/functions/v1/list-documents \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

## ✅ Checklist để fix:

- [ ] Supabase CLI đã được cài đặt
- [ ] Đã login vào Supabase CLI
- [ ] Đã link project
- [ ] Edge function `list-documents` đã được deploy
- [ ] Airweave API key đúng trong config
- [ ] Collection ID đúng trong config
- [ ] User đã đăng nhập vào app
- [ ] Đã refresh page sau khi deploy

## 🚀 Quick Fix:

Nếu vẫn không được, thử:

1. **Deploy lại function:**
```bash
supabase functions deploy list-documents --no-verify-jwt
```

2. **Kiểm tra function có tồn tại:**
```bash
supabase functions list
```

3. **Xem logs real-time:**
```bash
supabase functions logs list-documents
```

## 📞 Nếu vẫn lỗi:

1. Copy toàn bộ lỗi từ Console
2. Copy logs từ Supabase Dashboard
3. Kiểm tra Airweave API có hoạt động không
4. Kiểm tra network connection

