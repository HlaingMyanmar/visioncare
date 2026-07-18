package org.sspd.visioncare.prescriptionoptions.dto;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.sspd.visioncare.prescriptionoptions.enums.EyeSide;
import org.sspd.visioncare.prescriptionoptions.enums.UsageType;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EyePrescriptionDTO {
    private Long prescriptionId;
    private Long orderId;
    private EyeSide eyeSide;
    private UsageType usageType;
    private BigDecimal sph;
    private BigDecimal cyl;
    private Integer axis;
}
