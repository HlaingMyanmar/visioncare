package org.sspd.visioncare.lensoptions.mapper;

import org.springframework.stereotype.Component;
import org.sspd.visioncare.lensoptions.dto.LensDTO;
import org.sspd.visioncare.lensoptions.model.Lens;

@Component
public class LensMapper {

    public LensDTO toDto(Lens entity) {
        if (entity == null) {
            return null;
        }
        return new LensDTO(entity.getLensCode(), entity.getType(), entity.getPrice());
    }

    public Lens toEntity(LensDTO dto) {
        if (dto == null) {
            return null;
        }
        return new Lens(dto.getLensCode(), dto.getType(), dto.getPrice());
    }

    public void updateEntity(Lens entity, LensDTO dto) {
        entity.setType(dto.getType());
        entity.setPrice(dto.getPrice());
    }
}
