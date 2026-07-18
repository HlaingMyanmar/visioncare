package org.sspd.visioncare.companysettingoptions.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.sspd.visioncare.api.ApiResponse;
import org.sspd.visioncare.companysettingoptions.dto.CompanySettingsDTO;
import org.sspd.visioncare.companysettingoptions.service.CompanySettingsService;

@RestController
@RequestMapping("/api/v1/company-settings")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CompanySettingsController {

    private final CompanySettingsService service;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasAuthority('CAN_ACCESS_COMPANY_SETTINGS_READ')")
    public ResponseEntity<ApiResponse<CompanySettingsDTO>> get() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Company settings", service.getSettings()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasAuthority('CAN_ACCESS_COMPANY_SETTINGS_UPDATE')")
    public ResponseEntity<ApiResponse<CompanySettingsDTO>> save(@RequestBody CompanySettingsDTO dto) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Saved", service.saveSettings(dto)));
    }
}
