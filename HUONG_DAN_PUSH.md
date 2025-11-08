# 📤 Hướng dẫn Push Code lên GitHub - Từng bước

## Cách 1: Push qua Cursor UI (Dễ nhất) ⭐

### Bước 1: Mở Source Control
- Nhấn phím tắt: **`Cmd + Shift + G`** (Mac) hoặc **`Ctrl + Shift + G`** (Windows)
- Hoặc click vào icon **Source Control** ở sidebar bên trái (biểu tượng nhánh cây)

### Bước 2: Kiểm tra thay đổi
- Bạn sẽ thấy danh sách các file đã thay đổi
- Ở trên cùng sẽ có số lượng commits chưa push (ví dụ: "↑ 4" nghĩa là có 4 commits chưa push)

### Bước 3: Push code
- Click vào icon **"..."** (3 chấm) ở góc trên bên phải của Source Control panel
- Chọn **"Push"** hoặc **"Push to..."**
- Nếu hỏi remote, chọn **`origin`**
- Nếu hỏi branch, chọn **`main`**
- Cursor sẽ tự động xử lý authentication

### Bước 4: Xác nhận
- Đợi vài giây để push hoàn tất
- Bạn sẽ thấy thông báo "Successfully pushed" hoặc "Pushed to origin/main"

---

## Cách 2: Push qua Terminal trong Cursor

### Bước 1: Mở Terminal
- Nhấn **`Ctrl + ~`** (backtick) hoặc **View → Terminal**
- Hoặc click vào tab **Terminal** ở dưới cùng

### Bước 2: Chạy lệnh push
```bash
git push -u origin main
```

### Bước 3: Nếu hỏi authentication
- **Username:** Nhập username GitHub của bạn (có thể là `apiipc`)
- **Password:** Nhập **GitHub Personal Access Token** (KHÔNG phải password GitHub)

**Nếu chưa có token:**
1. Vào: https://github.com/settings/tokens/new
2. Đặt tên: "Lovable Project"
3. Chọn scope: ✅ **repo**
4. Click "Generate token"
5. Copy token và dán vào khi hỏi password

---

## Cách 3: Sử dụng Script tự động

### Bước 1: Chạy script
```bash
./push-with-token.sh
```

### Bước 2: Nhập token
- Script sẽ hỏi GitHub Personal Access Token
- Dán token vào và nhấn Enter
- Script sẽ tự động push

---

## ✅ Kiểm tra sau khi push

1. **Mở trình duyệt:**
   - Vào: https://github.com/apiipc/airweave-legal-aid-33180

2. **Kiểm tra:**
   - Bạn sẽ thấy các commits mới
   - Code mới sẽ xuất hiện trong repository
   - Có thể xem lịch sử commits

3. **Xác nhận:**
   - Nếu thấy code trên GitHub = Push thành công! ✅

---

## 🔗 Sau khi push thành công - Kết nối Lovable

1. **Vào Lovable:**
   - https://lovable.dev
   - Đăng nhập

2. **Vào Project Settings:**
   - Tìm project của bạn
   - Click Settings

3. **Kết nối Git:**
   - Tìm phần "Git Integration" hoặc "Repository"
   - Click "Connect Repository"
   - Chọn GitHub
   - Chọn repository: `apiipc/airweave-legal-aid-33180`
   - Chọn branch: `main`
   - Click "Connect"

4. **Hoàn tất:**
   - Lovable sẽ tự động sync code từ GitHub
   - Các thay đổi từ Lovable cũng sẽ được push về GitHub

---

## ❓ Nếu gặp lỗi

### Lỗi: "Authentication failed"
- Kiểm tra token có đúng không
- Đảm bảo token có quyền `repo`

### Lỗi: "Permission denied"
- Kiểm tra bạn có quyền push vào repository
- Đảm bảo repository không bị khóa

### Lỗi: "Repository not found"
- Kiểm tra URL repository đúng chưa
- Đảm bảo repository tồn tại trên GitHub

---

## 💡 Mẹo

- **Lần đầu push:** Sử dụng Cursor UI (dễ nhất)
- **Các lần sau:** Có thể dùng Terminal hoặc Cursor UI
- **Tự động sync:** Sau khi kết nối Lovable, code sẽ tự động sync 2 chiều

