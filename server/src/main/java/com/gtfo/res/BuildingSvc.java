package com.gtfo.res;

import com.amazonaws.services.s3.AmazonS3;
import com.gtfo.app.Helpers;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.glassfish.jersey.servlet.internal.Utils;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

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

}
