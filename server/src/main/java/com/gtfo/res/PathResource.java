package com.gtfo.res;

import com.gtfo.app.FloorGraph;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.Response;
import java.io.IOException;
import java.util.List;

@Path("/path")
public class PathResource {
    private PathSvc pathSvc;

    public PathResource() {
        pathSvc = new PathSvc();
    }

    @GET
    @Path("{building_path}")
    public Response getShortestPath(@PathParam("building_path") String building_path,
                                    @PathParam("src") FloorGraph.Pixel src,
                                    @PathParam("dest") FloorGraph.Pixel dest) throws IOException {
        List<String> resp = pathSvc.getShortestPath(building_path, src, dest);
        return Response.ok().entity(resp).build();
    }
}
