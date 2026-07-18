package org.sspd.visioncare.doctoroptions.mapper;

import org.springframework.stereotype.Component;
import org.sspd.visioncare.doctoroptions.dto.DoctorDTO;
import org.sspd.visioncare.doctoroptions.model.Doctor;

@Component
public class DoctorMapper {

    public DoctorDTO toDto(Doctor entity) {
        if (entity == null) {
            return null;
        }
        return new DoctorDTO(entity.getDoctorId(), entity.getName());
    }

    public Doctor toEntity(DoctorDTO dto) {
        if (dto == null) {
            return null;
        }
        return new Doctor(dto.getDoctorId(), dto.getName());
    }

    public void updateEntity(Doctor entity, DoctorDTO dto) {
        entity.setName(dto.getName());
    }
}
