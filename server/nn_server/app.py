from flask import Flask
from flask import request
from flask import jsonify
from main import feed_image_to_net
from flask_cors import CORS, cross_origin
from PIL import Image
from base64 import b64encode
from base64 import b64decode
app = Flask(__name__)
CORS(app)

# import the necessary packages
import numpy as np
# import urllib
import cv2
import boto3
import botocore
import io
import configparser
import matplotlib.pyplot as plt
import pdb
import re
import torch
from io import BytesIO
from torchvision import transforms
from torch.utils.data.sampler import SubsetRandomSampler

BUCKET_NAME = "gtfo"
Config = configparser.ConfigParser()
Config.read(".env")
aws_access_key_id = Config.get("default", "aws_access_key_id")
aws_secret_access_key = Config.get("default", "aws_secret_access_key")
bucket = boto3.resource('s3', aws_access_key_id=aws_access_key_id,
                        aws_secret_access_key=aws_secret_access_key).Bucket(BUCKET_NAME)

# METHOD #1: OpenCV, NumPy, and urllib
def name_to_image(name):
    # download the image, convert it to a NumPy array, and then read
    # it into OpenCV format
    print("le name is" + name)

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
    img = name_to_image(request.args.get('image_name'))
    h, w, c = img.shape
    result = feed_image_to_net(img, './GTFO_10.pt')
    img = np.array(result)
    kernel = np.ones((3, 3), np.uint8)
    img = cv2.erode(img, kernel, iterations=2)
    t = torch.Tensor([0.4])
    trans = transforms.ToTensor()
    binarized = (torch.tensor(img / 255.0) > t.double()).float() * 1
    pil_trans = transforms.ToPILImage()
    binarized_output = pil_trans(binarized.unsqueeze(0))
    cropped_output = binarized_output.crop((0, 0, w, h))
    cropped_output.save("static/output.png")
    print("Completed")
    return "Completed"

@app.route('/static/output.png', methods=["GET"])
def get_output():
    with open('./static/output.png', 'rb') as f:
        s = f.read()
    encoding = b64encode(s)
    return encoding

# @app.route('/squarize', methods=["GET"])
# def squarize():
#     #b64stringStripped = re.sub('^data:image/.+;base64,', '', request.args.get('image'))
#
#     print(request.args.get('image'))
#     print("Length of b64: " + len(request.args.get('image')))
#
#     image_data = b64decode(request.args.get('image'))
#     image = Image.open(io.StringIO(image_data))
#     w, h = image.size
#
#     diff = w - h
#
#     if diff > 0:
#         new_im = Image.new("RGB", (w, w))
#         new_im.paste(im, 0, diff / 2)
#         buffered = BytesIO()
#         new_im.save(buffered, format="PNG")
#         img_str = base64.b64encode(buffered.getvalue())
#         return img_str
#     elif diff < 0:
#         new_im = Image.new("RGB", (h, h))
#         new_im.paste(im, -diff / 2, 0)
#         buffered = BytesIO()
#         new_im.save(buffered, format="PNG")
#         img_str = base64.b64encode(buffered.getvalue())
#         return img_str
#     else:
#         return request.args.get('image')

@app.route('/')
def hello():
    return "kekker"

if __name__ == "__main__":
    app.run(host = '0.0.0.0', threaded=True, port=80, debug=True)
