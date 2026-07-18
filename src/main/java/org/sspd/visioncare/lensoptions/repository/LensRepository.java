package org.sspd.visioncare.lensoptions.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.sspd.visioncare.lensoptions.model.Lens;

public interface LensRepository extends JpaRepository<Lens, String> {
}
