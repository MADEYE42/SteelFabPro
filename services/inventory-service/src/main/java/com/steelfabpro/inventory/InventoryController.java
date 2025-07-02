package com.steelfabpro.inventory;

import com.steelfabpro.inventory.model.Alert;
import com.steelfabpro.inventory.model.Material;
import com.steelfabpro.inventory.model.StockEntry;
import com.steelfabpro.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class InventoryController {
    private final InventoryService inventoryService;

    @PostMapping("/materials")
    public ResponseEntity<Material> addMaterial(@RequestBody Material material) {
        Material created = inventoryService.addMaterial(material);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/materials")
    public ResponseEntity<List<Material>> getAllMaterials() {
        return ResponseEntity.ok(inventoryService.getAllMaterials());
    }

    @PostMapping("/materials/{materialId}/stock-in")
    public ResponseEntity<StockEntry> stockIn(@PathVariable Long materialId, @RequestBody StockEntry entry, @RequestParam Long userId) {
        StockEntry result = inventoryService.stockIn(materialId, entry, userId);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/materials/{materialId}/stock-out")
    public ResponseEntity<StockEntry> stockOut(@PathVariable Long materialId, @RequestBody StockEntry entry, @RequestParam Long userId) {
        StockEntry result = inventoryService.stockOut(materialId, entry, userId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/alerts")
    public ResponseEntity<List<Alert>> getAlerts() {
        return ResponseEntity.ok(inventoryService.getAlerts());
    }
} 