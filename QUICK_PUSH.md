# Push Code lên GitHub - Hướng dẫn nhanh

## ⚠️ Cần GitHub Personal Access Token

Để push code, bạn cần tạo GitHub Personal Access Token:

### Bước 1: Tạo Token (1 phút)

1. Vào: https://github.com/settings/tokens/new
2. Đặt tên: "Lovable Project"
3. Chọn scope: ✅ **repo** (full control)
4. Click "Generate token"
5. **Copy token ngay** (chỉ hiển thị 1 lần!)

### Bước 2: Push với Token

Chạy lệnh sau (thay `YOUR_TOKEN` bằng token vừa copy):

```bash
git push https://YOUR_TOKEN@github.com/apiipc/airweave-legal-aid-33180.git main
```

### Hoặc sử dụng script:

```bash
./push-with-token.sh
```

Script sẽ hỏi token và tự động push.

## ✅ Sau khi push thành công

Kiểm tra tại: https://github.com/apiipc/airweave-legal-aid-33180

Nếu thấy code, nghĩa là đã thành công!

