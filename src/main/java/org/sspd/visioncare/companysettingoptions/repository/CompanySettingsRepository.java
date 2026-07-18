package org.sspd.visioncare.companysettingoptions.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.sspd.visioncare.companysettingoptions.model.CompanySettings;

@Repository
public interface CompanySettingsRepository extends JpaRepository<CompanySettings, Integer> {
}
