package org.sspd.visioncare.lensoptions.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.sspd.visioncare.exceptionhandler.ResourceNotFoundException;
import org.sspd.visioncare.lensoptions.dto.LensDTO;
import org.sspd.visioncare.lensoptions.mapper.LensMapper;
import org.sspd.visioncare.lensoptions.model.Lens;
import org.sspd.visioncare.lensoptions.repository.LensRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class LensService {

    private final LensRepository lensRepository;
    private final LensMapper lensMapper;

    public List<LensDTO> findAll() {
        return lensRepository.findAll().stream().map(lensMapper::toDto).toList();
    }

    public LensDTO findByCode(String code) {
        return lensMapper.toDto(getEntity(code));
    }

    public LensDTO create(LensDTO dto) {
        return lensMapper.toDto(lensRepository.save(lensMapper.toEntity(dto)));
    }

    public LensDTO update(String code, LensDTO dto) {
        Lens entity = getEntity(code);
        lensMapper.updateEntity(entity, dto);
        return lensMapper.toDto(lensRepository.save(entity));
    }

    public void delete(String code) {
        lensRepository.delete(getEntity(code));
    }

    private Lens getEntity(String code) {
        return lensRepository.findById(code)
                .orElseThrow(() -> new ResourceNotFoundException("Lens not found with code: " + code));
    }
}
