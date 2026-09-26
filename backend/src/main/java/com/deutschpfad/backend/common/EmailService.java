package com.deutschpfad.backend.common;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final String mailFrom;

    public EmailService(
        JavaMailSender mailSender,
        @Value("${app.mail-from}") String mailFrom
    ) {
        this.mailSender = mailSender;
        this.mailFrom = mailFrom;
    }

    public void send(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        // Kèm tên hiển thị để hộp thư hiện "DeutschPfad" chứ không phải địa chỉ trần -- thư không
        // có tên người gửi vừa khó tin vừa dễ bị đánh dấu rác.
        message.setFrom("DeutschPfad <" + mailFrom + ">");
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }
}
