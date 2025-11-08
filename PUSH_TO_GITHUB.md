# Hướng dẫn Push Code lên GitHub

## ✅ Code đã được commit thành công!

Commit đã được tạo với message: "Add document upload feature, citations display, and improved RAG analysis"

## Bước tiếp theo: Push lên GitHub

Bạn cần xác thực với GitHub. Có 2 cách:

### Cách 1: Sử dụng GitHub Personal Access Token (Khuyến nghị)

1. **Tạo Personal Access Token:**
   - Vào GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Click "Generate new token (classic)"
   - Đặt tên: "Lovable Project"
   - Chọn scopes: `repo` (full control of private repositories)
   - Click "Generate token"
   - **Copy token ngay** (chỉ hiển thị 1 lần)

2. **Push với token:**
```bash
cd /Users/hainguyen/Downloads/code/airweave-legal-aid-33180-main

# Sử dụng token thay vì password
git push https://YOUR_TOKEN@github.com/apiipc/airweave-legal-aid-33180.git main
```

Hoặc cập nhật remote URL:
```bash
git remote set-url origin https://YOUR_TOKEN@github.com/apiipc/airweave-legal-aid-33180.git
git push -u origin main
```

### Cách 2: Sử dụng SSH (Nếu đã setup SSH key)

1. **Kiểm tra SSH key:**
```bash
ls -la ~/.ssh
```

2. **Nếu chưa có, tạo SSH key:**
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

3. **Thêm SSH key vào GitHub:**
   - Copy public key: `cat ~/.ssh/id_ed25519.pub`
   - Vào GitHub → Settings → SSH and GPG keys → New SSH key
   - Paste key và save

4. **Đổi remote sang SSH:**
```bash
git remote set-url origin git@github.com:apiipc/airweave-legal-aid-33180.git
git push -u origin main
```

### Cách 3: Sử dụng GitHub CLI (gh)

```bash
# Cài đặt GitHub CLI (nếu chưa có)
brew install gh

# Login
gh auth login

# Push
git push -u origin main
```

## Sau khi push thành công

1. **Kiểm tra trên GitHub:**
   - Vào https://github.com/apiipc/airweave-legal-aid-33180
   - Xác nhận code đã được push

2. **Kết nối với Lovable:**
   - Đăng nhập vào [Lovable](https://lovable.dev)
   - Vào Project Settings
   - Tìm phần "Git Integration" hoặc "Repository"
   - Kết nối với: `https://github.com/apiipc/airweave-legal-aid-33180`
   - Chọn branch: `main`
   - Lovable sẽ tự động sync code từ GitHub

## Lưu ý quan trọng

- ✅ File `.env` đã được thêm vào `.gitignore` - sẽ KHÔNG được commit
- ✅ `node_modules/` đã được ignore
- ✅ Tất cả code mới đã được commit

## Nếu gặp lỗi

### Lỗi: "Permission denied"
- Kiểm tra bạn có quyền push vào repository
- Đảm bảo token/SSH key có quyền `repo`

### Lỗi: "Repository not found"
- Kiểm tra repository URL đúng chưa
- Đảm bảo repository tồn tại trên GitHub

### Lỗi: "Authentication failed"
- Thử lại với token mới
- Hoặc setup SSH key

