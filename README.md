# Teacher Schedule v2

Ứng dụng thời gian biểu giáo viên + quản lý học sinh + tính học phí theo buổi.

## Tính năng mới
- Học phí riêng cho từng học sinh (VNĐ/buổi).
- Điểm danh từng buổi: Đã học/Nghỉ.
- Tự tính tổng tiền theo số buổi đã học.
- Ghi nhận tiền đã thanh toán và số tiền còn lại.
- Tạo link chia sẻ riêng cho từng học sinh; link chỉ trả về lịch của học sinh đó.
- Lịch có thể gán cho cả lớp hoặc một học sinh cụ thể.
- Tùy chỉnh giờ bắt đầu/kết thúc từng tiết.

## Chạy local trên Windows
Mở CMD tại thư mục project:

```cmd
npm install
cd backend
npm install
cd ..
run-all.bat
```

Frontend: http://localhost:5173
Backend: http://localhost:4000/api/health

## Deploy
Frontend có thể deploy Vercel/Cloudflare Pages. Backend có thể deploy Render.
Khi deploy frontend, đặt biến môi trường `VITE_API_URL` thành URL API backend + `/api`.

Ví dụ:
`VITE_API_URL=https://your-backend.onrender.com/api`

Lưu ý: bản này vẫn dùng SQLite cho local/demo. Khi đưa lên production lâu dài, nên chuyển database sang PostgreSQL/Supabase.
