import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Trang 404.
 *
 * <p>Trước đây gõ một đường dẫn không tồn tại thì React Router không khớp route nào và render ra
 * màn hình trắng — người dùng không biết mình lạc chỗ nào, cũng không có đường quay lại.
 *
 * <p>Ngoài ra trang này còn có vai trò về phía máy: nó là thứ duy nhất phân biệt "đường dẫn thật"
 * với "đường dẫn bịa". Vì nginx có `try_files ... /index.html`, mọi URL đều trả 200 kèm ứng dụng
 * có form đăng nhập — một host mà đường dẫn nào cũng tồn tại và cũng hỏi email/mật khẩu là đặc
 * điểm bộ lọc dùng để nhận diện trang lừa đảo.
 */
export default function NotFoundPage() {
  const { user } = useAuth()
  const homeTo = user ? (user.role === 'ADMIN' ? '/admin/vocabulary' : '/app') : '/'

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center px-4">
      <div className="w-full rounded-lg border border-dashed border-hairline p-12 text-center">
        <p className="font-display text-4xl font-bold text-accent-deep">404</p>
        <h1 className="mt-3 font-display text-xl font-bold text-ink">Không tìm thấy trang này</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
          Đường dẫn bạn vừa mở không tồn tại. Có thể link bị gõ thiếu, hoặc trang đã được đổi chỗ.
        </p>
        <Link
          to={homeTo}
          className="mt-6 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-canvas transition-colors hover:bg-primary-deep"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  )
}
