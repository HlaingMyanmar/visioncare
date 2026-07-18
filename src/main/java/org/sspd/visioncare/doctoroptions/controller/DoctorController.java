package org.sspd.visioncare.doctoroptions.controller;

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
import org.sspd.visioncare.doctoroptions.dto.DoctorDTO;
import org.sspd.visioncare.doctoroptions.service.DoctorService;

@RestController
@RequestMapping("/api/v1/doctors")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasAuthority('CAN_ACCESS_DOCTOR_READ')")
    public ResponseEntity<ApiResponse<List<DoctorDTO>>> findAll() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Doctors retrieved successfully", doctorService.findAll()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasAuthority('CAN_ACCESS_DOCTOR_READ')")
    public ResponseEntity<ApiResponse<DoctorDTO>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Doctor retrieved successfully", doctorService.findById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasAuthority('CAN_ACCESS_DOCTOR_CREATE')")
    public ResponseEntity<ApiResponse<DoctorDTO>> create(@RequestBody DoctorDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(true, "Doctor created successfully", doctorService.create(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasAuthority('CAN_ACCESS_DOCTOR_UPDATE')")
    public ResponseEntity<ApiResponse<DoctorDTO>> update(@PathVariable Long id, @RequestBody DoctorDTO dto) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Doctor updated successfully", doctorService.update(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasAuthority('CAN_ACCESS_DOCTOR_DELETE')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        doctorService.delete(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Doctor deleted successfully", null));
    }
}
