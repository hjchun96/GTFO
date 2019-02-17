package com.gtfo.res;

import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.util.JSON;
import org.bson.Document;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

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

}
