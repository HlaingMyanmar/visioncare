package org.sspd.visioncare.lensoptions.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LensDTO {
    private String lensCode;
    private String type;
    private Integer price;
}
