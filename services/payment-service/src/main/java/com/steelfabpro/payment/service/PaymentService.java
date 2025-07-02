package com.steelfabpro.payment.service;

import com.steelfabpro.payment.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final TransactionRepository transactionRepository;

    public Invoice createInvoice(Invoice invoice) {
        invoice.setIssuedAt(LocalDateTime.now());
        invoice.setStatus("PENDING");
        return invoiceRepository.save(invoice);
    }

    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    public Payment recordPayment(Long invoiceId, Payment payment) {
        Invoice invoice = invoiceRepository.findById(invoiceId).orElseThrow(() -> new IllegalArgumentException("Invoice not found"));
        payment.setInvoice(invoice);
        payment.setPaidAt(LocalDateTime.now());
        Payment savedPayment = paymentRepository.save(payment);
        invoice.setStatus("PAID");
        invoice.setPaidAt(payment.getPaidAt());
        invoiceRepository.save(invoice);
        return savedPayment;
    }

    public PaymentMethod addPaymentMethod(PaymentMethod method) {
        method.setCreatedAt(LocalDateTime.now());
        return paymentMethodRepository.save(method);
    }

    public Transaction logTransaction(Transaction transaction) {
        transaction.setProcessedAt(LocalDateTime.now());
        return transactionRepository.save(transaction);
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }
} 