package com.steelfabpro.user.dto;

import lombok.Data;

@Data
public class AssignRoleRequest {
    private Long userId;
    private String roleName;
} 