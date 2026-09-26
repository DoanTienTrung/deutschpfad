package com.deutschpfad.backend.common;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;

@Service
public class EmailService {

    // Tên hiển thị để hộp thư hiện "DeutschPfad" chứ không phải địa chỉ trần -- thư không có tên
    // người gửi vừa khó tin vừa dễ bị đánh dấu rác.
    private static final String SENDER_NAME = "DeutschPfad";

    private final JavaMailSender mailSender;
    private final String mailFrom;

    public EmailService(
        JavaMailSender mailSender,
        @Value("${app.mail-from}") String mailFrom
    ) {
        this.mailSender = mailSender;
        this.mailFrom = mailFrom;
    }

    /** Thư văn bản thuần — dùng cho thư cảnh báo nội bộ gửi cho admin. */
    public void send(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(SENDER_NAME + " <" + mailFrom + ">");
        message.setReplyTo(mailFrom);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }

    /**
     * Thư gửi cho người học: gửi kèm <b>cả hai</b> phần văn bản thuần và HTML
     * ({@code multipart/alternative}).
     *
     * <p>Vì sao không chỉ gửi HTML: một số client và bộ lọc đọc phần text, và thư chỉ-HTML bị
     * nhiều luật lọc thư rác trừ điểm. Vì sao không chỉ gửi text: xem {@link EmailTemplates}.
     * Client sẽ tự chọn phần nào nó hiển thị được — phần text phải đứng độc lập được, không phải
     * chỗ để nhét cho có.
     */
    public void sendHtml(String to, String subject, String textBody, String htmlBody) {
        MimeMessage message = mailSender.createMimeMessage();
        try {
            // true = multipart; phần text phải set TRƯỚC phần html, vì client hiển thị phần cuối
            // cùng mà nó đọc được -- đảo thứ tự là ai cũng nhận được bản text trơ trụi.
            MimeMessageHelper helper =
                new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setFrom(mailFrom, SENDER_NAME);
            helper.setReplyTo(mailFrom, SENDER_NAME);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(textBody, htmlBody);
        } catch (jakarta.mail.MessagingException | UnsupportedEncodingException e) {
            throw new IllegalStateException("Không dựng được email gửi tới " + to, e);
        }
        mailSender.send(message);
    }
}
