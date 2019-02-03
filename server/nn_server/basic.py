from flask import Flask
from main import feed_image_to_net
app = Flask(__name__)

# import the necessary packages
import numpy as np
import urllib
import cv2
 
# METHOD #1: OpenCV, NumPy, and urllib
def url_to_image(url):
        # download the image, convert it to a NumPy array, and then read
        # it into OpenCV format
        resp = urllib.urlopen(url)
        image = np.asarray(bytearray(resp.read()), dtype="uint8")
        image = cv2.imdecode(image, cv2.IMREAD_COLOR)
 
        # return the image
        return image


@app.route('/detect_walls', methods=["GET", "POST"])
def detect_walls():
    image = url_to_image(request.args.get('image_url'))
    image_result = feed_image_to_net(image)
    result = Image.fromarray(((1 - image_result) * 255).astype(np.uint8))
    result.save('output.png')
    return result


@app.route('/')
def hello_world():
    return 'Hello, World!'

if __name__ == '__main__':
    print("hello my dudes")
