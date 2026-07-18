package org.sspd.visioncare.rbacoptions.roleoptions.mapper;


import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;
import org.sspd.visioncare.rbacoptions.roleoptions.dto.RoleDTO;
import org.sspd.visioncare.rbacoptions.roleoptions.model.Role;

@Mapper(componentModel = "spring")
public interface RoleMapper {

    // Interface ကို တိုက်ရိုက်ခေါ်သုံးလို့ရအောင် လုပ်တာပါ
    RoleMapper INSTANCE =Mappers.getMapper(RoleMapper.class);

    // Entity -> DTO
    RoleDTO toDto(Role entity);

    // DTO -> Entity
    Role toEntity(RoleDTO dto);

    @Mapping(target = "id", ignore = true) // ID ကိုတော့ မပြင်အောင် ignore လုပ်ထားတာပါ
    void updateEntityFromDto(RoleDTO dto, @MappingTarget Role entity);

}

