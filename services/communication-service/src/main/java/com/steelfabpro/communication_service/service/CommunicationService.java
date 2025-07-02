package com.steelfabpro.communication_service.service;

import com.steelfabpro.communication_service.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommunicationService {
    private final ThreadRepository threadRepository;
    private final MessageRepository messageRepository;
    private final AttachmentRepository attachmentRepository;
    private final NotificationRepository notificationRepository;

    public Thread createThread(Thread thread) {
        thread.setCreatedAt(LocalDateTime.now());
        return threadRepository.save(thread);
    }

    public Message postMessage(Long threadId, Message message) {
        Thread thread = threadRepository.findById(threadId).orElseThrow(() -> new IllegalArgumentException("Thread not found"));
        message.setThread(thread);
        message.setSentAt(LocalDateTime.now());
        return messageRepository.save(message);
    }

    public Attachment addAttachment(Long messageId, Attachment attachment) {
        Message message = messageRepository.findById(messageId).orElseThrow(() -> new IllegalArgumentException("Message not found"));
        attachment.setMessage(message);
        attachment.setUploadedAt(LocalDateTime.now());
        return attachmentRepository.save(attachment);
    }

    public Notification sendNotification(Notification notification) {
        notification.setCreatedAt(LocalDateTime.now());
        return notificationRepository.save(notification);
    }

    public List<Thread> getAllThreads() {
        return threadRepository.findAll();
    }

    public List<Message> getMessagesByThread(Long threadId) {
        Thread thread = threadRepository.findById(threadId).orElseThrow(() -> new IllegalArgumentException("Thread not found"));
        return messageRepository.findAll().stream().filter(m -> m.getThread().equals(thread)).toList();
    }

    public List<Notification> getNotificationsByUser(Long userId) {
        return notificationRepository.findAll().stream().filter(n -> n.getUserId().equals(userId)).toList();
    }
} 