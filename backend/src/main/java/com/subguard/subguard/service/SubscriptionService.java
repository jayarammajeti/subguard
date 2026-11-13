package com.subguard.subguard.service;

import com.subguard.subguard.model.BillingCycle;
import com.subguard.subguard.model.Subscription;
import com.subguard.subguard.repository.SubscriptionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
public class SubscriptionService {
    private final SubscriptionRepository repository;

    public SubscriptionService(SubscriptionRepository repository) {
        this.repository = repository;
    }

    public List<Subscription> getAll() { return repository.findAll(); }

    public Subscription getById(Long id) {
        return repository.findById(id).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Subscription not found"));
    }

    public Subscription create(Subscription input) {
        input.setId(null); // Never trust client-supplied identifiers on create.
        return repository.save(input);
    }

    public Subscription update(Long id, Subscription input) {
        Subscription existing = getById(id);
        existing.setName(input.getName());
        existing.setPrice(input.getPrice());
        existing.setRenewalDate(input.getRenewalDate());
        existing.setBillingCycle(input.getBillingCycle());
        return repository.save(existing);
    }

    public void delete(Long id) { repository.delete(getById(id)); }

    public BigDecimal monthlyTotal() {
        return repository.findAll().stream()
            .map(s -> s.getBillingCycle() == BillingCycle.YEARLY
                ? s.getPrice().divide(BigDecimal.valueOf(12), 8, RoundingMode.HALF_UP)
                : s.getPrice())
            .reduce(BigDecimal.ZERO, BigDecimal::add)
            .setScale(2, RoundingMode.HALF_UP);
    }

    public List<Subscription> upcoming(int days) {
        LocalDate today = LocalDate.now();
        LocalDate end = today.plusDays(days);
        return repository.findAll().stream()
            .filter(s -> !s.getRenewalDate().isBefore(today) && !s.getRenewalDate().isAfter(end))
            .toList();
    }
}
