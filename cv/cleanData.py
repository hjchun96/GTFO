import cv2, os, re, math, copy

import numpy as np
from PIL import Image
from xml.dom import minidom

def cleanData(png, svg, idx):

    canny = 0

    # Read files
    raw_floorplan = cv2.imread(png)
    sh = raw_floorplan.shape
    clean_floorplan = np.full(sh, 255, dtype=np.uint8)
    svg_file = minidom.parse(svg)

    # Remove doors and windows
    for path in svg_file.getElementsByTagName('polygon'):
        type = path.getAttribute('class')
        if type == "Wall":
            points = path.getAttribute('points').strip()
            pts = re.split('\s|[,]', points)
            pts = [int(round(float(pt))) for pt in pts]
            num_corner = int(len(pts)/2)
            cornerPts = np.zeros((num_corner, 2), dtype=np.int32)
            for i in range(num_corner):
                cornerPts[i, 0] = pts[2 *i]
                cornerPts[i, 1] = pts[2 *i + 1]
            cv2.fillConvexPoly(clean_floorplan, cornerPts, [0, 0, 0])
    svg_file.unlink()


    b = np.uint8(clean_floorplan)
    if canny:
        edge = cv2.Canny(clean_floorplan, 1, 1)
        b = np.uint8(edge)

    im = Image.fromarray(b)
    filename = "cleanData/" + str(idx) + ".png"
    im.save(filename)
    return

if __name__ == "__main__":

    mr = 2
    for idx in range(1, mr):
        png = "originalData/" + str(idx) + ".png"
        svg = "originalData/" + str(idx) + ".svg"
        cleanData(png, svg, idx)
