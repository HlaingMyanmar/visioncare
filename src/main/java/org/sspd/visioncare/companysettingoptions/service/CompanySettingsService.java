package org.sspd.visioncare.companysettingoptions.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.sspd.visioncare.companysettingoptions.dto.CompanySettingsDTO;
import org.sspd.visioncare.companysettingoptions.model.CompanySettings;
import org.sspd.visioncare.companysettingoptions.repository.CompanySettingsRepository;

@Service
@RequiredArgsConstructor
public class CompanySettingsService {

    private final CompanySettingsRepository repository;

    @Transactional
    public CompanySettingsDTO getSettings() {
        return toDto(getOrCreate());
    }

    @Transactional
    public CompanySettingsDTO saveSettings(CompanySettingsDTO dto) {
        CompanySettings settings = getOrCreate();
        settings.setCompanyName(hasText(dto.getCompanyName()) ? dto.getCompanyName().trim() : settings.getCompanyName());
        settings.setCompanyAddress(dto.getCompanyAddress());
        settings.setCompanyPhone(dto.getCompanyPhone());
        settings.setCompanyEmail(dto.getCompanyEmail());
        settings.setInvoiceTitle(hasText(dto.getInvoiceTitle()) ? dto.getInvoiceTitle().trim() : "Eye Clinic Voucher");
        settings.setFooterNote(dto.getFooterNote());
        settings.setTaglineMm(dto.getTaglineMm());
        settings.setLogoBase64(dto.getLogoBase64());
        settings.setVoucherConfigJson(dto.getVoucherConfigJson());
        if (dto.getOrderPrefix() != null) settings.setOrderPrefix(dto.getOrderPrefix().isBlank() ? "VC" : dto.getOrderPrefix().trim().toUpperCase());
        if (dto.getOrderDigits() != null && dto.getOrderDigits() >= 1 && dto.getOrderDigits() <= 10) settings.setOrderDigits(dto.getOrderDigits());
        return toDto(repository.save(settings));
    }

    private CompanySettings getOrCreate() {
        List<CompanySettings> all = repository.findAll();
        if (!all.isEmpty()) return all.get(0);
        return repository.save(CompanySettings.builder()
                .companyName("VisionCare")
                .companyAddress("")
                .companyPhone("")
                .companyEmail("")
                .invoiceTitle("Eye Clinic Voucher")
                .footerNote("Thank you")
                .taglineMm("")
                .orderPrefix("VC")
                .orderDigits(5)
                .build());
    }

    private CompanySettingsDTO toDto(CompanySettings settings) {
        CompanySettingsDTO dto = new CompanySettingsDTO();
        dto.setId(settings.getId());
        dto.setCompanyName(settings.getCompanyName());
        dto.setCompanyAddress(settings.getCompanyAddress());
        dto.setCompanyPhone(settings.getCompanyPhone());
        dto.setCompanyEmail(settings.getCompanyEmail());
        dto.setInvoiceTitle(settings.getInvoiceTitle());
        dto.setFooterNote(settings.getFooterNote());
        dto.setTaglineMm(settings.getTaglineMm());
        dto.setLogoBase64(settings.getLogoBase64());
        dto.setVoucherConfigJson(settings.getVoucherConfigJson());
        dto.setOrderPrefix(settings.getOrderPrefix() != null ? settings.getOrderPrefix() : "VC");
        dto.setOrderDigits(settings.getOrderDigits() != null ? settings.getOrderDigits() : 5);
        return dto;
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
