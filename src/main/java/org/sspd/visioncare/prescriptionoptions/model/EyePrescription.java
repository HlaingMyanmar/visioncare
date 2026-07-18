package org.sspd.visioncare.prescriptionoptions.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.sspd.visioncare.orderoptions.model.OpticalOrder;
import org.sspd.visioncare.prescriptionoptions.enums.EyeSide;
import org.sspd.visioncare.prescriptionoptions.enums.UsageType;

@Entity
@Table(name = "eye_prescription")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EyePrescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "prescription_id")
    private Long prescriptionId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private OpticalOrder order;

    @Enumerated(EnumType.STRING)
    @Column(name = "eye_side", nullable = false, length = 2)
    private EyeSide eyeSide;

    @Enumerated(EnumType.STRING)
    @Column(name = "usage_type", nullable = false, length = 4)
    private UsageType usageType;

    @Column(precision = 4, scale = 2)
    private BigDecimal sph;

    @Column(precision = 4, scale = 2)
    private BigDecimal cyl;

    private Integer axis;
}
