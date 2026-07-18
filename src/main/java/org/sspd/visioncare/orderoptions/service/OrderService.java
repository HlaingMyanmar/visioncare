package org.sspd.visioncare.orderoptions.service;

import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.sspd.visioncare.customeroptions.repository.CustomerRepository;
import org.sspd.visioncare.doctoroptions.repository.DoctorRepository;
import org.sspd.visioncare.exceptionhandler.ResourceNotFoundException;
import org.sspd.visioncare.frameoptions.repository.FrameRepository;
import org.sspd.visioncare.lensoptions.repository.LensRepository;
import org.sspd.visioncare.orderoptions.dto.OrderDTO;
import org.sspd.visioncare.orderoptions.mapper.OrderMapper;
import org.sspd.visioncare.orderoptions.model.OpticalOrder;
import org.sspd.visioncare.orderoptions.repository.OrderRepository;
import org.sspd.visioncare.prescriptionoptions.dto.EyePrescriptionDTO;
import org.sspd.visioncare.prescriptionoptions.model.EyePrescription;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final DoctorRepository doctorRepository;
    private final FrameRepository frameRepository;
    private final LensRepository lensRepository;
    private final OrderMapper orderMapper;

    public List<OrderDTO> findAll() {
        List<OpticalOrder> orders = orderRepository.findAll();
        ensureOrderCodes(orders);
        ensurePriceSnapshots(orders);
        return orders.stream().map(orderMapper::toDto).toList();
    }

    public OrderDTO findById(Long id) {
        OpticalOrder entity = getEntity(id);
        ensureOrderCode(entity);
        ensurePriceSnapshot(entity);
        return orderMapper.toDto(entity);
    }

    public OrderDTO create(OrderDTO dto) {
        ensureOrderCodes(orderRepository.findAll());
        OpticalOrder entity = orderMapper.toEntity(dto);
        entity.setOrderCode(nextOrderCode());
        applyRelations(entity, dto, true);
        applyPriceSnapshots(entity, dto, true);
        syncPrescriptions(entity, dto.getPrescriptions());
        return orderMapper.toDto(orderRepository.save(entity));
    }

    public OrderDTO update(Long id, OrderDTO dto) {
        OpticalOrder entity = getEntity(id);
        ensureOrderCode(entity);
        orderMapper.updateEntity(entity, dto);
        applyRelations(entity, dto, false);
        applyPriceSnapshots(entity, dto, false);
        if (dto.getPrescriptions() != null) {
            syncPrescriptions(entity, dto.getPrescriptions());
        }
        return orderMapper.toDto(orderRepository.save(entity));
    }

    public void delete(Long id) {
        orderRepository.delete(getEntity(id));
    }

    private OpticalOrder getEntity(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
    }

    private void applyRelations(OpticalOrder entity, OrderDTO dto, boolean creating) {
        if (dto.getCustomerId() == null && creating) {
            throw new ResourceNotFoundException("Customer is required for order");
        }
        if (dto.getCustomerId() != null) {
            entity.setCustomer(customerRepository.findById(dto.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + dto.getCustomerId())));
        }
        entity.setDoctor(dto.getDoctorId() == null ? null : doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + dto.getDoctorId())));
        entity.setFrame(dto.getFrameCode() == null || dto.getFrameCode().isBlank() ? null : frameRepository.findById(dto.getFrameCode())
                .orElseThrow(() -> new ResourceNotFoundException("Frame not found with code: " + dto.getFrameCode())));
        entity.setLens(dto.getLensCode() == null || dto.getLensCode().isBlank() ? null : lensRepository.findById(dto.getLensCode())
                .orElseThrow(() -> new ResourceNotFoundException("Lens not found with code: " + dto.getLensCode())));
    }

    private void applyPriceSnapshots(OpticalOrder entity, OrderDTO dto, boolean creating) {
        if (dto.getFramePrice() != null) {
            entity.setFramePrice(dto.getFramePrice());
        } else if (creating || entity.getFramePrice() == null) {
            entity.setFramePrice(entity.getFrame() == null ? 0 : entity.getFrame().getPrice());
        }

        if (dto.getLensPrice() != null) {
            entity.setLensPrice(dto.getLensPrice());
        } else if (creating || entity.getLensPrice() == null) {
            entity.setLensPrice(entity.getLens() == null ? 0 : entity.getLens().getPrice());
        }

        if (dto.getTotal() == null) {
            entity.setTotal((entity.getFramePrice() == null ? 0 : entity.getFramePrice()) + (entity.getLensPrice() == null ? 0 : entity.getLensPrice()));
        }
    }

    private void ensurePriceSnapshots(List<OpticalOrder> orders) {
        List<OpticalOrder> missing = orders.stream()
                .filter(order -> order.getFramePrice() == null || order.getLensPrice() == null)
                .toList();
        missing.forEach(this::fillMissingPriceSnapshot);
        if (!missing.isEmpty()) {
            orderRepository.saveAll(missing);
        }
    }

    private void ensurePriceSnapshot(OpticalOrder order) {
        if (order.getFramePrice() != null && order.getLensPrice() != null) {
            return;
        }
        fillMissingPriceSnapshot(order);
        orderRepository.save(order);
    }

    private void fillMissingPriceSnapshot(OpticalOrder order) {
        if (order.getFramePrice() == null) {
            order.setFramePrice(order.getFrame() == null ? 0 : order.getFrame().getPrice());
        }
        if (order.getLensPrice() == null) {
            order.setLensPrice(order.getLens() == null ? 0 : order.getLens().getPrice());
        }
    }

    private void syncPrescriptions(OpticalOrder order, List<EyePrescriptionDTO> prescriptionDtos) {
        order.getPrescriptions().clear();
        if (prescriptionDtos == null) {
            return;
        }
        for (EyePrescriptionDTO dto : prescriptionDtos) {
            EyePrescription prescription = orderMapper.toPrescriptionEntity(dto);
            prescription.setOrder(order);
            order.getPrescriptions().add(prescription);
        }
    }

    private synchronized void ensureOrderCodes(List<OpticalOrder> orders) {
        Set<String> usedCodes = new HashSet<>();
        orders.stream()
                .map(OpticalOrder::getOrderCode)
                .filter(this::isValidOrderCode)
                .forEach(usedCodes::add);

        List<OpticalOrder> missing = orders.stream()
                .filter(order -> !isValidOrderCode(order.getOrderCode()))
                .sorted(Comparator.comparing(OpticalOrder::getOrderId, Comparator.nullsLast(Long::compareTo)))
                .toList();

        for (OpticalOrder order : missing) {
            int preferred = order.getOrderId() == null ? 0 : order.getOrderId().intValue();
            String code = preferred >= 1 && preferred <= 9999 ? formatOrderCode(preferred) : null;
            if (code == null || usedCodes.contains(code)) {
                code = nextAvailableOrderCode(usedCodes);
            }
            order.setOrderCode(code);
            usedCodes.add(code);
        }
        if (!missing.isEmpty()) {
            orderRepository.saveAll(missing);
        }
    }

    private synchronized void ensureOrderCode(OpticalOrder order) {
        if (isValidOrderCode(order.getOrderCode())) {
            return;
        }
        ensureOrderCodes(orderRepository.findAll());
    }

    private synchronized String nextOrderCode() {
        Set<String> usedCodes = new HashSet<>();
        orderRepository.findAll().stream()
                .map(OpticalOrder::getOrderCode)
                .filter(this::isValidOrderCode)
                .forEach(usedCodes::add);
        return nextAvailableOrderCode(usedCodes);
    }

    private String nextAvailableOrderCode(Set<String> usedCodes) {
        for (int number = 1; number <= 9999; number++) {
            String candidate = formatOrderCode(number);
            if (!usedCodes.contains(candidate) && !orderRepository.existsByOrderCode(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException("Order code range 0001-9999 is full");
    }

    private String formatOrderCode(int number) {
        return String.format("%04d", number);
    }

    private boolean isValidOrderCode(String code) {
        return code != null && code.matches("\\d{4}");
    }
}