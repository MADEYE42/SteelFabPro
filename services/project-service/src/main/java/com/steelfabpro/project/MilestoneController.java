package com.steelfabpro.project;

import com.steelfabpro.project.model.Milestone;
import com.steelfabpro.project.service.MilestoneService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/milestones")
@RequiredArgsConstructor
public class MilestoneController {
    private final MilestoneService milestoneService;

    @PostMapping
    public ResponseEntity<Milestone> createMilestone(@PathVariable Long projectId, @RequestBody Milestone milestone) {
        Milestone created = milestoneService.createMilestone(projectId, milestone);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<Milestone>> getMilestones(@PathVariable Long projectId) {
        return ResponseEntity.ok(milestoneService.getMilestonesByProject(projectId));
    }
} 