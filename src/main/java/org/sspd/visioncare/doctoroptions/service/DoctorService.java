package org.sspd.visioncare.doctoroptions.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.sspd.visioncare.doctoroptions.dto.DoctorDTO;
import org.sspd.visioncare.doctoroptions.mapper.DoctorMapper;
import org.sspd.visioncare.doctoroptions.model.Doctor;
import org.sspd.visioncare.doctoroptions.repository.DoctorRepository;
import org.sspd.visioncare.exceptionhandler.ResourceNotFoundException;

@Service
@RequiredArgsConstructor
@Transactional
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final DoctorMapper doctorMapper;

    public List<DoctorDTO> findAll() {
        return doctorRepository.findAll().stream().map(doctorMapper::toDto).toList();
    }

    public DoctorDTO findById(Long id) {
        return doctorMapper.toDto(getEntity(id));
    }

    public DoctorDTO create(DoctorDTO dto) {
        return doctorMapper.toDto(doctorRepository.save(doctorMapper.toEntity(dto)));
    }

    public DoctorDTO update(Long id, DoctorDTO dto) {
        Doctor entity = getEntity(id);
        doctorMapper.updateEntity(entity, dto);
        return doctorMapper.toDto(doctorRepository.save(entity));
    }

    public void delete(Long id) {
        doctorRepository.delete(getEntity(id));
    }

    private Doctor getEntity(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + id));
    }
}
