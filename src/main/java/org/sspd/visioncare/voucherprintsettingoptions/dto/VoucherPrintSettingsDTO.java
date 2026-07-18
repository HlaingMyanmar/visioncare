package org.sspd.visioncare.voucherprintsettingoptions.dto;

import lombok.Data;

@Data
public class VoucherPrintSettingsDTO {
    private Integer id;
    private String paperSize;
    private Integer paperWidthMm;
    private Integer paperHeightMm;
    private Integer marginTopMm;
    private Integer marginRightMm;
    private Integer marginBottomMm;
    private Integer marginLeftMm;
    private String primaryColor;
    private String paperColor;
    private Boolean showLogo;
    private Boolean showClinicName;
    private Boolean showAddress;
    private Boolean showPhone;
    private Boolean showFooterNotice;
    private Boolean showSerial;
    private Integer logoWidthPx;
    private Integer headerFontSizePx;
    private Integer bodyFontSizePx;
    private Integer tableFontSizePx;
    private Integer contactFontSizePx;
    private Integer amountFontSizePx;
    private Integer eyeTitleFontSizePx;
    private Integer footerFontSizePx;
    private Integer serialFontSizePx;
    private Integer lineHeightPx;
    private String voucherTitle;
    private String nameLabel;
    private String frameLabel;
    private String lensLabel;
    private String doctorLabel;
    private String dateLabel;
    private String measureDateLabel;
    private String measureTimeLabel;
    private String currencyLabel;
    private String footerNotice;
}
