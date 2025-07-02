package com.steelfabpro.reporting.controller;

import com.steelfabpro.reporting.model.*;
import com.steelfabpro.reporting.service.ReportingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportingController {
    private final ReportingService reportingService;

    @PostMapping
    public ResponseEntity<Report> createReport(@RequestBody Report report) {
        return ResponseEntity.ok(reportingService.createReport(report));
    }

    @GetMapping
    public ResponseEntity<List<Report>> getAllReports() {
        return ResponseEntity.ok(reportingService.getAllReports());
    }

    @PostMapping("/{reportId}/metrics")
    public ResponseEntity<Metric> addMetric(@PathVariable Long reportId, @RequestBody Metric metric) {
        return ResponseEntity.ok(reportingService.addMetric(reportId, metric));
    }

    @GetMapping("/{reportId}/metrics")
    public ResponseEntity<List<Metric>> getMetricsByReport(@PathVariable Long reportId) {
        return ResponseEntity.ok(reportingService.getMetricsByReport(reportId));
    }

    @PostMapping("/logs")
    public ResponseEntity<Log> logEvent(@RequestBody Log log) {
        return ResponseEntity.ok(reportingService.logEvent(log));
    }

    @GetMapping("/logs")
    public ResponseEntity<List<Log>> getAllLogs() {
        return ResponseEntity.ok(reportingService.getAllLogs());
    }
} 