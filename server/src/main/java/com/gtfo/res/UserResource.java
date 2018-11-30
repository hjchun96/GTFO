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
}
