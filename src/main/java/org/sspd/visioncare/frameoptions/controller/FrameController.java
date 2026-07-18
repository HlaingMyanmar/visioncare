package org.sspd.visioncare.frameoptions.controller;

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
import org.sspd.visioncare.frameoptions.dto.FrameDTO;
import org.sspd.visioncare.frameoptions.service.FrameService;

@RestController
@RequestMapping("/api/v1/frames")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FrameController {

    private final FrameService frameService;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasAuthority('CAN_ACCESS_FRAME_READ')")
    public ResponseEntity<ApiResponse<List<FrameDTO>>> findAll() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Frames retrieved successfully", frameService.findAll()));
    }

    @GetMapping("/{code}")
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasAuthority('CAN_ACCESS_FRAME_READ')")
    public ResponseEntity<ApiResponse<FrameDTO>> findByCode(@PathVariable String code) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Frame retrieved successfully", frameService.findByCode(code)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasAuthority('CAN_ACCESS_FRAME_CREATE')")
    public ResponseEntity<ApiResponse<FrameDTO>> create(@RequestBody FrameDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(true, "Frame created successfully", frameService.create(dto)));
    }

    @PutMapping("/{code}")
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasAuthority('CAN_ACCESS_FRAME_UPDATE')")
    public ResponseEntity<ApiResponse<FrameDTO>> update(@PathVariable String code, @RequestBody FrameDTO dto) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Frame updated successfully", frameService.update(code, dto)));
    }

    @DeleteMapping("/{code}")
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasAuthority('CAN_ACCESS_FRAME_DELETE')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String code) {
        frameService.delete(code);
        return ResponseEntity.ok(new ApiResponse<>(true, "Frame deleted successfully", null));
    }
}
