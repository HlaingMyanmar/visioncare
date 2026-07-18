package org.sspd.visioncare.voucherprintsettingoptions.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.sspd.visioncare.voucherprintsettingoptions.dto.VoucherPrintSettingsDTO;
import org.sspd.visioncare.voucherprintsettingoptions.model.VoucherPrintSettings;
import org.sspd.visioncare.voucherprintsettingoptions.repository.VoucherPrintSettingsRepository;

@Service
@RequiredArgsConstructor
public class VoucherPrintSettingsService {

    private final VoucherPrintSettingsRepository repository;

    @Transactional
    public VoucherPrintSettingsDTO getSettings() {
        return toDto(getOrCreate());
    }

    @Transactional
    public VoucherPrintSettingsDTO saveSettings(VoucherPrintSettingsDTO dto) {
        VoucherPrintSettings settings = getOrCreate();
        settings.setPaperSize(text(dto.getPaperSize(), settings.getPaperSize()));
        settings.setPaperWidthMm(number(dto.getPaperWidthMm(), 60, 250, settings.getPaperWidthMm()));
        settings.setPaperHeightMm(number(dto.getPaperHeightMm(), 80, 350, settings.getPaperHeightMm()));
        settings.setMarginTopMm(number(dto.getMarginTopMm(), 0, 40, settings.getMarginTopMm()));
        settings.setMarginRightMm(number(dto.getMarginRightMm(), 0, 40, settings.getMarginRightMm()));
        settings.setMarginBottomMm(number(dto.getMarginBottomMm(), 0, 40, settings.getMarginBottomMm()));
        settings.setMarginLeftMm(number(dto.getMarginLeftMm(), 0, 40, settings.getMarginLeftMm()));
        settings.setPrimaryColor(text(dto.getPrimaryColor(), settings.getPrimaryColor()));
        settings.setPaperColor(text(dto.getPaperColor(), settings.getPaperColor()));
        settings.setShowLogo(bool(dto.getShowLogo(), settings.getShowLogo()));
        settings.setShowClinicName(bool(dto.getShowClinicName(), settings.getShowClinicName()));
        settings.setShowAddress(bool(dto.getShowAddress(), settings.getShowAddress()));
        settings.setShowPhone(bool(dto.getShowPhone(), settings.getShowPhone()));
        settings.setShowFooterNotice(bool(dto.getShowFooterNotice(), settings.getShowFooterNotice()));
        settings.setShowSerial(bool(dto.getShowSerial(), settings.getShowSerial()));
        settings.setLogoWidthPx(number(dto.getLogoWidthPx(), 60, 260, settings.getLogoWidthPx()));
        settings.setHeaderFontSizePx(number(dto.getHeaderFontSizePx(), 12, 36, settings.getHeaderFontSizePx()));
        settings.setBodyFontSizePx(number(dto.getBodyFontSizePx(), 10, 22, settings.getBodyFontSizePx()));
        settings.setTableFontSizePx(number(dto.getTableFontSizePx(), 10, 22, settings.getTableFontSizePx()));
        settings.setContactFontSizePx(number(dto.getContactFontSizePx(), 9, 22, fallback(settings.getContactFontSizePx(), 12)));
        settings.setAmountFontSizePx(number(dto.getAmountFontSizePx(), 10, 30, fallback(settings.getAmountFontSizePx(), 17)));
        settings.setEyeTitleFontSizePx(number(dto.getEyeTitleFontSizePx(), 14, 36, fallback(settings.getEyeTitleFontSizePx(), 24)));
        settings.setFooterFontSizePx(number(dto.getFooterFontSizePx(), 9, 22, fallback(settings.getFooterFontSizePx(), 13)));
        settings.setSerialFontSizePx(number(dto.getSerialFontSizePx(), 12, 40, fallback(settings.getSerialFontSizePx(), 24)));
        settings.setLineHeightPx(number(dto.getLineHeightPx(), 22, 56, settings.getLineHeightPx()));
        settings.setVoucherTitle(text(dto.getVoucherTitle(), settings.getVoucherTitle()));
        settings.setNameLabel(text(dto.getNameLabel(), settings.getNameLabel()));
        settings.setFrameLabel(text(dto.getFrameLabel(), settings.getFrameLabel()));
        settings.setLensLabel(text(dto.getLensLabel(), settings.getLensLabel()));
        settings.setDoctorLabel(text(dto.getDoctorLabel(), settings.getDoctorLabel()));
        settings.setDateLabel(text(dto.getDateLabel(), settings.getDateLabel()));
        settings.setMeasureDateLabel(text(dto.getMeasureDateLabel(), settings.getMeasureDateLabel()));
        settings.setMeasureTimeLabel(text(dto.getMeasureTimeLabel(), settings.getMeasureTimeLabel()));
        settings.setCurrencyLabel(text(dto.getCurrencyLabel(), settings.getCurrencyLabel()));
        settings.setFooterNotice(dto.getFooterNotice());
        return toDto(repository.save(settings));
    }

    @Transactional
    public VoucherPrintSettingsDTO resetSettings() {
        repository.deleteAll();
        return toDto(repository.save(defaultSettings()));
    }

    private VoucherPrintSettings getOrCreate() {
        List<VoucherPrintSettings> all = repository.findAll();
        if (!all.isEmpty()) return all.get(0);
        return repository.save(defaultSettings());
    }

    private VoucherPrintSettings defaultSettings() {
        return VoucherPrintSettings.builder()
                .paperSize("A5")
                .paperWidthMm(148)
                .paperHeightMm(210)
                .marginTopMm(10)
                .marginRightMm(10)
                .marginBottomMm(10)
                .marginLeftMm(10)
                .primaryColor("#354a88")
                .paperColor("#fbf7dc")
                .showLogo(true)
                .showClinicName(true)
                .showAddress(true)
                .showPhone(true)
                .showFooterNotice(true)
                .showSerial(true)
                .logoWidthPx(130)
                .headerFontSizePx(20)
                .bodyFontSizePx(13)
                .tableFontSizePx(13)
                .contactFontSizePx(12)
                .amountFontSizePx(17)
                .eyeTitleFontSizePx(24)
                .footerFontSizePx(13)
                .serialFontSizePx(24)
                .lineHeightPx(34)
                .voucherTitle("Eye Clinic Voucher")
                .nameLabel("Name")
                .frameLabel("Frame")
                .lensLabel("Lenss")
                .doctorLabel("Doctor")
                .dateLabel("Date")
                .measureDateLabel("Measure Date")
                .measureTimeLabel("Measure Time")
                .currencyLabel("K.")
                .footerNotice("Please bring this voucher when collecting glasses.")
                .build();
    }

    private VoucherPrintSettingsDTO toDto(VoucherPrintSettings settings) {
        VoucherPrintSettingsDTO dto = new VoucherPrintSettingsDTO();
        dto.setId(settings.getId());
        dto.setPaperSize(settings.getPaperSize());
        dto.setPaperWidthMm(settings.getPaperWidthMm());
        dto.setPaperHeightMm(settings.getPaperHeightMm());
        dto.setMarginTopMm(settings.getMarginTopMm());
        dto.setMarginRightMm(settings.getMarginRightMm());
        dto.setMarginBottomMm(settings.getMarginBottomMm());
        dto.setMarginLeftMm(settings.getMarginLeftMm());
        dto.setPrimaryColor(settings.getPrimaryColor());
        dto.setPaperColor(settings.getPaperColor());
        dto.setShowLogo(settings.getShowLogo());
        dto.setShowClinicName(settings.getShowClinicName());
        dto.setShowAddress(settings.getShowAddress());
        dto.setShowPhone(settings.getShowPhone());
        dto.setShowFooterNotice(settings.getShowFooterNotice());
        dto.setShowSerial(settings.getShowSerial());
        dto.setLogoWidthPx(settings.getLogoWidthPx());
        dto.setHeaderFontSizePx(settings.getHeaderFontSizePx());
        dto.setBodyFontSizePx(settings.getBodyFontSizePx());
        dto.setTableFontSizePx(settings.getTableFontSizePx());
        dto.setContactFontSizePx(fallback(settings.getContactFontSizePx(), 12));
        dto.setAmountFontSizePx(fallback(settings.getAmountFontSizePx(), 17));
        dto.setEyeTitleFontSizePx(fallback(settings.getEyeTitleFontSizePx(), 24));
        dto.setFooterFontSizePx(fallback(settings.getFooterFontSizePx(), 13));
        dto.setSerialFontSizePx(fallback(settings.getSerialFontSizePx(), 24));
        dto.setLineHeightPx(settings.getLineHeightPx());
        dto.setVoucherTitle(settings.getVoucherTitle());
        dto.setNameLabel(settings.getNameLabel());
        dto.setFrameLabel(settings.getFrameLabel());
        dto.setLensLabel(settings.getLensLabel());
        dto.setDoctorLabel(settings.getDoctorLabel());
        dto.setDateLabel(settings.getDateLabel());
        dto.setMeasureDateLabel(settings.getMeasureDateLabel());
        dto.setMeasureTimeLabel(settings.getMeasureTimeLabel());
        dto.setCurrencyLabel(settings.getCurrencyLabel());
        dto.setFooterNotice(settings.getFooterNotice());
        return dto;
    }

    private String text(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }

    private Boolean bool(Boolean value, Boolean fallback) {
        return value == null ? fallback : value;
    }

    private Integer fallback(Integer value, int fallback) {
        return value == null ? fallback : value;
    }

    private Integer number(Integer value, int min, int max, Integer fallback) {
        if (value == null) return fallback;
        return Math.min(max, Math.max(min, value));
    }
}
