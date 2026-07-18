package org.sspd.visioncare.orderoptions.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.sspd.visioncare.prescriptionoptions.dto.EyePrescriptionDTO;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {
    private Long orderId;
    private String orderCode;
    private Long customerId;
    private String customerName;
    private Long doctorId;
    private String doctorName;
    private String frameCode;
    private String frameModel;
    private Integer framePrice;
    private String lensCode;
    private String lensType;
    private Integer lensPrice;
    private LocalDate orderDate;
    private LocalDate measureDate;
    private LocalTime measureTime;
    private Integer total;
    private Integer advance;
    private String balanceStatus;
    private List<EyePrescriptionDTO> prescriptions;
}
