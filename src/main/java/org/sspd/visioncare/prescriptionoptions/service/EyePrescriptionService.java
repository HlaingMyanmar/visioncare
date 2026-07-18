package org.sspd.visioncare.prescriptionoptions.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.sspd.visioncare.exceptionhandler.ResourceNotFoundException;
import org.sspd.visioncare.orderoptions.model.OpticalOrder;
import org.sspd.visioncare.orderoptions.repository.OrderRepository;
import org.sspd.visioncare.prescriptionoptions.dto.EyePrescriptionDTO;
import org.sspd.visioncare.prescriptionoptions.mapper.EyePrescriptionMapper;
import org.sspd.visioncare.prescriptionoptions.model.EyePrescription;
import org.sspd.visioncare.prescriptionoptions.repository.EyePrescriptionRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class EyePrescriptionService {

    private final EyePrescriptionRepository eyePrescriptionRepository;
    private final OrderRepository orderRepository;
    private final EyePrescriptionMapper eyePrescriptionMapper;

    public List<EyePrescriptionDTO> findAll() {
        return eyePrescriptionRepository.findAll().stream().map(eyePrescriptionMapper::toDto).toList();
    }

    public List<EyePrescriptionDTO> findByOrderId(Long orderId) {
        return eyePrescriptionRepository.findByOrderOrderId(orderId).stream().map(eyePrescriptionMapper::toDto).toList();
    }

    public EyePrescriptionDTO findById(Long id) {
        return eyePrescriptionMapper.toDto(getEntity(id));
    }

    public EyePrescriptionDTO create(EyePrescriptionDTO dto) {
        EyePrescription entity = eyePrescriptionMapper.toEntity(dto);
        entity.setOrder(resolveOrder(dto.getOrderId()));
        return eyePrescriptionMapper.toDto(eyePrescriptionRepository.save(entity));
    }

    public EyePrescriptionDTO update(Long id, EyePrescriptionDTO dto) {
        EyePrescription entity = getEntity(id);
        eyePrescriptionMapper.updateEntity(entity, dto);
        if (dto.getOrderId() != null) {
            entity.setOrder(resolveOrder(dto.getOrderId()));
        }
        return eyePrescriptionMapper.toDto(eyePrescriptionRepository.save(entity));
    }

    public void delete(Long id) {
        eyePrescriptionRepository.delete(getEntity(id));
    }

    private EyePrescription getEntity(Long id) {
        return eyePrescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with id: " + id));
    }

    private OpticalOrder resolveOrder(Long orderId) {
        if (orderId == null) {
            throw new ResourceNotFoundException("Order is required for prescription");
        }
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
    }
}
