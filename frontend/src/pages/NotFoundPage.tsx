import { ButtonLink } from '@kit'
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
    <div className="mx-auto flex min-h-screen max-w-lesen items-center justify-center px-4">
      <div className="w-full rounded-karte border border-dashed border-kante p-12 text-center">
        <p className="font-display text-4xl font-bold text-hauch">404</p>
        <h1 className="mt-3 font-display text-xl font-bold text-bleistift">Không tìm thấy trang này</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-radiert">
          Đường dẫn bạn vừa mở không tồn tại. Có thể link bị gõ thiếu, hoặc trang đã được đổi chỗ.
        </p>
        <ButtonLink to={homeTo} className="mt-6">
          Về trang chủ
        </ButtonLink>
      </div>
    </div>
  )
}
