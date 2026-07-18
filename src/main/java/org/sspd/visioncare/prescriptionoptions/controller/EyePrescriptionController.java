package org.sspd.visioncare.prescriptionoptions.controller;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.sspd.visioncare.api.ApiResponse;
import org.sspd.visioncare.prescriptionoptions.dto.EyePrescriptionDTO;
import org.sspd.visioncare.prescriptionoptions.service.EyePrescriptionService;

@RestController
@RequestMapping("/api/v1/prescriptions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EyePrescriptionController {

    private final EyePrescriptionService eyePrescriptionService;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasAuthority('CAN_ACCESS_PRESCRIPTION_READ')")
    public ResponseEntity<ApiResponse<List<EyePrescriptionDTO>>> findAll(@RequestParam(required = false) Long orderId) {
        List<EyePrescriptionDTO> data = orderId == null ? eyePrescriptionService.findAll() : eyePrescriptionService.findByOrderId(orderId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Prescriptions retrieved successfully", data));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasAuthority('CAN_ACCESS_PRESCRIPTION_READ')")
    public ResponseEntity<ApiResponse<EyePrescriptionDTO>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Prescription retrieved successfully", eyePrescriptionService.findById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasAuthority('CAN_ACCESS_PRESCRIPTION_CREATE')")
    public ResponseEntity<ApiResponse<EyePrescriptionDTO>> create(@RequestBody EyePrescriptionDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(true, "Prescription created successfully", eyePrescriptionService.create(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasAuthority('CAN_ACCESS_PRESCRIPTION_UPDATE')")
    public ResponseEntity<ApiResponse<EyePrescriptionDTO>> update(@PathVariable Long id, @RequestBody EyePrescriptionDTO dto) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Prescription updated successfully", eyePrescriptionService.update(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasAuthority('CAN_ACCESS_PRESCRIPTION_DELETE')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        eyePrescriptionService.delete(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Prescription deleted successfully", null));
    }
}
