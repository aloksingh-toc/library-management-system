package com.lms.library_system.service;

import com.lms.library_system.dto.AuthResponse;
import com.lms.library_system.dto.LoginRequest;
import com.lms.library_system.dto.RegisterRequest;
import com.lms.library_system.entity.Role;
import com.lms.library_system.entity.User;
import com.lms.library_system.exception.ApiException;
import com.lms.library_system.repository.UserRepository;
import com.lms.library_system.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null") // Spring Data JPA methods lack null annotations; safe by contract
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw ApiException.conflict("Email is already registered");
        }

        var user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();

        userRepository.save(user);
        String jwtToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (BadCredentialsException ex) {
            throw ApiException.badRequest("Invalid email or password");
        }

        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> ApiException.notFound("User not found"));

        String jwtToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}
