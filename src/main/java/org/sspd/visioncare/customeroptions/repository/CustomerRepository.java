package org.sspd.visioncare.customeroptions.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.sspd.visioncare.customeroptions.model.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
}
