package com.steelfabpro.payment;

import com.steelfabpro.payment.model.*;
import com.steelfabpro.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;

    @PostMapping("/invoices")
    public ResponseEntity<Invoice> createInvoice(@RequestBody Invoice invoice) {
        Invoice created = paymentService.createInvoice(invoice);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/invoices")
    public ResponseEntity<List<Invoice>> getAllInvoices() {
        return ResponseEntity.ok(paymentService.getAllInvoices());
    }

    @PostMapping("/invoices/{invoiceId}/payments")
    public ResponseEntity<Payment> recordPayment(@PathVariable Long invoiceId, @RequestBody Payment payment) {
        Payment created = paymentService.recordPayment(invoiceId, payment);
        return ResponseEntity.ok(created);
    }

    @PostMapping("/payment-methods")
    public ResponseEntity<PaymentMethod> addPaymentMethod(@RequestBody PaymentMethod method) {
        PaymentMethod created = paymentService.addPaymentMethod(method);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<Transaction>> getAllTransactions() {
        return ResponseEntity.ok(paymentService.getAllTransactions());
    }
} 