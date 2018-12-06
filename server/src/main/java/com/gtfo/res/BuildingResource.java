package com.gtfo.res;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.json.JSONException;
import org.json.JSONObject;

@Path("/building")
public class BuildingResource {

    private BuildingSvc buildingSvc;

    public BuildingResource() {
        buildingSvc =  new BuildingSvc();
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response createBuilding(String body) throws JSONException {
        JSONObject json = new JSONObject(body);
        String name = json.getString("name");
        buildingSvc.createBuilding(name);
        return Response.ok().build();
    }

}
