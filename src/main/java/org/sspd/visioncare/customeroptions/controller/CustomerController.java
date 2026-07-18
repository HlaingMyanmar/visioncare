package org.sspd.visioncare.customeroptions.controller;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.sspd.visioncare.api.ApiResponse;
import org.sspd.visioncare.customeroptions.dto.CustomerDTO;
import org.sspd.visioncare.customeroptions.service.CustomerService;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasAuthority('CAN_ACCESS_CUSTOMER_READ')")
    public ResponseEntity<ApiResponse<List<CustomerDTO>>> findAll() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Customers retrieved successfully", customerService.findAll()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasAuthority('CAN_ACCESS_CUSTOMER_READ')")
    public ResponseEntity<ApiResponse<CustomerDTO>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Customer retrieved successfully", customerService.findById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasAuthority('CAN_ACCESS_CUSTOMER_CREATE')")
    public ResponseEntity<ApiResponse<CustomerDTO>> create(@RequestBody CustomerDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(true, "Customer created successfully", customerService.create(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasAuthority('CAN_ACCESS_CUSTOMER_UPDATE')")
    public ResponseEntity<ApiResponse<CustomerDTO>> update(@PathVariable Long id, @RequestBody CustomerDTO dto) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Customer updated successfully", customerService.update(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasAuthority('CAN_ACCESS_CUSTOMER_DELETE')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        customerService.delete(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Customer deleted successfully", null));
    }
}
