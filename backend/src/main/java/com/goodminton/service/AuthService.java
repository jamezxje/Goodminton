package com.goodminton.service;

import com.goodminton.dto.request.LoginRequest;
import com.goodminton.dto.response.LoginResponse;
import com.goodminton.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authManager;
    private final JwtUtils jwtUtils;

    public LoginResponse login(LoginRequest request) {
        Authentication auth = authManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.username(), request.password()));
        String token = jwtUtils.generateToken(auth.getName());
        return new LoginResponse(token);
    }
}
