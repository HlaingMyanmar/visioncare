package org.sspd.visioncare.orderoptions.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.sspd.visioncare.orderoptions.model.OpticalOrder;

public interface OrderRepository extends JpaRepository<OpticalOrder, Long> {
    boolean existsByOrderCode(String orderCode);

    @Query("select max(o.orderCode) from OpticalOrder o where o.orderCode is not null")
    Optional<String> findMaxOrderCode();
}