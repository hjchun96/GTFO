import glob
import imageio
import numpy as np
from PIL import Image
import re


def rgb2grey(rgb):
    return np.dot(rgb[...,:3], [0.299, 0.587, 0.114])

for (path_label, path_img) in zip(glob.glob("../data/cleaned_data/*.png"), glob.glob("../data/input_data/*.png")):
    number = int(re.search(r'\d+', path_label).group())

    label = np.array(imageio.imread(path_label))
    img = np.array(imageio.imread(path_img))


    if img.ndim==3:
        img = rgb2grey(img)
    if label.ndim == 3:
        label = rgb2grey(label)

    (x, y) = label.shape


    # Combine into a r, g, - picture
    combined = np.zeros(shape=(x, y, 3))
    combined[:, :, 0] = label
    combined[:, :, 1] = img

    # Rescale to 0-255 and convert to uint8
    im = Image.fromarray(combined.astype(np.uint8))
    im.save(f'../data/combined_data/{number}.png')
