package com.gtfo.res;

import com.gtfo.app.FloorGraph;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class PathSvc {


    public PathSvc() {
    }

    public List<String> getShortestPath(String building_path,
                                        FloorGraph.Pixel src, FloorGraph.Pixel dest) throws IOException {
        FloorGraph graph = new FloorGraph(building_path);
        List<FloorGraph.Pixel> shortest_path = graph.getShortestPath(src, dest);
        List<String> resp = new ArrayList<>();
        for (int i = 0; i < shortest_path.size(); i++) {
            resp.add(shortest_path.get(i).toString());
        }
        return resp;
    }
}
