package com.cyberas.api.resource;

import com.cyberas.domain.service.AuthService;
import com.cyberas.domain.service.AuthService.AuthResponse;
import com.cyberas.security.JwtContext;
import com.cyberas.security.ratelimit.RateLimitPolicy;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
    @RateLimitPolicy(type = RateLimitPolicy.PolicyType.LOGIN)
    public Response login(@Valid LoginRequest request) {
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
    @RateLimitPolicy(type = RateLimitPolicy.PolicyType.REGISTER)
    public Response register(@Valid RegisterRequest request) {
        AuthResponse response = authService.registerOrganization(
            request.organizationName, request.email, request.password, request.firstName, request.lastName);
        return Response.status(Response.Status.CREATED).entity(response).build();
    }

    @POST
    @Path("/refresh")
    public Response refresh(@Valid RefreshTokenRequest request) {
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
    public Response changePassword(@Valid ChangePasswordRequest request) {
        if (!jwtContext.isAuthenticated()) {
            return Response.status(Response.Status.UNAUTHORIZED)
                .entity(new ErrorResponse("Unauthorized")).build();
        }
        authService.changePassword(jwtContext.getUserId(), request.oldPassword, request.newPassword);
        return Response.ok(new SuccessResponse("Password changed")).build();
    }

    public static class LoginRequest {
        @NotBlank
        @Email
        public String email;

        @NotBlank
        @Size(min = 8, max = 256)
        public String password;

        public UUID organizationId;
    }

    public static class RegisterRequest {
        @NotBlank
        @Size(min = 3, max = 200)
        public String organizationName;

        @NotBlank
        @Email
        public String email;

        @NotBlank
        @Size(min = 8, max = 256)
        public String password;

        @NotBlank
        @Size(min = 1, max = 100)
        public String firstName;

        @NotBlank
        @Size(min = 1, max = 100)
        public String lastName;
    }

    public static class RefreshTokenRequest {
        @NotBlank
        public String refreshToken;
    }

    public static class ChangePasswordRequest {
        @NotBlank
        @Size(min = 8, max = 256)
        public String oldPassword;

        @NotBlank
        @Size(min = 8, max = 256)
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
