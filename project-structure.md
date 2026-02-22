# Cấu trúc dự án Product Management

Dự án này được xây dựng dựa trên kiến trúc **MVC (Model-View-Controller)** sử dụng Node.js, Express và Pug. Dưới đây là cấu trúc thư mục trực quan và ý nghĩa chi tiết:

## 🌳 Sơ đồ tổ chức

```text
product-managent/
├── config/                 # Cấu hình hệ thống (Database, biến môi trường...)
├── controllers/            # Logic xử lý request, tương tác Model, điều hướng View
│   ├── admin/              # Controllers cho trang quản trị
│   └── client/             # Controllers cho giao diện người dùng ngoài
├── helpers/                # Các hàm tiện ích dùng chung (phân trang, lọc, mã hóa...)
├── middlewares/            # Chặn/Xử lý request trung gian (auth, upload, locals...)
│   ├── admin/              # Middlewares phía quản trị
│   └── client/             # Middlewares phía khách hàng
├── models/                 # Định nghĩa Schema cho MongoDB (User, Product, Order...)
├── public/                 # Các file tĩnh (truy cập trực tiếp được từ trình duyệt)
│   ├── admin/              # CSS, JS, Images của trang quản trị
│   ├── client/             # CSS, JS, Images của giao diện ngoài
│   └── uploads/            # Thư mục lưu trữ file người dùng/admin tải lên
├── routes/                 # Điều hướng các đường dẫn (endpoints) API/Web
│   ├── admin/              # Routes cho trang quản trị
│   └── client/             # Routes cho giao diện ngoài
├── validates/              # Kiểm tra dữ liệu đầu vào (Validation)
│   ├── admin/
│   └── client/
├── views/                  # Giao diện hiển thị (Templates dùng Pug)
│   ├── admin/              # Giao diện trang quản trị
│   └── client/             # Giao diện người dùng ngoài
├── .env                    # Biến môi trường nhạy cảm (Cổng, Database URL, Secret Key)
├── .gitignore              # Các file/thư mục không đưa lên Git
├── index.js                # File chạy chính của server Node.js
├── package.json            # Thông tin dự án, danh sách thư viện (Dependencies)
├── package-lock.json       # Khoá phiên bản chính xác của các thư viện
├── vercel.json             # Cấu hình deploy lên nền tảng Vercel
└── README.md               # Giới thiệu dự án
```

---

## 📁 Thư mục (Directories)

- **`config/`**: Chứa các tệp cấu hình cho dự án, ví dụ như cấu hình kết nối cơ sở dữ liệu (Database), cấu hình các hằng số hoặc biến môi trường tùy chỉnh.
- **`controllers/`**: Chứa logic xử lý các yêu cầu (requests) từ người dùng. Đây là nơi nhận request từ `routes`, thao tác với `models` và trả về dữ liệu hoặc render ra `views`.
- **`helpers/`**: Chứa các hàm tiện ích (utility functions) dùng chung cho toàn bộ dự án để tránh lặp lại code (ví dụ: hàm tạo chuỗi ngẫu nhiên, mã hóa mật khẩu, phân trang, lọc, slugify, v.v.).
- **`middlewares/`**: Chứa các hàm middleware của Express. Được sử dụng để chặn và xử lý các requests trước khi chúng đi đến các controller (ví dụ: kiểm tra xác thực người dùng/đăng nhập, phân quyền, xử lý giỏ hàng cục bộ).
- **`models/`**: Chứa định nghĩa các schema cho cơ sở dữ liệu (thường là Mongoose schema khi làm việc với MongoDB). Quy định cấu trúc bản ghi của các thực thể như `User`, `Product`, `Category`, `Cart`, `Order`, `Role` v.v.
- **`public/`**: Chứa các tệp tin tĩnh (static files) có thể truy cập trực tiếp từ trình duyệt mà không cần qua router xử lý:
  - Tệp CSS giao diện hiển thị (`css/style.css`)
  - Tệp JavaScript ở phía máy khách (`js/script.js`)
  - Thư mục hình ảnh (`images`)
  - Các thư viện TinyMCE, v.v.
- **`routes/`**: Nơi định nghĩa các đường dẫn (endpoints) của ứng dụng. Nó làm nhiệm vụ điều hướng các yêu cầu HTTP (GET, POST, PUT, DELETE, PATCH...) tới các hàm tương ứng trong `controllers`. Định tuyến thường chia làm hai mảng chính `admin/` và `client/`.
- **`validates/`**: Chứa các tệp xử lý logic kiểm tra tính hợp lệ (validation) của dữ liệu đầu vào từ phía người dùng (Ví dụ: validate dữ liệu khi người dùng đăng ký, đăng nhập, hoặc tạo mới thông tin).
- **`views/`**: Chứa các giao diện (templates) hiển thị cho người dùng, sử dụng **Pug** làm template engine. Được tổ chức chia vách cấu trúc hiển thị theo `admin/` (cho trang quản trị) và `client/` (cho trang người dùng cuối).

## 📄 Tệp tin (Files)

- **`index.js`**: Tệp tin chạy chính (entry point) của dự án. Nơi khởi tạo ứng dụng Express, kết nối Database, cấu hình template engine (Pug), đăng ký hệ thống routers và khởi chạy server lắng nghe kết nối.
- **`.env`**: Tệp ẩn chứa các biến môi trường nhạy cảm như Mật khẩu DB, chuỗi kết nối Database (MONGO_URL), Cổng chạy ứng dụng (PORT), các Session/JWT Secret Key... (Tệp này KHÔNG được đưa lên source control như Github).
- **`.gitignore`**: Danh sách cấu hình bỏ qua không đưa lên hệ thống tracking Git của mã nguồn (ví dụ: `node_modules`, `.env`).
- **`package.json`** & **`package-lock.json`**: Các tệp chứa thông tin metadata hệ thống dự án, danh sách các thư viện/dependencies (Express, Mongoose, Pug, v.v.) và các scripts chạy dự án (như `npm start`, `npm run dev`).
- **`vercel.json`**: Tệp cấu hình tối ưu để triển khai (deploy) dự án trực tiếp lên nền tảng đám mây Vercel.
- **`README.md`**: File chứa thông tin giới thiệu và quy trình làm việc.
