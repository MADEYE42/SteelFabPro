package com.steelfabpro.reporting.service;

import com.steelfabpro.reporting.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportingService {
    private final ReportRepository reportRepository;
    private final MetricRepository metricRepository;
    private final LogRepository logRepository;

    public Report createReport(Report report) {
        report.setCreatedAt(LocalDateTime.now());
        return reportRepository.save(report);
    }

    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    public Metric addMetric(Long reportId, Metric metric) {
        Report report = reportRepository.findById(reportId).orElseThrow(() -> new IllegalArgumentException("Report not found"));
        metric.setReport(report);
        metric.setRecordedAt(LocalDateTime.now());
        return metricRepository.save(metric);
    }

    public List<Metric> getMetricsByReport(Long reportId) {
        Report report = reportRepository.findById(reportId).orElseThrow(() -> new IllegalArgumentException("Report not found"));
        return metricRepository.findAll().stream().filter(m -> m.getReport().equals(report)).toList();
    }

    public Log logEvent(Log log) {
        log.setTimestamp(LocalDateTime.now());
        return logRepository.save(log);
    }

    public List<Log> getAllLogs() {
        return logRepository.findAll();
    }
} 