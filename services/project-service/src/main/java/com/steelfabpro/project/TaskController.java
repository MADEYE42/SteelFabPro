package com.steelfabpro.project;

import com.steelfabpro.project.model.Task;
import com.steelfabpro.project.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/milestones/{milestoneId}/tasks")
@RequiredArgsConstructor
public class TaskController {
    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<Task> createTask(@PathVariable Long milestoneId, @RequestBody Task task) {
        Task created = taskService.createTask(milestoneId, task);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<Task>> getTasks(@PathVariable Long milestoneId) {
        return ResponseEntity.ok(taskService.getTasksByMilestone(milestoneId));
    }
} 