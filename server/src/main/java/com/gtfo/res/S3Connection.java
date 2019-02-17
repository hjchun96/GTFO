package com.gtfo.res;

import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.Bucket;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.List;
import java.util.Scanner;

public class S3Connection {

    private AWSCredentials credentials;

    private AmazonS3 s3client;

    public Bucket s3bucket;

    public S3Connection() {
        File keys = new File("./keys");
        String accessKey = null;
        String secretKey = null;
        try {
            Scanner sc = new Scanner(keys);
            accessKey = sc.nextLine();
            secretKey = sc.nextLine();
        } catch (FileNotFoundException e) {
            System.out.println("Make sure you've set up your keys file!");
        }

        credentials = new BasicAWSCredentials(
                accessKey,
                secretKey
        );

        s3client = AmazonS3ClientBuilder
                .standard()
                .withCredentials(new AWSStaticCredentialsProvider(credentials))
                .withRegion(Regions.US_EAST_2)
                .build();

        List<Bucket> buckets = s3client.listBuckets();
        for (Bucket bucket : buckets) {
            if (bucket.getName().equals("gtfo")) {
                s3bucket = bucket;
            }
        }
    }

    public AmazonS3 getInstance() {
        return this.s3client;
    }
}

