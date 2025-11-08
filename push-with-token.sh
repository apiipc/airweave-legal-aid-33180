#!/bin/bash

# Script để push với GitHub Personal Access Token

echo "📤 Push code lên GitHub..."
echo ""
echo "Bạn cần GitHub Personal Access Token để push."
echo "Nếu chưa có, tạo tại: https://github.com/settings/tokens"
echo ""

read -p "Nhập GitHub Personal Access Token: " TOKEN

if [ -z "$TOKEN" ]; then
    echo "❌ Token không được để trống"
    exit 1
fi

# Cập nhật remote URL với token
git remote set-url origin https://${TOKEN}@github.com/apiipc/airweave-legal-aid-33180.git

# Push
echo ""
echo "⬆️  Đang push..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Đã push thành công lên GitHub!"
    echo ""
    echo "🔗 Repository: https://github.com/apiipc/airweave-legal-aid-33180"
    echo ""
    echo "📋 Bước tiếp theo - Kết nối với Lovable:"
    echo "1. Vào https://lovable.dev"
    echo "2. Project Settings → Git Integration"
    echo "3. Kết nối với: https://github.com/apiipc/airweave-legal-aid-33180"
    echo "4. Chọn branch: main"
    echo ""
    
    # Xóa token khỏi remote URL (bảo mật)
    git remote set-url origin https://github.com/apiipc/airweave-legal-aid-33180.git
    echo "🔒 Đã xóa token khỏi remote URL (bảo mật)"
else
    echo ""
    echo "❌ Push thất bại. Kiểm tra lại token và quyền truy cập."
    # Xóa token khỏi remote URL
    git remote set-url origin https://github.com/apiipc/airweave-legal-aid-33180.git
fi

