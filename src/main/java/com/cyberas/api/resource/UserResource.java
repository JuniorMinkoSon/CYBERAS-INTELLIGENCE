package com.cyberas.api.resource;

import com.cyberas.api.dto.UserDtos;
import com.cyberas.domain.service.UserService;
import com.cyberas.security.JwtContext;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.UUID;

@Path("/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserResource {

    @Inject
    UserService userService;

    @Inject
    JwtContext jwtContext;

    @POST
    public Response createUser(UserDtos.CreateUserRequest request) {
        try {
            var response = userService.createUser(request, jwtContext.getOrganizationId());
            return Response.status(Response.Status.CREATED).entity(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(new ErrorResponse(e.getMessage())).build();
        }
    }

    @GET
    public Response listUsers(@QueryParam("page") Integer page,
                             @QueryParam("pageSize") Integer pageSize) {
        try {
            var response = userService.listUsers(jwtContext.getOrganizationId(), page, pageSize);
            return Response.ok(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(new ErrorResponse(e.getMessage())).build();
        }
    }

    @GET
    @Path("/{id}")
    public Response getUser(@PathParam("id") UUID userId) {
        try {
            var response = userService.getUser(userId, jwtContext.getOrganizationId());
            return Response.ok(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ErrorResponse(e.getMessage())).build();
        }
    }

    @PUT
    @Path("/{id}")
    public Response updateUser(@PathParam("id") UUID userId, UserDtos.UpdateUserRequest request) {
        try {
            var response = userService.updateUser(userId, request, jwtContext.getOrganizationId());
            return Response.ok(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(new ErrorResponse(e.getMessage())).build();
        }
    }

    @DELETE
    @Path("/{id}")
    public Response deactivateUser(@PathParam("id") UUID userId) {
        try {
            userService.deactivateUser(userId, jwtContext.getOrganizationId());
            return Response.noContent().build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(new ErrorResponse(e.getMessage())).build();
        }
    }

    public static class ErrorResponse {
        public String error;

        public ErrorResponse(String error) {
            this.error = error;
        }
    }
}
