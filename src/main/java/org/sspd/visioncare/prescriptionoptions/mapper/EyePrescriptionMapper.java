package org.sspd.visioncare.prescriptionoptions.mapper;

import org.springframework.stereotype.Component;
import org.sspd.visioncare.prescriptionoptions.dto.EyePrescriptionDTO;
import org.sspd.visioncare.prescriptionoptions.model.EyePrescription;

@Component
public class EyePrescriptionMapper {

    public EyePrescriptionDTO toDto(EyePrescription entity) {
        if (entity == null) {
            return null;
        }
        Long orderId = entity.getOrder() == null ? null : entity.getOrder().getOrderId();
        return new EyePrescriptionDTO(
                entity.getPrescriptionId(),
                orderId,
                entity.getEyeSide(),
                entity.getUsageType(),
                entity.getSph(),
                entity.getCyl(),
                entity.getAxis()
        );
    }

    public EyePrescription toEntity(EyePrescriptionDTO dto) {
        if (dto == null) {
            return null;
        }
        EyePrescription entity = new EyePrescription();
        updateEntity(entity, dto);
        entity.setPrescriptionId(dto.getPrescriptionId());
        return entity;
    }

    public void updateEntity(EyePrescription entity, EyePrescriptionDTO dto) {
        entity.setEyeSide(dto.getEyeSide());
        entity.setUsageType(dto.getUsageType());
        entity.setSph(dto.getSph());
        entity.setCyl(dto.getCyl());
        entity.setAxis(dto.getAxis());
    }
}
