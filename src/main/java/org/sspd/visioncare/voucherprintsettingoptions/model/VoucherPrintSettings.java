package org.sspd.visioncare.voucherprintsettingoptions.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "voucher_print_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherPrintSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "paper_size", length = 30)
    private String paperSize = "A5";

    @Column(name = "paper_width_mm")
    private Integer paperWidthMm = 148;

    @Column(name = "paper_height_mm")
    private Integer paperHeightMm = 210;

    @Column(name = "margin_top_mm")
    private Integer marginTopMm = 10;

    @Column(name = "margin_right_mm")
    private Integer marginRightMm = 10;

    @Column(name = "margin_bottom_mm")
    private Integer marginBottomMm = 10;

    @Column(name = "margin_left_mm")
    private Integer marginLeftMm = 10;

    @Column(name = "primary_color", length = 30)
    private String primaryColor = "#354a88";

    @Column(name = "paper_color", length = 30)
    private String paperColor = "#fbf7dc";

    @Column(name = "show_logo")
    private Boolean showLogo = true;

    @Column(name = "show_clinic_name")
    private Boolean showClinicName = true;

    @Column(name = "show_address")
    private Boolean showAddress = true;

    @Column(name = "show_phone")
    private Boolean showPhone = true;

    @Column(name = "show_footer_notice")
    private Boolean showFooterNotice = true;

    @Column(name = "show_serial")
    private Boolean showSerial = true;

    @Column(name = "logo_width_px")
    private Integer logoWidthPx = 130;

    @Column(name = "header_font_size_px")
    private Integer headerFontSizePx = 20;

    @Column(name = "body_font_size_px")
    private Integer bodyFontSizePx = 13;

    @Column(name = "table_font_size_px")
    private Integer tableFontSizePx = 13;

    @Column(name = "contact_font_size_px")
    private Integer contactFontSizePx = 12;

    @Column(name = "amount_font_size_px")
    private Integer amountFontSizePx = 17;

    @Column(name = "eye_title_font_size_px")
    private Integer eyeTitleFontSizePx = 24;

    @Column(name = "footer_font_size_px")
    private Integer footerFontSizePx = 13;

    @Column(name = "serial_font_size_px")
    private Integer serialFontSizePx = 24;

    @Column(name = "line_height_px")
    private Integer lineHeightPx = 34;

    @Column(name = "voucher_title", length = 255)
    private String voucherTitle = "Eye Clinic Voucher";

    @Column(name = "name_label", length = 80)
    private String nameLabel = "Name";

    @Column(name = "frame_label", length = 80)
    private String frameLabel = "Frame";

    @Column(name = "lens_label", length = 80)
    private String lensLabel = "Lenss";

    @Column(name = "doctor_label", length = 80)
    private String doctorLabel = "Doctor";

    @Column(name = "date_label", length = 80)
    private String dateLabel = "Date";

    @Column(name = "measure_date_label", length = 120)
    private String measureDateLabel = "Measure Date";

    @Column(name = "measure_time_label", length = 120)
    private String measureTimeLabel = "Measure Time";

    @Column(name = "currency_label", length = 20)
    private String currencyLabel = "K.";

    @Lob
    @Column(name = "footer_notice", columnDefinition = "LONGTEXT")
    private String footerNotice = "Please bring this voucher when collecting glasses.";
}
