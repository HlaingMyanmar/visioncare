package org.sspd.visioncare.voucherprintsettingoptions.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.sspd.visioncare.voucherprintsettingoptions.model.VoucherPrintSettings;

public interface VoucherPrintSettingsRepository extends JpaRepository<VoucherPrintSettings, Integer> {
}
