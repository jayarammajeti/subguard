package com.subguard.subguard.service;

import com.subguard.subguard.model.BillingCycle;
import com.subguard.subguard.model.Subscription;
import com.subguard.subguard.repository.SubscriptionRepository;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class SubscriptionServiceTest {
    @Test
    void monthlyTotalConvertsYearlySubscriptions() {
        SubscriptionRepository repository = mock(SubscriptionRepository.class);
        Subscription monthly = new Subscription();
        monthly.setPrice(new BigDecimal("10.00"));
        monthly.setBillingCycle(BillingCycle.MONTHLY);
        Subscription yearly = new Subscription();
        yearly.setPrice(new BigDecimal("120.00"));
        yearly.setBillingCycle(BillingCycle.YEARLY);
        when(repository.findAll()).thenReturn(List.of(monthly, yearly));

        assertEquals(new BigDecimal("20.00"), new SubscriptionService(repository).monthlyTotal());
    }
}
