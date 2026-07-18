package org.sspd.visioncare.frameoptions.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FrameDTO {
    private String frameCode;
    private String model;
    private Integer price;
}
