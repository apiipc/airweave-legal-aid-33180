#!/bin/bash

# Script để push code lên GitHub

set -e

echo "🚀 Bắt đầu push code lên GitHub..."

# Kiểm tra git
if ! command -v git &> /dev/null; then
    echo "❌ Git chưa được cài đặt"
    exit 1
fi

# Kiểm tra xem đã có git repo chưa
if [ ! -d ".git" ]; then
    echo "📦 Khởi tạo Git repository..."
    git init
fi

# Thêm remote (hoặc cập nhật nếu đã có)
if git remote get-url origin &> /dev/null; then
    echo "🔄 Cập nhật remote origin..."
    git remote set-url origin https://github.com/apiipc/airweave-legal-aid-33180.git
else
    echo "➕ Thêm remote origin..."
    git remote add origin https://github.com/apiipc/airweave-legal-aid-33180.git
fi

# Kiểm tra .env có trong .gitignore chưa
if ! grep -q "\.env" .gitignore 2>/dev/null; then
    echo "⚠️  Thêm .env vào .gitignore..."
    echo "" >> .gitignore
    echo "# Environment variables" >> .gitignore
    echo ".env" >> .gitignore
    echo ".env.local" >> .gitignore
fi

# Thêm tất cả files
echo "📝 Thêm files vào staging..."
git add .

# Kiểm tra có thay đổi không
if git diff --staged --quiet; then
    echo "ℹ️  Không có thay đổi nào để commit"
    exit 0
fi

# Commit
echo "💾 Commit changes..."
git commit -m "Add document upload feature, citations display, and improved RAG analysis

- Add UploadDocument component for uploading contracts/documents
- Add upload-document edge function to handle file uploads to Airweave
- Improve system prompt for detailed document analysis and comparison
- Add inline citations display (similar to Airweave UI)
- Add document filters with refresh capability
- Improve error handling and user feedback"

# Push
echo "⬆️  Push lên GitHub..."
git branch -M main 2>/dev/null || true
git push -u origin main

echo "✅ Đã push code lên GitHub thành công!"
echo ""
echo "📋 Bước tiếp theo:"
echo "1. Vào Lovable Dashboard"
echo "2. Project Settings → Git Integration"
echo "3. Kết nối với: https://github.com/apiipc/airweave-legal-aid-33180"
echo "4. Chọn branch: main"
echo "5. Lovable sẽ tự động sync code"

