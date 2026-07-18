package org.sspd.visioncare.frameoptions.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "frame")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Frame {

    @Id
    @Column(name = "frame_code", length = 30)
    private String frameCode;

    @Column(length = 100)
    private String model;

    @Column(nullable = false)
    private Integer price;
}
