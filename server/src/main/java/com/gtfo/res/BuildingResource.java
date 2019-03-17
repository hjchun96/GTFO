package com.gtfo.res;

import org.json.JSONException;
import org.json.JSONObject;

import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.GET;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

@Path("/building")
public class BuildingResource {

    private BuildingSvc buildingSvc;

    public BuildingResource() {
        buildingSvc =  new BuildingSvc();
    }

    @POST
    @Path("/addFloorplan/{floorplanName}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response createBuilding(String body, @PathParam("floorplanName") String floorplanName)
            throws JSONException {
        System.out.println("Building: " + floorplanName);
        JSONObject json = new JSONObject(body);
        String img = json.getString("img");
        buildingSvc.addFloorplan(floorplanName, img, "floorplans");

        // ADD FLASK SERVER CALL
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

    @GET
    public Response fetchAllBuildings(@PathParam("building") String building) {
        String response = buildingSvc.fetchAllBuildings();
        return (response == null) ? Response.ok().build() : Response.ok().entity(response).build();
    }

    @GET
    @Path("/prefixed/{limit}/{prefix}")
    public Response fetchBuildingOnPrefix(@PathParam("prefix") String prefix, @PathParam("limit") int limit) {
        String response = buildingSvc.fetchBuildingOnPrefix(limit, prefix);
        return (response == null) ? Response.ok().build() : Response.ok().entity(response).build();
    }

    @GET
    @Path("/imagePath/{building}/{src}/{dst}")
    public Response getImageWithPath( @PathParam("building") String building, @PathParam("src") String src, @PathParam("dst") String dst) {
        String response = buildingSvc.getImageWithPath(src, dst, building);
        return (response == null) ?  Response.ok().build() :  Response.ok().entity(response).build();
    }
}
