# Kết nối với Lovable

## Sau khi đã push code lên GitHub

### Bước 1: Push code lên GitHub

Chạy script:
```bash
./push-with-token.sh
```

Hoặc thủ công:
```bash
# Với Personal Access Token
git remote set-url origin https://YOUR_TOKEN@github.com/apiipc/airweave-legal-aid-33180.git
git push -u origin main

# Sau đó xóa token khỏi URL (bảo mật)
git remote set-url origin https://github.com/apiipc/airweave-legal-aid-33180.git
```

### Bước 2: Kết nối Lovable với GitHub

1. **Đăng nhập vào Lovable:**
   - Vào https://lovable.dev
   - Đăng nhập với tài khoản của bạn

2. **Vào Project Settings:**
   - Tìm project của bạn (hoặc tạo mới)
   - Click vào Settings hoặc Project Settings

3. **Kết nối Git Repository:**
   - Tìm phần "Git Integration" hoặc "Repository" hoặc "Source Control"
   - Click "Connect Repository" hoặc "Link Repository"
   - Chọn "GitHub"
   - Authorize Lovable truy cập GitHub (nếu cần)
   - Chọn repository: `apiipc/airweave-legal-aid-33180`
   - Chọn branch: `main`
   - Click "Connect" hoặc "Save"

4. **Cấu hình Sync:**
   - Lovable sẽ tự động sync code từ GitHub
   - Các thay đổi từ Lovable cũng sẽ được push về GitHub
   - Có thể chọn auto-sync hoặc manual sync

### Bước 3: Kiểm tra

- Code từ GitHub sẽ xuất hiện trong Lovable
- Các thay đổi từ Lovable sẽ được commit và push về GitHub
- Có thể xem commit history trong cả 2 nơi

## Lưu ý

- **Environment Variables:** File `.env` không được commit, cần set trong Lovable Project Settings
- **Edge Functions:** Cần deploy riêng qua Supabase CLI, không tự động sync
- **Secrets:** Các secrets (API keys) cần set trong Supabase Dashboard, không commit vào code

## Troubleshooting

### Lovable không thấy code
- Kiểm tra repository đã public hoặc bạn có quyền truy cập
- Kiểm tra branch name đúng là `main`
- Refresh page và thử lại

### Sync không hoạt động
- Kiểm tra GitHub integration trong Lovable Settings
- Đảm bảo đã authorize Lovable truy cập GitHub
- Kiểm tra repository permissions

