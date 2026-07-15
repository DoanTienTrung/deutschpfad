package com.deutschpfad.backend.auth;

public record LoginResult(String token, User user) {
}
