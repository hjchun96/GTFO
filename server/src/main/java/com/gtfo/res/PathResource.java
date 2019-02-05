package com.gtfo.res;

import com.gtfo.app.FloorGraph;
import org.json.JSONException;
import org.json.JSONObject;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.IOException;
import java.util.List;

@Path("/path")
public class PathResource {
    private PathSvc pathSvc;

    public PathResource() {
        pathSvc = new PathSvc();
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/getPath")
    public Response getShortestPath(String body) throws IOException, JSONException {
        JSONObject json = new JSONObject(body);
        String building_path = json.getString("building_path");
        String src_str = json.getString("src");
        String dest_str = json.getString("dest");
        String[] src_arr = src_str.split(",");
        String[] dest_arr = dest_str.split(",");
        FloorGraph.Pixel src = new FloorGraph.Pixel(Integer.parseInt(src_arr[0]), Integer.parseInt(src_arr[1]));
        FloorGraph.Pixel dest = new FloorGraph.Pixel(Integer.parseInt(dest_arr[0]), Integer.parseInt(dest_arr[1]));
        List<String> resp = pathSvc.getShortestPath(building_path, src, dest);
        return Response.ok().entity(resp).build();
    }
}
