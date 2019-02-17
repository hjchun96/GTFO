package com.gtfo.res;

import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;

import java.util.ArrayList;
import java.util.List;

public class BuildingSvc {

    public MongoConnection mongoConnection;
    public MongoDatabase mongoDatabase;
    public MongoCollection<Document> buildingCollection;

    public BuildingSvc() {
        mongoConnection = MongoConnection.getInstance();
        mongoDatabase = mongoConnection.getDatabase();
        buildingCollection = mongoDatabase.getCollection("buildings");
    }

    public void createBuilding(String name, List<String> plans) {
        Document building = new Document("name", name);
        building.append("plans", name);
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
