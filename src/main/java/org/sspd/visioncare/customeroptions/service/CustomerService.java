package org.sspd.visioncare.customeroptions.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.sspd.visioncare.customeroptions.dto.CustomerDTO;
import org.sspd.visioncare.customeroptions.mapper.CustomerMapper;
import org.sspd.visioncare.customeroptions.model.Customer;
import org.sspd.visioncare.customeroptions.repository.CustomerRepository;
import org.sspd.visioncare.exceptionhandler.ResourceNotFoundException;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;

    public List<CustomerDTO> findAll() {
        return customerRepository.findAll().stream().map(customerMapper::toDto).toList();
    }

    public CustomerDTO findById(Long id) {
        return customerMapper.toDto(getEntity(id));
    }

    public CustomerDTO create(CustomerDTO dto) {
        return customerMapper.toDto(customerRepository.save(customerMapper.toEntity(dto)));
    }

    public CustomerDTO update(Long id, CustomerDTO dto) {
        Customer entity = getEntity(id);
        customerMapper.updateEntity(entity, dto);
        return customerMapper.toDto(customerRepository.save(entity));
    }

    public void delete(Long id) {
        customerRepository.delete(getEntity(id));
    }

    private Customer getEntity(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
    }
}
