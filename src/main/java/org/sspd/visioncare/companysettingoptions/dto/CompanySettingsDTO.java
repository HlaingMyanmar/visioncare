package org.sspd.visioncare.companysettingoptions.dto;

import lombok.Data;

@Data
public class CompanySettingsDTO {
    private Integer id;
    private String companyName;
    private String companyAddress;
    private String companyPhone;
    private String companyEmail;
    private String invoiceTitle;
    private String footerNote;
    private String taglineMm;
    private String logoBase64;
    private String voucherConfigJson;
    private String orderPrefix;
    private Integer orderDigits;
}
