package com.steelfabpro.project.security;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class StubUserDetailsService implements UserDetailsService {
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Always return a dummy user for JWT validation
        return User.withUsername(username)
                .password("")
                .authorities(Collections.emptyList())
                .accountLocked(false)
                .disabled(false)
                .build();
    }
} 