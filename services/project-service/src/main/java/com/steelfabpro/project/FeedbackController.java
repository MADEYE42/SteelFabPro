package com.steelfabpro.project;

import com.steelfabpro.project.model.Feedback;
import com.steelfabpro.project.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/feedback")
@RequiredArgsConstructor
public class FeedbackController {
    private final FeedbackService feedbackService;

    @PostMapping
    public ResponseEntity<Feedback> addFeedback(@PathVariable Long projectId, @RequestBody Feedback feedback) {
        Feedback created = feedbackService.addFeedback(projectId, feedback);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<Feedback>> getFeedback(@PathVariable Long projectId) {
        return ResponseEntity.ok(feedbackService.getFeedbackByProject(projectId));
    }
} 