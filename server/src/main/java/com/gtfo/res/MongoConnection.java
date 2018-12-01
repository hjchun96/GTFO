package com.gtfo.res;

import com.mongodb.MongoClient;
import com.mongodb.MongoClientURI;
import com.mongodb.client.MongoDatabase;

public class MongoConnection {
    public static MongoConnection mongoConnection = null;
    private static MongoClient mongoClient;
    private static MongoDatabase mongoDatabase = null;

    public static MongoConnection getInstance() {

        if (mongoConnection == null) {
            mongoConnection = new MongoConnection();
        }

        return mongoConnection;
    }

    private MongoConnection() {
        MongoClientURI uri = new MongoClientURI(
                "mongodb+srv://faxuerui:ihWfArCfZziVMHjH@cluster0-ymljf.mongodb.net/test?retryWrites=true");

        mongoClient = new MongoClient(uri);
        mongoDatabase = mongoClient.getDatabase("gtfo");
    }

    public MongoDatabase getDatabase() {
        return mongoDatabase;
    }
}
