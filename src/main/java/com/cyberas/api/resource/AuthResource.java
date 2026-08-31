package com.cyberas.api.resource;

import com.cyberas.domain.service.AuthService;
import com.cyberas.domain.service.AuthService.AuthResponse;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.UUID;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {

    @Inject
    AuthService authService;

    @POST
    @Path("/login")
    public Response login(LoginRequest request) {
        try {
            AuthResponse response = authService.login(
                request.email,
                request.password,
                request.organizationId
            );
            return Response.ok(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.UNAUTHORIZED)
                .entity(new ErrorResponse(e.getMessage()))
                .build();
        }
    }

    @POST
    @Path("/register")
    public Response register(RegisterRequest request) {
        try {
            authService.register(
                request.email,
                request.username,
                request.password,
                request.firstName,
                request.lastName,
                request.organizationId
            );
            return Response.status(Response.Status.CREATED)
                .entity(new SuccessResponse("User registered successfully"))
                .build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(new ErrorResponse(e.getMessage()))
                .build();
        }
    }

    @POST
    @Path("/refresh")
    public Response refresh(RefreshTokenRequest request) {
        try {
            AuthResponse response = authService.refreshToken(request.refreshToken);
            return Response.ok(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.UNAUTHORIZED)
                .entity(new ErrorResponse(e.getMessage()))
                .build();
        }
    }

    @POST
    @Path("/change-password")
    public Response changePassword(ChangePasswordRequest request) {
        try {
            authService.changePassword(
                request.userId,
                request.oldPassword,
                request.newPassword
            );
            return Response.ok(new SuccessResponse("Password changed successfully")).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(new ErrorResponse(e.getMessage()))
                .build();
        }
    }

    public static class LoginRequest {
        public String email;
        public String password;
        public UUID organizationId;
    }

    public static class RegisterRequest {
        public String email;
        public String username;
        public String password;
        public String firstName;
        public String lastName;
        public UUID organizationId;
    }

    public static class RefreshTokenRequest {
        public String refreshToken;
    }

    public static class ChangePasswordRequest {
        public UUID userId;
        public String oldPassword;
        public String newPassword;
    }

    public static class ErrorResponse {
        public String error;

        public ErrorResponse(String error) {
            this.error = error;
        }
    }

    public static class SuccessResponse {
        public String message;

        public SuccessResponse(String message) {
            this.message = message;
        }
    }
}
