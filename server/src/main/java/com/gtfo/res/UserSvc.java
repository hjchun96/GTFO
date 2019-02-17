package com.gtfo.res;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.Bucket;
import com.mongodb.client.*;
import org.bson.Document;
import org.bson.conversions.Bson;

import java.io.File;
import java.util.ArrayList;

import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Updates.push;

public class UserSvc {

    public MongoConnection mongoConnection;
    public MongoDatabase mongoDatabase;
    public MongoCollection<Document> userCollection;
    public S3Connection s3connection;
    public AmazonS3 s3client;

    public UserSvc() {
        mongoConnection = MongoConnection.getInstance();
        mongoDatabase = mongoConnection.getDatabase();
        userCollection = mongoDatabase.getCollection("users");

        s3connection = new S3Connection();
        s3client = s3connection.getInstance();
    }

    public String fetchUser(String user) {
        Document query = new Document("user", user);
        FindIterable cursor = userCollection.find(query);
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

    public void createUser(String username, String password) {
        Document user = new Document("user", username);
        user.append("pass", password);
        userCollection.insertOne(user);
    }

    public void addBuilding(String username, String buildingId) {
        Bson update = push("buildings", buildingId);
        userCollection.updateOne(eq("user", username), update);
    }

    public void addAdmin(String username, String buildingId) {
        Bson update = push("admin", buildingId);
        userCollection.updateOne(eq("user", username), update);
    }

}
