package com.cyberas.api.resource;

import com.cyberas.domain.service.AuthService;
import com.cyberas.domain.service.AuthService.AuthResponse;
import com.cyberas.security.JwtContext;
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

    @Inject
    JwtContext jwtContext;

    @POST
    @Path("/login")
    public Response login(LoginRequest request) {
        try {
            AuthResponse response = authService.login(request.email, request.password, request.organizationId);
            return Response.ok(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.UNAUTHORIZED)
                .entity(new ErrorResponse(e.getMessage()))
                .build();
        }
    }

    /** Inscription : crée une organisation et son premier administrateur. */
    @POST
    @Path("/register")
    public Response register(RegisterRequest request) {
        AuthResponse response = authService.registerOrganization(
            request.organizationName, request.email, request.password, request.firstName, request.lastName);
        return Response.status(Response.Status.CREATED).entity(response).build();
    }

    @POST
    @Path("/refresh")
    public Response refresh(RefreshTokenRequest request) {
        try {
            return Response.ok(authService.refreshToken(request.refreshToken)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.UNAUTHORIZED)
                .entity(new ErrorResponse(e.getMessage()))
                .build();
        }
    }

    /** Profil de l'utilisateur porté par le jeton. Protégé par JwtFilter (chemin non public). */
    @GET
    @Path("/me")
    public Response me() {
        if (!jwtContext.isAuthenticated()) {
            return Response.status(Response.Status.UNAUTHORIZED)
                .entity(new ErrorResponse("Unauthorized")).build();
        }
        return Response.ok(authService.me(jwtContext.getUserId(), jwtContext.getOrganizationId(),
            jwtContext.getRole())).build();
    }

    @POST
    @Path("/change-password")
    public Response changePassword(ChangePasswordRequest request) {
        if (!jwtContext.isAuthenticated()) {
            return Response.status(Response.Status.UNAUTHORIZED)
                .entity(new ErrorResponse("Unauthorized")).build();
        }
        authService.changePassword(jwtContext.getUserId(), request.oldPassword, request.newPassword);
        return Response.ok(new SuccessResponse("Password changed")).build();
    }

    public static class LoginRequest {
        public String email;
        public String password;
        public UUID organizationId;
    }

    public static class RegisterRequest {
        public String organizationName;
        public String email;
        public String password;
        public String firstName;
        public String lastName;
    }

    public static class RefreshTokenRequest {
        public String refreshToken;
    }

    public static class ChangePasswordRequest {
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
