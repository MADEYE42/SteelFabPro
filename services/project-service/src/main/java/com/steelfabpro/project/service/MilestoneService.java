package com.steelfabpro.project.service;

import com.steelfabpro.project.model.Milestone;
import com.steelfabpro.project.model.MilestoneRepository;
import com.steelfabpro.project.model.Project;
import com.steelfabpro.project.model.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MilestoneService {
    private final MilestoneRepository milestoneRepository;
    private final ProjectRepository projectRepository;

    public Milestone createMilestone(Long projectId, Milestone milestone) {
        Project project = projectRepository.findById(projectId).orElseThrow(() -> new IllegalArgumentException("Project not found"));
        milestone.setProject(project);
        return milestoneRepository.save(milestone);
    }

    public List<Milestone> getMilestonesByProject(Long projectId) {
        Project project = projectRepository.findById(projectId).orElseThrow(() -> new IllegalArgumentException("Project not found"));
        return milestoneRepository.findAll().stream().filter(m -> m.getProject().equals(project)).toList();
    }
} 