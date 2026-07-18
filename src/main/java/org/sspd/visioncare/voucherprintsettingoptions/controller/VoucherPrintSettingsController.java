package org.sspd.visioncare.voucherprintsettingoptions.controller;

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
import org.sspd.visioncare.voucherprintsettingoptions.dto.VoucherPrintSettingsDTO;
import org.sspd.visioncare.voucherprintsettingoptions.service.VoucherPrintSettingsService;

@RestController
@RequestMapping("/api/v1/voucher-print-settings")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class VoucherPrintSettingsController {

    private final VoucherPrintSettingsService service;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasAuthority('CAN_ACCESS_VOUCHER_PRINT_SETTINGS_READ')")
    public ResponseEntity<ApiResponse<VoucherPrintSettingsDTO>> get() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Voucher print settings", service.getSettings()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasAuthority('CAN_ACCESS_VOUCHER_PRINT_SETTINGS_UPDATE')")
    public ResponseEntity<ApiResponse<VoucherPrintSettingsDTO>> save(@RequestBody VoucherPrintSettingsDTO dto) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Saved", service.saveSettings(dto)));
    }

    @PostMapping("/reset")
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasAuthority('CAN_ACCESS_VOUCHER_PRINT_SETTINGS_UPDATE')")
    public ResponseEntity<ApiResponse<VoucherPrintSettingsDTO>> reset() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Reset", service.resetSettings()));
    }
}
