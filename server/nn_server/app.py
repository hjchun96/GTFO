from flask import Flask
from flask import request
from main import feed_image_to_net
from flask_cors import CORS, cross_origin
from PIL import Image
app = Flask(__name__)
CORS(app)

# import the necessary packages
import numpy as np
import urllib
import cv2
 
import pdb

# METHOD #1: OpenCV, NumPy, and urllib
def url_to_image(url):
	# download the image, convert it to a NumPy array, and then read
	# it into OpenCV format
	print("le url is")
	print(url)
	resp = urllib.urlopen(url)
	image = np.asarray(bytearray(resp.read()), dtype="uint8")
	image = cv2.imdecode(image, cv2.IMREAD_COLOR)
	print(image)
	# return the image
	return image


@app.route('/detect_walls', methods=["GET", "POST"])
def detect_walls():
    image = url_to_image(request.args.get('image_url'))
    image_result = feed_image_to_net(image)
    result = image_result
    #result = Image.fromarray(((1 - image_result) * 255).astype(np.uint8))
    result.save('nn_output/output.png')
    return "Completed"

@app.route('/')
def hello():
    return "kekker"

#if __name__ == "__main__":
#    app.run(host = '0.0.0.0', threaded=True, port=80, debug=True)
