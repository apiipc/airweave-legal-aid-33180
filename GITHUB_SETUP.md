# Hướng dẫn Push Code lên GitHub và Kết nối với Lovable

## Bước 1: Khởi tạo Git Repository (nếu chưa có)

```bash
cd /Users/hainguyen/Downloads/code/airweave-legal-aid-33180-main
git init
```

## Bước 2: Thêm Remote Repository

```bash
git remote add origin https://github.com/apiipc/airweave-legal-aid-33180.git
```

Nếu remote đã tồn tại, cập nhật:
```bash
git remote set-url origin https://github.com/apiipc/airweave-legal-aid-33180.git
```

## Bước 3: Kiểm tra .gitignore

Đảm bảo file `.gitignore` có các mục sau:
- `node_modules/`
- `.env`
- `dist/`
- `.DS_Store`

## Bước 4: Thêm và Commit các thay đổi

```bash
# Thêm tất cả files
git add .

# Commit với message
git commit -m "Add document upload feature and improve RAG chat with citations"
```

## Bước 5: Push lên GitHub

```bash
# Lần đầu tiên
git branch -M main
git push -u origin main

# Các lần sau
git push origin main
```

## Bước 6: Kết nối với Lovable

1. Đăng nhập vào [Lovable](https://lovable.dev)
2. Vào Project Settings
3. Tìm phần "Git Integration" hoặc "Repository"
4. Kết nối với GitHub repository: `https://github.com/apiipc/airweave-legal-aid-33180`
5. Chọn branch `main`
6. Lovable sẽ tự động sync code từ GitHub

## Lưu ý

- **KHÔNG commit file `.env`** - file này chứa secrets
- **KHÔNG commit `node_modules/`** - quá lớn và không cần thiết
- Sau khi push, Lovable sẽ tự động cập nhật code
- Các thay đổi từ Lovable cũng sẽ được sync về GitHub

## Troubleshooting

### Lỗi: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/apiipc/airweave-legal-aid-33180.git
```

### Lỗi: "failed to push some refs"
```bash
# Pull trước khi push
git pull origin main --allow-unrelated-histories
git push origin main
```

### Lỗi: "authentication failed"
- Cần setup GitHub Personal Access Token
- Hoặc sử dụng SSH key

