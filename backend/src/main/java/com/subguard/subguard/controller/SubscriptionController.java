package com.subguard.subguard.controller;

import com.subguard.subguard.model.Subscription;
import com.subguard.subguard.service.SubscriptionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subscriptions")
@CrossOrigin(origins = "http://localhost:5173")
public class SubscriptionController {
    private final SubscriptionService service;

    public SubscriptionController(SubscriptionService service) { this.service = service; }

    @GetMapping
    public List<Subscription> getAll() { return service.getAll(); }

    @GetMapping("/{id}")
    public Subscription getOne(@PathVariable Long id) { return service.getById(id); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Subscription create(@Valid @RequestBody Subscription subscription) {
        return service.create(subscription);
    }

    @PutMapping("/{id}")
    public Subscription update(@PathVariable Long id, @Valid @RequestBody Subscription subscription) {
        return service.update(id, subscription);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { service.delete(id); }

    @GetMapping("/summary")
    public Map<String, BigDecimal> summary() { return Map.of("monthlyTotal", service.monthlyTotal()); }

    @GetMapping("/upcoming")
    public List<Subscription> upcoming(@RequestParam(defaultValue = "7") int days) {
        if (days < 0 || days > 365) throw new IllegalArgumentException("days must be between 0 and 365");
        return service.upcoming(days);
    }
}
