package org.sspd.visioncare.lensoptions.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "lens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Lens {

    @Id
    @Column(name = "lens_code", length = 30)
    private String lensCode;

    @Column(length = 100)
    private String type;

    @Column(nullable = false)
    private Integer price;
}
