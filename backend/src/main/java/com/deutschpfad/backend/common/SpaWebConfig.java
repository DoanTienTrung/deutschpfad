package com.deutschpfad.backend.common;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;
import java.time.Duration;
import java.util.regex.Pattern;

/**
 * Cho backend tự phục vụ bản build frontend khi chạy MỘT service duy nhất (Render free: không có nginx
 * đứng trước). Chỉ bật khi đặt {@code app.frontend-dir} (FRONTEND_DIR); local và docker compose để
 * trống, frontend vẫn do Vite/nginx lo.
 *
 * <p>Làm đúng những gì {@code frontend/nginx.conf} + {@code nginx-notfound.conf} đang làm: file có thật
 * thì trả file, đường dẫn của React Router thì trả index.html, còn lại 404 thật. Không được trả
 * index.html cho MỌI đường dẫn: host mà {@code /wp-login.php} hay {@code /.env} cũng "tồn tại" và cũng
 * hiện form đăng nhập là đặc điểm Safe Browsing dùng để xếp trang vào nhóm lừa đảo (tên miền DuckDNS
 * cũ đã dính, xem chú thích trong nginx-notfound.conf).
 *
 * <p>Đăng ký ở "/**" nên đứng SAU mọi controller: /api/... vẫn tới controller như cũ, chỉ những gì không
 * controller nào nhận mới rơi xuống đây.
 */
@Configuration
public class SpaWebConfig implements WebMvcConfigurer {

    // Đường dẫn bot dò liên tục để tìm mã nguồn khác (WordPress, phpMyAdmin...), giống nginx-notfound.conf.
    private static final Pattern BOT_PATHS = Pattern.compile(
        "^(wp-admin|wp-content|wp-includes|wp-login|wordpress|xmlrpc|phpmyadmin|pma|cgi-bin|vendor|backup|shell)(/.*)?$",
        Pattern.CASE_INSENSITIVE
    );

    private final String frontendDir;

    public SpaWebConfig(@Value("${app.frontend-dir:}") String frontendDir) {
        this.frontendDir = frontendDir;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        if (frontendDir == null || frontendDir.isBlank()) {
            return;
        }
        String location = "file:" + (frontendDir.endsWith("/") ? frontendDir : frontendDir + "/");
        Resource index = new FileSystemResource(frontendDir + "/index.html");

        // Vite gắn mã băm vào tên file trong assets/: nội dung đổi thì tên đổi, nên cache được lâu.
        registry.addResourceHandler("/assets/**")
            .addResourceLocations(location + "assets/")
            .setCacheControl(CacheControl.maxAge(Duration.ofDays(365)).cachePublic().immutable());

        // index.html luôn phải hỏi lại máy chủ (như add_header Cache-Control "no-cache" ở nginx): trình
        // duyệt giữ bản cũ thì sau mỗi lần deploy nó đòi những file assets/ không còn tồn tại.
        registry.addResourceHandler("/**")
            .addResourceLocations(location)
            .setCacheControl(CacheControl.noCache())
            .resourceChain(true)
            .addResolver(new PathResourceResolver() {
                @Override
                protected Resource getResource(String resourcePath, Resource location) throws IOException {
                    // super giữ nguyên phần chặn đường dẫn thoát ra ngoài thư mục frontend ("../").
                    Resource requested = super.getResource(resourcePath, location);
                    if (requested != null) {
                        return requested;
                    }
                    return isAppRoute(resourcePath) && index.exists() ? index : null;
                }
            });
    }

    /** Đường dẫn có thể là một trang của React Router (không phải file, API hay đồ bot dò). */
    static boolean isAppRoute(String path) {
        if (path.startsWith("api/") || path.equals("api") || path.startsWith("ws/")
            || path.startsWith("oauth2/authorization") || path.startsWith("login/oauth2")) {
            return false;
        }
        // Có dấu chấm ở đoạn cuối = đang xin một file (không có thật, vì nếu có đã trả ở trên); đoạn nào
        // bắt đầu bằng dấu chấm = /.env, /.git/config...
        String lastSegment = path.substring(path.lastIndexOf('/') + 1);
        if (lastSegment.contains(".") || path.startsWith(".") || path.contains("/.")) {
            return false;
        }
        return !BOT_PATHS.matcher(path).matches();
    }
}
