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
import java.io.IOException;

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
        JSONObject json = new JSONObject(body);
        String img = json.getString("img");
        String icon = json.getString("icon");
        String lat = json.getString("lat");
        String lon = json.getString("lon");
        buildingSvc.addFloorplan(floorplanName, img, "floorplans", lat, lon, icon);
        buildingSvc.extractWalls(floorplanName);
        System.out.println("Finished creating building");
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
        System.out.println(response);
        return (response == null) ? Response.ok().build() : Response.ok().entity(response).build();
    }

    @GET
    @Path("/prefixed/{limit}/{prefix}")
    public Response fetchBuildingOnPrefix(@PathParam("prefix") String prefix, @PathParam("limit") int limit) {
        String response = buildingSvc.fetchBuildingOnPrefix(limit, prefix);
        return (response == null) ? Response.ok().build() : Response.ok().entity(response).build();
    }

    @GET
    @Path("/image/floorplan/{building}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getFloorplanImage( @PathParam("building") String building) throws IOException, JSONException {
        String response = buildingSvc.getFloorplanImage(building);
        return (response == null) ? Response.ok().build() : Response.ok().entity(response).build();
    }

    @GET
    @Path("/image/nn/{building}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getNNImage( @PathParam("building") String building) throws IOException, JSONException {
        String response = buildingSvc.getNNImage(building);
        return (response == null) ? Response.ok().build() : Response.ok().entity(response).build();
    }

    @GET
    @Path("/imagePath/{building}/{src}/{dst}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getImageWithPath( @PathParam("building") String building, @PathParam("src") String src,
                                      @PathParam("dst") String dst) throws IOException, JSONException {
        String response = buildingSvc.getImageWithPath(src, dst, building);
        return (response == null) ?  Response.ok().build() :  Response.ok().entity(response).build();
    }
}
