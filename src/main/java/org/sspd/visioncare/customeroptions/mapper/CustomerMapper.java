package org.sspd.visioncare.customeroptions.mapper;

import org.springframework.stereotype.Component;
import org.sspd.visioncare.customeroptions.dto.CustomerDTO;
import org.sspd.visioncare.customeroptions.model.Customer;

@Component
public class CustomerMapper {

    public CustomerDTO toDto(Customer entity) {
        if (entity == null) {
            return null;
        }
        return new CustomerDTO(entity.getCustomerId(), entity.getName(), entity.getPhone());
    }

    public Customer toEntity(CustomerDTO dto) {
        if (dto == null) {
            return null;
        }
        return new Customer(dto.getCustomerId(), dto.getName(), dto.getPhone());
    }

    public void updateEntity(Customer entity, CustomerDTO dto) {
        entity.setName(dto.getName());
        entity.setPhone(dto.getPhone());
    }
}
