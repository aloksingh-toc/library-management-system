package com.lms.library_system.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${app.mail.from:noreply@library.com}")
    private String from;

    @Async
    public void sendReservationFulfilled(String toEmail, String bookTitle) {
        if (!mailEnabled) return;
        send(toEmail,
            "Your reserved book is now available",
            "Good news! The book you reserved — \"" + bookTitle + "\" — is now available.\n\n" +
            "Log in to borrow it before someone else does.\n\nLibrary Management System"
        );
    }

    @Async
    public void sendBorrowConfirmation(String toEmail, String bookTitle, String dueDate) {
        if (!mailEnabled) return;
        send(toEmail,
            "Book borrowed: " + bookTitle,
            "You have successfully borrowed \"" + bookTitle + "\".\n\n" +
            "Please return it by: " + dueDate + "\n\n" +
            "A fine of $1.00 per day will be applied for late returns.\n\nLibrary Management System"
        );
    }

    @Async
    public void sendOverdueReminder(String toEmail, String bookTitle, long daysOverdue, double fine) {
        if (!mailEnabled) return;
        send(toEmail,
            "Overdue book reminder: " + bookTitle,
            "This is a reminder that \"" + bookTitle + "\" is " + daysOverdue + " day(s) overdue.\n\n" +
            "Current fine: $" + String.format("%.2f", fine) + "\n\n" +
            "Please return it as soon as possible.\n\nLibrary Management System"
        );
    }

    private void send(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            // Log but don't fail the main flow if email fails
        }
    }
}
