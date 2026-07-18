package org.sspd.visioncare.orderoptions.controller;

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
import org.sspd.visioncare.orderoptions.dto.OrderDTO;
import org.sspd.visioncare.orderoptions.service.OrderService;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasAuthority('CAN_ACCESS_ORDER_READ')")
    public ResponseEntity<ApiResponse<List<OrderDTO>>> findAll() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Orders retrieved successfully", orderService.findAll()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasAuthority('CAN_ACCESS_ORDER_READ')")
    public ResponseEntity<ApiResponse<OrderDTO>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Order retrieved successfully", orderService.findById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasAuthority('CAN_ACCESS_ORDER_CREATE')")
    public ResponseEntity<ApiResponse<OrderDTO>> create(@RequestBody OrderDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(true, "Order created successfully", orderService.create(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasAuthority('CAN_ACCESS_ORDER_UPDATE')")
    public ResponseEntity<ApiResponse<OrderDTO>> update(@PathVariable Long id, @RequestBody OrderDTO dto) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Order updated successfully", orderService.update(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasAuthority('CAN_ACCESS_ORDER_DELETE')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        orderService.delete(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Order deleted successfully", null));
    }
}
