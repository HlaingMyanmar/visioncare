package org.sspd.visioncare.lensoptions.controller;

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
import org.sspd.visioncare.lensoptions.dto.LensDTO;
import org.sspd.visioncare.lensoptions.service.LensService;

@RestController
@RequestMapping("/api/v1/lenses")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LensController {

    private final LensService lensService;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasAuthority('CAN_ACCESS_LENS_READ')")
    public ResponseEntity<ApiResponse<List<LensDTO>>> findAll() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Lenses retrieved successfully", lensService.findAll()));
    }

    @GetMapping("/{code}")
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasAuthority('CAN_ACCESS_LENS_READ')")
    public ResponseEntity<ApiResponse<LensDTO>> findByCode(@PathVariable String code) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Lens retrieved successfully", lensService.findByCode(code)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasAuthority('CAN_ACCESS_LENS_CREATE')")
    public ResponseEntity<ApiResponse<LensDTO>> create(@RequestBody LensDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(true, "Lens created successfully", lensService.create(dto)));
    }

    @PutMapping("/{code}")
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasAuthority('CAN_ACCESS_LENS_UPDATE')")
    public ResponseEntity<ApiResponse<LensDTO>> update(@PathVariable String code, @RequestBody LensDTO dto) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Lens updated successfully", lensService.update(code, dto)));
    }

    @DeleteMapping("/{code}")
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasAuthority('CAN_ACCESS_LENS_DELETE')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String code) {
        lensService.delete(code);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lens deleted successfully", null));
    }
}
