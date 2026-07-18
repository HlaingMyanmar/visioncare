package org.sspd.visioncare.orderoptions.mapper;

import java.util.List;
import org.springframework.stereotype.Component;
import org.sspd.visioncare.orderoptions.dto.OrderDTO;
import org.sspd.visioncare.orderoptions.model.OpticalOrder;
import org.sspd.visioncare.prescriptionoptions.dto.EyePrescriptionDTO;
import org.sspd.visioncare.prescriptionoptions.mapper.EyePrescriptionMapper;
import org.sspd.visioncare.prescriptionoptions.model.EyePrescription;

@Component
public class OrderMapper {

    private final EyePrescriptionMapper prescriptionMapper;

    public OrderMapper(EyePrescriptionMapper prescriptionMapper) {
        this.prescriptionMapper = prescriptionMapper;
    }

    public OrderDTO toDto(OpticalOrder entity) {
        if (entity == null) {
            return null;
        }
        OrderDTO dto = new OrderDTO();
        dto.setOrderId(entity.getOrderId());
        dto.setOrderCode(entity.getOrderCode());
        if (entity.getCustomer() != null) {
            dto.setCustomerId(entity.getCustomer().getCustomerId());
            dto.setCustomerName(entity.getCustomer().getName());
        }
        if (entity.getDoctor() != null) {
            dto.setDoctorId(entity.getDoctor().getDoctorId());
            dto.setDoctorName(entity.getDoctor().getName());
        }
        if (entity.getFrame() != null) {
            dto.setFrameCode(entity.getFrame().getFrameCode());
            dto.setFrameModel(entity.getFrame().getModel());
        }
        if (entity.getLens() != null) {
            dto.setLensCode(entity.getLens().getLensCode());
            dto.setLensType(entity.getLens().getType());
        }
        dto.setFramePrice(entity.getFramePrice());
        dto.setLensPrice(entity.getLensPrice());
        dto.setOrderDate(entity.getOrderDate());
        dto.setMeasureDate(entity.getMeasureDate());
        dto.setMeasureTime(entity.getMeasureTime());
        dto.setTotal(entity.getTotal());
        dto.setAdvance(entity.getAdvance());
        dto.setBalanceStatus(entity.getBalanceStatus());
        if (entity.getPrescriptions() != null) {
            List<EyePrescriptionDTO> prescriptions = entity.getPrescriptions().stream()
                    .map(prescriptionMapper::toDto)
                    .toList();
            dto.setPrescriptions(prescriptions);
        }
        return dto;
    }

    public OpticalOrder toEntity(OrderDTO dto) {
        OpticalOrder entity = new OpticalOrder();
        updateEntity(entity, dto);
        entity.setOrderId(dto.getOrderId());
        return entity;
    }

    public void updateEntity(OpticalOrder entity, OrderDTO dto) {
        entity.setOrderDate(dto.getOrderDate());
        entity.setMeasureDate(dto.getMeasureDate());
        entity.setMeasureTime(dto.getMeasureTime());
        if (dto.getFramePrice() != null) {
            entity.setFramePrice(dto.getFramePrice());
        }
        if (dto.getLensPrice() != null) {
            entity.setLensPrice(dto.getLensPrice());
        }
        entity.setTotal(dto.getTotal());
        entity.setAdvance(dto.getAdvance() == null ? 0 : dto.getAdvance());
        entity.setBalanceStatus(dto.getBalanceStatus());
    }

    public EyePrescription toPrescriptionEntity(EyePrescriptionDTO dto) {
        return prescriptionMapper.toEntity(dto);
    }
}
