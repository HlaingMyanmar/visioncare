package org.sspd.visioncare.frameoptions.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.sspd.visioncare.exceptionhandler.ResourceNotFoundException;
import org.sspd.visioncare.frameoptions.dto.FrameDTO;
import org.sspd.visioncare.frameoptions.mapper.FrameMapper;
import org.sspd.visioncare.frameoptions.model.Frame;
import org.sspd.visioncare.frameoptions.repository.FrameRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class FrameService {

    private final FrameRepository frameRepository;
    private final FrameMapper frameMapper;

    public List<FrameDTO> findAll() {
        return frameRepository.findAll().stream().map(frameMapper::toDto).toList();
    }

    public FrameDTO findByCode(String code) {
        return frameMapper.toDto(getEntity(code));
    }

    public FrameDTO create(FrameDTO dto) {
        return frameMapper.toDto(frameRepository.save(frameMapper.toEntity(dto)));
    }

    public FrameDTO update(String code, FrameDTO dto) {
        Frame entity = getEntity(code);
        frameMapper.updateEntity(entity, dto);
        return frameMapper.toDto(frameRepository.save(entity));
    }

    public void delete(String code) {
        frameRepository.delete(getEntity(code));
    }

    private Frame getEntity(String code) {
        return frameRepository.findById(code)
                .orElseThrow(() -> new ResourceNotFoundException("Frame not found with code: " + code));
    }
}
