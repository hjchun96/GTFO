package com.gtfo.res;

import com.amazonaws.AmazonServiceException;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.services.s3.model.S3ObjectInputStream;
import com.amazonaws.util.IOUtils;
import com.gtfo.app.FloorGraph;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.apache.commons.codec.binary.Base64;
import org.bson.Document;
import org.json.JSONException;
import org.json.JSONObject;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.*;
import java.util.ArrayList;
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

    public byte[] getFloorplanImageFromS3(String name) throws IOException {
        String key = "floorplans/" + name + ".png";
        System.out.println(name);
        S3Object obj = s3client.getObject("gtfo", key);
        byte[] res = IOUtils.toByteArray(obj.getObjectContent());
        return res;
    }

    public byte[] getNeuralNetImageFromS3(String name) throws IOException {
        String key = "neural_net/" + name + ".png";
        S3Object obj = s3client.getObject("gtfo", key);
        byte[] res = IOUtils.toByteArray(obj.getObjectContent());
        return res;
    }

    private BufferedImage createImageFromBytes(byte[] imageData) {
        ByteArrayInputStream bais = new ByteArrayInputStream(imageData);
        try {
            return ImageIO.read(bais);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public void addFloorplan(String name, String img, String type, String lat, String lon) {
        byte[] imageByteArray = Base64.decodeBase64(img);
        String extension = "png";
        String imgName = type + "/" + name + "." + extension;
        try {
            InputStream fileInputStream = new ByteArrayInputStream(imageByteArray);
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentType("image/" + extension);
            metadata.setContentLength(imageByteArray.length);
            s3client.putObject("gtfo", imgName, fileInputStream, metadata);
        } catch (AmazonServiceException e) {
            System.err.println(e.getErrorMessage());
        }
        Document building = new Document("name", name);
        building.append("s3_url", name);
        building.append("lat", lat);
        building.append("lon", lon);
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
                .collect(Collectors.joining(", ", "[", "]"));
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

    public String getFloorplanImage(String buildingId) throws IOException, JSONException {
        try {
            BufferedImage floorplan = createImageFromBytes(getFloorplanImageFromS3(buildingId));
            
            final ByteArrayOutputStream os = new ByteArrayOutputStream();
            ImageIO.write(floorplan, "png", os);
            JSONObject res = new JSONObject();
            res.append("img", Base64.encodeBase64String(os.toByteArray()));
            return res.toString();
        } catch(IllegalArgumentException e) {
            JSONObject res = new JSONObject();
            res.append("err", e.getMessage());
            return res.toString();
        } catch (AmazonServiceException s3e) {
            JSONObject res = new JSONObject();
            res.append("err", s3e.getMessage());
            return res.toString();
        }
    }

    /**
     * Handles requests from users for paths in some building. Builds a response
     * @param src "x,y"
     * @param tgt "x,y"
     * @param buildingId .
     */
    public String getImageWithPath(String src, String tgt, String buildingId) throws IOException, JSONException {
        BufferedImage floorplan = createImageFromBytes(getFloorplanImageFromS3(buildingId));
        BufferedImage graph = createImageFromBytes(getNeuralNetImageFromS3(buildingId));

        String[] srcCoords = src.split(",");
        String[] tgtCoords = tgt.split(",");

        if (srcCoords.length != 2 || tgtCoords.length != 2) {
            throw new IllegalArgumentException("Badly formatted src or tgt strings: use 'x,y'");
        }

        FloorGraph.Pixel srcPixel = new FloorGraph.Pixel((int) Double.parseDouble(srcCoords[0]), (int) Double.parseDouble(srcCoords[1]));
        FloorGraph.Pixel tgtPixel = new FloorGraph.Pixel((int) Double.parseDouble(tgtCoords[0]), (int) Double.parseDouble(tgtCoords[1]));

        try {
            // Get that image
            BufferedImage drawnImg = FloorGraph.drawPath(floorplan, graph, srcPixel, tgtPixel);
            // Convert with Base64 so BuildingResource can easily send it to client
            final ByteArrayOutputStream os = new ByteArrayOutputStream();
            ImageIO.write(drawnImg, "png", os);
            JSONObject res = new JSONObject();
            res.append("img", Base64.encodeBase64String(os.toByteArray()));
            return res.toString();

        } catch(IllegalArgumentException e) {
            JSONObject res = new JSONObject();
            res.append("err", e.getMessage());
            return res.toString();
        }


    }
}
