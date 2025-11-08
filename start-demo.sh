#!/bin/bash

# Script để chạy demo nhanh

echo "🚀 Bắt đầu setup demo..."

# Kiểm tra Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js chưa được cài đặt. Vui lòng cài đặt Node.js 18+"
    exit 1
fi

echo "✅ Node.js: $(node --version)"

# Kiểm tra npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm chưa được cài đặt"
    exit 1
fi

echo "✅ npm: $(npm --version)"

# Kiểm tra dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Đang cài đặt dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Lỗi khi cài đặt dependencies"
        exit 1
    fi
    echo "✅ Đã cài đặt dependencies"
else
    echo "✅ Dependencies đã được cài đặt"
fi

# Kiểm tra file .env
if [ ! -f ".env" ]; then
    echo "⚠️  File .env chưa tồn tại"
    echo "📝 Tạo file .env..."
    cat > .env << 'EOF'
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key_here
EOF
    echo "✅ Đã tạo file .env"
    echo "⚠️  VUI LÒNG CẬP NHẬT file .env với Supabase credentials của bạn!"
    echo ""
    read -p "Nhấn Enter sau khi đã cập nhật .env..."
fi

# Kiểm tra Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI chưa được cài đặt"
    echo "📦 Cài đặt Supabase CLI..."
    npm install -g supabase
    if [ $? -ne 0 ]; then
        echo "❌ Lỗi khi cài đặt Supabase CLI"
        echo "💡 Bạn có thể cài thủ công: npm install -g supabase"
    else
        echo "✅ Đã cài đặt Supabase CLI"
    fi
else
    echo "✅ Supabase CLI đã được cài đặt"
fi

echo ""
echo "🎯 Bước tiếp theo:"
echo "1. Đảm bảo file .env đã được cấu hình đúng"
echo "2. Deploy edge functions (nếu chưa deploy):"
echo "   - supabase functions deploy chat"
echo "   - supabase functions deploy list-documents"
echo "3. Chạy dev server: npm run dev"
echo ""
read -p "Bạn có muốn chạy dev server ngay bây giờ? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Đang khởi động dev server..."
    npm run dev
else
    echo "💡 Chạy 'npm run dev' khi bạn sẵn sàng!"
fi

