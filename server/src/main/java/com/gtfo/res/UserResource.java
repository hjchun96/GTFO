package com.gtfo.res;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import org.json.JSONException;
import org.json.JSONObject;


@Path("/user")
public class UserResource {

    private UserSvc userSvc;

    public UserResource() {
        userSvc = new UserSvc();
    }

    @GET
    @Path("{user}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response fetchUser(@PathParam("user") String userId) {
        String user = userSvc.fetchUser(userId);
        if (user == null) {
            return Response.ok().build();
        }
        return Response.ok().entity(user).build();
    }

    @GET
    @Path("{user}/{pass}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response validateUser(@PathParam("user") String userId, @PathParam("pass") String pass) {
        String user = userSvc.fetchUser(userId);
        if (user == null) {
            return Response.ok().build();
        }
        return Response.ok().entity(user).build();
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response createUser(String user) throws JSONException {
        JSONObject json = new JSONObject(user);
        String username = json.getString("user");
        String password = json.getString("pass");
        userSvc.createUser(username, password);
        return Response.ok().build();
    }

    @POST
    @Path("/addBuilding")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response addBuildingToUser(String body) throws JSONException {
        System.out.println("BODY: " + body);
        JSONObject json = new JSONObject(body);
        String username = json.getString("user");
        String buildingId = json.getString("buildingId");
        userSvc.addBuilding(username, buildingId);
        return Response.ok().build();
    }

    @POST
    @Path("/addAdmin")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response addAdminToUser(String body) throws JSONException {
        JSONObject json = new JSONObject(body);
        String username = json.getString("user");
        String buildingId = json.getString("buildingId");
        userSvc.addAdmin(username, buildingId);
        return Response.ok().build();
    }

}
