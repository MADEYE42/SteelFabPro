package com.steelfabpro.project.service;

import com.steelfabpro.project.model.Project;
import com.steelfabpro.project.model.ProjectFile;
import com.steelfabpro.project.model.ProjectFileRepository;
import com.steelfabpro.project.model.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectFileService {
    private final ProjectFileRepository projectFileRepository;
    private final ProjectRepository projectRepository;

    public ProjectFile addFile(Long projectId, ProjectFile file) {
        Project project = projectRepository.findById(projectId).orElseThrow(() -> new IllegalArgumentException("Project not found"));
        file.setProject(project);
        return projectFileRepository.save(file);
    }

    public List<ProjectFile> getFilesByProject(Long projectId) {
        Project project = projectRepository.findById(projectId).orElseThrow(() -> new IllegalArgumentException("Project not found"));
        return projectFileRepository.findAll().stream().filter(f -> f.getProject().equals(project)).toList();
    }
} 