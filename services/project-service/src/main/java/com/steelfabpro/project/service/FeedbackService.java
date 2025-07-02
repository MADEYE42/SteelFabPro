package com.steelfabpro.project.service;

import com.steelfabpro.project.model.Feedback;
import com.steelfabpro.project.model.FeedbackRepository;
import com.steelfabpro.project.model.Project;
import com.steelfabpro.project.model.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedbackService {
    private final FeedbackRepository feedbackRepository;
    private final ProjectRepository projectRepository;

    public Feedback addFeedback(Long projectId, Feedback feedback) {
        Project project = projectRepository.findById(projectId).orElseThrow(() -> new IllegalArgumentException("Project not found"));
        feedback.setProject(project);
        return feedbackRepository.save(feedback);
    }

    public List<Feedback> getFeedbackByProject(Long projectId) {
        Project project = projectRepository.findById(projectId).orElseThrow(() -> new IllegalArgumentException("Project not found"));
        return feedbackRepository.findAll().stream().filter(f -> f.getProject().equals(project)).toList();
    }
} 