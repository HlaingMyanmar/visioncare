package org.sspd.visioncare.frameoptions.mapper;

import org.springframework.stereotype.Component;
import org.sspd.visioncare.frameoptions.dto.FrameDTO;
import org.sspd.visioncare.frameoptions.model.Frame;

@Component
public class FrameMapper {

    public FrameDTO toDto(Frame entity) {
        if (entity == null) {
            return null;
        }
        return new FrameDTO(entity.getFrameCode(), entity.getModel(), entity.getPrice());
    }

    public Frame toEntity(FrameDTO dto) {
        if (dto == null) {
            return null;
        }
        return new Frame(dto.getFrameCode(), dto.getModel(), dto.getPrice());
    }

    public void updateEntity(Frame entity, FrameDTO dto) {
        entity.setModel(dto.getModel());
        entity.setPrice(dto.getPrice());
    }
}
