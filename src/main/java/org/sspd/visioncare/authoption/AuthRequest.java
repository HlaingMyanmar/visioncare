package org.sspd.visioncare.authoption;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
class AuthRequest {
    private String usernameOremail;
    private String password;

}

