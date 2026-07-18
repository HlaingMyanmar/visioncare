package org.sspd.visioncare.orderoptions.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.sspd.visioncare.customeroptions.model.Customer;
import org.sspd.visioncare.doctoroptions.model.Doctor;
import org.sspd.visioncare.frameoptions.model.Frame;
import org.sspd.visioncare.lensoptions.model.Lens;
import org.sspd.visioncare.prescriptionoptions.model.EyePrescription;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OpticalOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "order_code", length = 4, unique = true)
    private String orderCode;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "frame_code")
    private Frame frame;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lens_code")
    private Lens lens;

    @Column(name = "frame_price")
    private Integer framePrice;

    @Column(name = "lens_price")
    private Integer lensPrice;

    @Column(name = "order_date", nullable = false)
    private LocalDate orderDate;

    @Column(name = "measure_date")
    private LocalDate measureDate;

    @Column(name = "measure_time")
    private LocalTime measureTime;

    private Integer total;

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer advance = 0;

    @Column(name = "balance_status", length = 20)
    private String balanceStatus;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EyePrescription> prescriptions = new ArrayList<>();
}
