package com.gtfo.res;

import com.mongodb.client.*;
import org.bson.Document;

import java.util.ArrayList;

public class UserSvc {

    public MongoConnection mongoConnection;
    public MongoDatabase mongoDatabase;
    public MongoCollection<Document> userCollection;

    public UserSvc() {
        mongoConnection = MongoConnection.getInstance();
        mongoDatabase = mongoConnection.getDatabase();
        userCollection = mongoDatabase.getCollection("users");
    }

    public String fetchUser(String user) {
        Document query = new Document("user", user);
        FindIterable cursor = userCollection.find(query);
        ArrayList<Document> res = new ArrayList<>();
        cursor.into(res);
        return res.get(0).toJson();
    }

    public void createUser(String username, String password) {
        Document user = new Document("user", username);
        user.append("pass", password);
        userCollection.insertOne(user);
    }

}
