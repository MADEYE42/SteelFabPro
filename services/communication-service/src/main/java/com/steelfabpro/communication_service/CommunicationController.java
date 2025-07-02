package com.steelfabpro.communication_service;

import com.steelfabpro.communication_service.model.*;
import com.steelfabpro.communication_service.service.CommunicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CommunicationController {
    private final CommunicationService communicationService;

    @PostMapping("/threads")
    public ResponseEntity<Thread> createThread(@RequestBody Thread thread) {
        Thread created = communicationService.createThread(thread);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/threads")
    public ResponseEntity<List<Thread>> getAllThreads() {
        return ResponseEntity.ok(communicationService.getAllThreads());
    }

    @PostMapping("/threads/{threadId}/messages")
    public ResponseEntity<Message> postMessage(@PathVariable Long threadId, @RequestBody Message message) {
        Message created = communicationService.postMessage(threadId, message);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/threads/{threadId}/messages")
    public ResponseEntity<List<Message>> getMessagesByThread(@PathVariable Long threadId) {
        return ResponseEntity.ok(communicationService.getMessagesByThread(threadId));
    }

    @PostMapping("/messages/{messageId}/attachments")
    public ResponseEntity<Attachment> addAttachment(@PathVariable Long messageId, @RequestBody Attachment attachment) {
        Attachment created = communicationService.addAttachment(messageId, attachment);
        return ResponseEntity.ok(created);
    }

    @PostMapping("/notifications")
    public ResponseEntity<Notification> sendNotification(@RequestBody Notification notification) {
        Notification created = communicationService.sendNotification(notification);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/notifications")
    public ResponseEntity<List<Notification>> getNotificationsByUser(@RequestParam Long userId) {
        return ResponseEntity.ok(communicationService.getNotificationsByUser(userId));
    }
} 