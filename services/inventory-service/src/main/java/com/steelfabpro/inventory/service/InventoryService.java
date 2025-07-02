package com.steelfabpro.inventory.service;

import com.steelfabpro.inventory.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {
    private final MaterialRepository materialRepository;
    private final StockEntryRepository stockEntryRepository;
    private final InventoryLogRepository inventoryLogRepository;
    private final AlertRepository alertRepository;

    public Material addMaterial(Material material) {
        material.setCreatedAt(LocalDateTime.now());
        return materialRepository.save(material);
    }

    public List<Material> getAllMaterials() {
        return materialRepository.findAll();
    }

    public StockEntry stockIn(Long materialId, StockEntry entry, Long userId) {
        Material material = materialRepository.findById(materialId).orElseThrow(() -> new IllegalArgumentException("Material not found"));
        entry.setMaterial(material);
        StockEntry savedEntry = stockEntryRepository.save(entry);
        inventoryLogRepository.save(InventoryLog.builder()
                .material(material)
                .changeType("IN")
                .quantity(entry.getQuantity())
                .userId(userId)
                .timestamp(LocalDateTime.now())
                .note("Stock in")
                .build());
        return savedEntry;
    }

    public StockEntry stockOut(Long materialId, StockEntry entry, Long userId) {
        Material material = materialRepository.findById(materialId).orElseThrow(() -> new IllegalArgumentException("Material not found"));
        entry.setMaterial(material);
        entry.setQuantity(-Math.abs(entry.getQuantity()));
        StockEntry savedEntry = stockEntryRepository.save(entry);
        inventoryLogRepository.save(InventoryLog.builder()
                .material(material)
                .changeType("OUT")
                .quantity(entry.getQuantity())
                .userId(userId)
                .timestamp(LocalDateTime.now())
                .note("Stock out")
                .build());
        // Check for low stock and create alert if needed
        int totalStock = stockEntryRepository.findAll().stream()
                .filter(e -> e.getMaterial().equals(material))
                .mapToInt(StockEntry::getQuantity).sum();
        if (material.getMinStock() != null && totalStock < material.getMinStock()) {
            alertRepository.save(Alert.builder()
                    .material(material)
                    .alertType("LOW_STOCK")
                    .triggeredAt(LocalDateTime.now())
                    .build());
        }
        return savedEntry;
    }

    public List<Alert> getAlerts() {
        return alertRepository.findAll();
    }
} 