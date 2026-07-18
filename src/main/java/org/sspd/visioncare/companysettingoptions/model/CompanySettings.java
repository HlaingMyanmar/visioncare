package org.sspd.visioncare.companysettingoptions.model;

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
@Table(name = "company_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanySettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "company_name", nullable = false, length = 255)
    private String companyName = "VisionCare";

    @Column(name = "company_address", length = 1000)
    private String companyAddress;

    @Column(name = "company_phone", length = 100)
    private String companyPhone;

    @Column(name = "company_email", length = 150)
    private String companyEmail;

    @Column(name = "invoice_title", length = 255)
    private String invoiceTitle = "Eye Clinic Voucher";

    @Column(name = "footer_note", length = 500)
    private String footerNote = "Thank you";

    @Column(name = "tagline_mm", length = 255)
    private String taglineMm;

    @Lob
    @Column(name = "logo_base64", columnDefinition = "LONGTEXT")
    private String logoBase64;

    @Lob
    @Column(name = "voucher_config_json", columnDefinition = "LONGTEXT")
    private String voucherConfigJson;

    @Column(name = "order_prefix", length = 20)
    private String orderPrefix = "VC";

    @Column(name = "order_digits")
    private Integer orderDigits = 5;
}
