package com.gtfo.res;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.glassfish.jersey.media.multipart.FormDataParam;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Path("/building")
public class BuildingResource {

    private BuildingSvc buildingSvc;

    public BuildingResource() {
        buildingSvc =  new BuildingSvc();
    }

    @POST
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public Response createBuilding(@FormDataParam("buildingName") String body, @FormDataParam("img") InputStream file)
            throws JSONException {
        JSONObject json = new JSONObject(body);
        String name = json.getString("name").toLowerCase();
//        JSONArray plans_arr = json.getJSONArray("plans");
//        List<String> plans = new ArrayList<String>();
//        for (int i = 0; i < plans_arr.length(); i++) {
//            plans.add(plans_arr.getString(i));
//        }
//        buildingSvc.createBuilding(name, plans);
        buildingSvc.createBuilding(name, file);
        return Response.ok().build();
    }

    @GET
    @Path("{building}")
    public Response fetchBuilding(@PathParam("building") String building) {
        String response = buildingSvc.fetchBuilding(building);
        if (response == null) {
            return Response.ok().build();
        }
        return Response.ok().entity(response).build();
    }
}
