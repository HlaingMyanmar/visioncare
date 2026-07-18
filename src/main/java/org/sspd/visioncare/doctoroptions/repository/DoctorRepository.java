package org.sspd.visioncare.doctoroptions.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.sspd.visioncare.doctoroptions.model.Doctor;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
}
