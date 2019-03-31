from flask import Flask
from flask import request
from main import feed_image_to_net
from flask_cors import CORS, cross_origin
from PIL import Image
app = Flask(__name__)
CORS(app)

# import the necessary packages
import numpy as np
# import urllib
import cv2
import boto3
import botocore
import io
import ConfigParser
 
import pdb

BUCKET_NAME = "gtfo"
Config = ConfigParser.ConfigParser()
Config.read(".env")
aws_access_key_id = Config.get("default", "aws_access_key_id")
aws_secret_access_key = Config.get("default", "aws_secret_access_key")
bucket = boto3.resource('s3', aws_access_key_id=aws_access_key_id,
                        aws_secret_access_key=aws_secret_access_key).Bucket(BUCKET_NAME)

# METHOD #1: OpenCV, NumPy, and urllib
def name_to_image(name):
    # download the image, convert it to a NumPy array, and then read
    # it into OpenCV format
    print("le name is")
    print(name)

    s3_key = "floorplans/" + name
    if (not s3_key.endswith(".png")):
        s3_key += ".png"

    obj = bucket.Object(s3_key)
    file_stream = io.BytesIO()
    obj.download_fileobj(file_stream)
    image = np.asarray(bytearray(file_stream.getvalue()), dtype="uint8")
    image = cv2.imdecode(image, cv2.IMREAD_COLOR)
    # return the image
    return image


@app.route('/detect_walls', methods=["GET", "POST"])
def detect_walls():
    #image = url_to_image(request.args.get('image_url'))
    image = name_to_image(request.args.get('image_name'))

    image_result = feed_image_to_net(image)
    result = image_result
    #result = Image.fromarray(((1 - image_result) * 255).astype(np.uint8))
    result.save('nn_output/output.png')
    return "Completed"

@app.route('/')
def hello():
    return "kekker"

if __name__ == "__main__":
    app.run(host = '0.0.0.0', threaded=True, port=80, debug=True)
