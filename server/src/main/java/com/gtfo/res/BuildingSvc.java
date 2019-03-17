package com.gtfo.res;

import com.amazonaws.services.s3.AmazonS3;
import com.gtfo.app.FloorGraph;
import com.gtfo.app.Helpers;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

public class BuildingSvc {

    public MongoConnection mongoConnection;
    public MongoDatabase mongoDatabase;
    public MongoCollection<Document> buildingCollection;
    public S3Connection s3connection;
    public AmazonS3 s3client;

    public BuildingSvc() {
        mongoConnection = MongoConnection.getInstance();
        mongoDatabase = mongoConnection.getDatabase();
        buildingCollection = mongoDatabase.getCollection("buildings");

        s3connection = new S3Connection();
        s3client = s3connection.getInstance();
    }

    public void createBuilding(String name, List<String> plans) {
        Document building = new Document("name", name);
        building.append("plans", name);
        buildingCollection.insertOne(building);
    }

    public void createBuilding(String name, InputStream file) {
        String key = "floorplans/" + name;
        Helpers.store_in_s3(s3client, key, file);
        Document building = new Document("name", name);
        building.append("key", key);
        buildingCollection.insertOne(building);
    }

    public String fetchBuilding(String building) {
        Document query = new Document("name", building);
        FindIterable cursor = buildingCollection.find(query);
        ArrayList<Document> res = new ArrayList<>();
        cursor.into(res);
        Document doc;
        try {
            doc = res.get(0);
            doc.put("exists", true);
        } catch (Exception e) {
            doc = new Document();
            doc.put("exists", false);
        }
        return doc.toJson();
    }

    public String fetchAllBuildings() {
        return StreamSupport.stream(buildingCollection.find().spliterator(), false)
                .map(Document::toJson)
                .collect(Collectors.joining(", ", "{", "}"));
    }

    public String fetchBuildingOnPrefix(int limit, String prefix) {
        Document regQuery = new Document();
        regQuery.append("$regex", "^" + prefix);
        regQuery.append("$options", "i");

        Document findQuery = new Document();
        findQuery.append("name", regQuery);

        return StreamSupport.stream(buildingCollection.find(findQuery).limit(limit).spliterator(), false)
                .map(Document::toJson)
                .collect(Collectors.joining(", ", "{", "}"));
    }

    /**
     * Handles requests from users for paths in some building. Builds a response
     * @param src "x,y"
     * @param tgt "x,y"
     * @param buildingId .
     */
    public BufferedImage getImageWithPath(String src, String tgt, String buildingId) throws IOException {
        BufferedImage floorplan = null; // TODO: find the images from S3 using buildingId
        BufferedImage graph = null; // TODO: find the images from S3 using buildingId

        String[] srcCoords = src.split(",");
        String[] tgtCoords = tgt.split(",");

        if (srcCoords.length != 2 || tgtCoords.length != 2) {
            throw new IllegalArgumentException("Badly formatted src or tgt strings: use 'x,y'");
        }

        FloorGraph.Pixel srcPixel = new FloorGraph.Pixel(Integer.parseInt(srcCoords[0]), Integer.parseInt(srcCoords[1]));
        FloorGraph.Pixel tgtPixel = new FloorGraph.Pixel(Integer.parseInt(tgtCoords[0]), Integer.parseInt(tgtCoords[1]));

        return FloorGraph.drawPath(floorplan, graph, srcPixel, tgtPixel);
    }
}
