package com.steelfabpro.project;

import com.steelfabpro.project.model.ProjectFile;
import com.steelfabpro.project.service.ProjectFileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/files")
@RequiredArgsConstructor
public class ProjectFileController {
    private final ProjectFileService projectFileService;

    @PostMapping
    public ResponseEntity<ProjectFile> addFile(@PathVariable Long projectId, @RequestBody ProjectFile file) {
        ProjectFile created = projectFileService.addFile(projectId, file);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<ProjectFile>> getFiles(@PathVariable Long projectId) {
        return ResponseEntity.ok(projectFileService.getFilesByProject(projectId));
    }
} 