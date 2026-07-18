package org.sspd.visioncare.prescriptionoptions.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.sspd.visioncare.prescriptionoptions.model.EyePrescription;

public interface EyePrescriptionRepository extends JpaRepository<EyePrescription, Long> {
    List<EyePrescription> findByOrderOrderId(Long orderId);
}
