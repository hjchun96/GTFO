package com.gtfo.app;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.awt.image.DataBufferByte;
import java.io.File;
import java.io.IOException;
import java.util.*;

public final class FloorGraph {

    /** Distance to search through if the selected pixels are walls. */
    final int APPROX_DIAM = 20;

    public boolean[][] grid;

    /**
     * Constructor 1 - floor-plan graph given image path.
     * @param path to image file
     */
    public FloorGraph(String path) throws IOException {
        this(gridFromImg(ImageIO.read(new File(path))));
    }


    /**
     * Constructor 2 - floor-plan graph given java array
     * @param grid .
     */
    public FloorGraph(boolean[][] grid) {
        this.grid = grid;
    }


    /**
     * Finds which orthogonal neighbours are available to travel to (not black).
     * @param p current pixel. Should not be a wall.
     * @return .
     */
    Set<Pixel> getNeighbors(Pixel p) {
        int x = p.x;
        int y = p.y;

        Set<Pixel> out = new HashSet<>();

        if (x < 0 || x >= grid.length || y < 0 || y >= grid[0].length) {
            throw new IllegalArgumentException("Coordinates out of bounds");
        }

        if (!grid[x][y]) {
            return out;
        }

        if (x > 0 && grid[x-1][y]) {
            out.add(new Pixel(x-1, y));
        }
        if (x < grid.length - 1 && grid[x+1][y]) {
            out.add(new Pixel(x+1, y));
        }
        if (y > 0 && grid[x][y-1]) {
            out.add(new Pixel(x, y-1));
        }
        if (y < grid[0].length - 1 && grid[x][y+1]) {
            out.add(new Pixel(x, y+1));
        }
        return out;
    }

    /**
     * Helper - finds path from a pre-computed parent graph.
     * @param parentGraph array of pointers to their parents
     * @param src .
     * @param tgt .
     * @return Path as a List of Pixels, or NULL if unreachable.
     */
    static List<Pixel> getPathFromParentGraph(Pixel[][] parentGraph, Pixel src, Pixel tgt) {
        Pixel curr = tgt;
        LinkedList<Pixel> out = new LinkedList<>();

        while (!curr.equals(src)) {
            out.offerFirst(curr);
            curr = parentGraph[curr.x][curr.y];
        }

        out.offerFirst(src);
        return out;
    }

    private int distanceBetween(Pixel a, Pixel b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    /**
     * Helper - finds closest non-wall pixel.
     * @param src .
     * @param diameter how far to look
     * @return Pixel if successful, else null if all are walls
     */
    private Pixel getClosestNonWall(Pixel src, int diameter) {
        boolean[][] visited = new boolean[grid.length][grid[0].length];
        LinkedList<Pixel> queue = new LinkedList<>();
        queue.add(src);
        visited[src.x][src.y] = true;

        while(!queue.isEmpty()) {
            Pixel curr = queue.poll();

            // Skip if too far
            if (distanceBetween(curr, src) > diameter) {
                continue;
            }

            // Found it!
            if (grid[curr.x][curr.y]) {
                return curr;
            }

            // Otherwise add neighbours (regardless of whether they are a wall)
            Set<Pixel> neighbours = new HashSet<>();

            if (curr.x > 0) {
                neighbours.add(new Pixel(curr.x-1, curr.y));
            }
            if (curr.x < grid.length - 1) {
                neighbours.add(new Pixel(curr.x+1, curr.y));
            }
            if (curr.y > 0) {
                neighbours.add(new Pixel(curr.x, curr.y-1));
            }
            if (curr.y < grid[0].length - 1) {
                neighbours.add(new Pixel(curr.x, curr.y+1));
            }

            for (Pixel n : neighbours) {
                if (!visited[n.x][n.y]) {
                    visited[n.x][n.y] = true;
                    queue.offer(n);
                }
            }
        }

        return null;
    }

    /**
     * Get the shortest path using BFS.
     * @param src .
     * @param tgt .
     * @return Path as a List of Pixels, or NULL if unreachable.
     */
    public List<Pixel> getShortestPath(Pixel src, Pixel tgt) {
        // If src/tgt is a wall, replace with first, closest pixel that's not a wall
        src = getClosestNonWall(src, APPROX_DIAM);
        tgt = getClosestNonWall(tgt, APPROX_DIAM);

        if (src == null || tgt == null) {
            throw new IllegalArgumentException("You've selected a wall. Please move your endpoints.");
        }

        boolean[][] visited = new boolean[grid.length][grid[0].length];
        Pixel[][] parentGraph = new Pixel[grid.length][grid[0].length];
        LinkedList<Pixel> queue = new LinkedList<>();
        queue.add(src);
        visited[src.x][src.y] = true;

        while(!queue.isEmpty()) {
            Pixel curr = queue.poll();
            if (curr.equals(tgt)) {
                return getPathFromParentGraph(parentGraph, src, tgt);
            }

            for (Pixel n : getNeighbors(curr)) {
                if (!visited[n.x][n.y]) {
                    visited[n.x][n.y] = true;
                    parentGraph[n.x][n.y] = curr;
                    queue.offer(n);
                }
            }
        }

        throw new IllegalArgumentException("Unable to find a path - points may be unreachable.");
    }

    public static class Pixel {
        public int x;
        public int y;

        public Pixel(int x, int y) {
            this.x = x;
            this.y = y;
        }

        public boolean equals(Object other) {
            if (!(other instanceof Pixel)) {
                return false;
            }
            Pixel otherPixel = (Pixel) other;
            return otherPixel.x == x && otherPixel.y == y;
        }

        public String toString() {
            return "(" + x + ", " + y + ")";
        }
    }

    /**
     * Helper - converts BufferedImage to RGB int[][]
     * @param image .
     * @return .
     */
    private static int[][] toRGBArray(BufferedImage image) {

        final byte[] pixels = ((DataBufferByte) image.getRaster().getDataBuffer()).getData();
        final int width = image.getWidth();
        final int height = image.getHeight();
        final int numComponents = image.getColorModel().getNumComponents();

        int[][] result = new int[width][height];
        if (numComponents == 4) { // ALPHA RGB
            final int pixelLength = 4;
            for (int pixel = 0, row = 0, col = 0; pixel < pixels.length; pixel += pixelLength) {
                int argb = 0;
                argb += (((int) pixels[pixel] & 0xff) << 24); // alpha
                argb += ((int) pixels[pixel + 1] & 0xff); // blue
                argb += (((int) pixels[pixel + 2] & 0xff) << 8); // green
                argb += (((int) pixels[pixel + 3] & 0xff) << 16); // red
                result[col][row] = argb;
                col++;
                if (col == width) {
                    col = 0;
                    row++;
                }
            }
        } else if (numComponents == 3) { // RGB
            final int pixelLength = 3;
            for (int pixel = 0, row = 0, col = 0; pixel < pixels.length; pixel += pixelLength) {
                int argb = 0;
                argb += -16777216; // 255 alpha
                argb += ((int) pixels[pixel] & 0xff); // blue
                argb += (((int) pixels[pixel + 1] & 0xff) << 8); // green
                argb += (((int) pixels[pixel + 2] & 0xff) << 16); // red
                result[col][row] = argb;
                col++;
                if (col == width) {
                    col = 0;
                    row++;
                }
            }
        } else if (numComponents == 1) { // BnW
            for (int x = 0; x < width; x++) {
                for (int y = 0; y < height; y++) {
                    result[x][y] = image.getRGB(x, y);
                }
            }
        }

        return result;
    }

    public static boolean[][] gridFromImg(BufferedImage img) throws IOException {
        int width = img.getWidth();
        int height = img.getHeight();
        boolean[][] grid = new boolean[width][height];

        for (int i = 0; i < width; i++) {
            for (int j = 0; j < height; j++) {
                // Store whether a pixel is passable
                int redness = ((img.getRGB(i, j) >> 16) & 0xFF); // Using redness as a proxy for BnW intensity
                grid[i][j] = redness < 50; // TODO: what should this threshold be?
            }
        }
        return grid;
    }

    /**
     * Finds a path from src to tgt over the graph, and draws it over the floorPlan before returning it.
     * @param floorPlan image of floorplan. Only used for eyeballing.
     * @param graphImg the output of our neural network - connectivity.
     * @param src .
     * @param tgt .
     * @return edited floorplan image
     */
    public static BufferedImage drawPath(BufferedImage floorPlan, BufferedImage graphImg, Pixel src, Pixel tgt) throws IOException {
        FloorGraph g = new FloorGraph(gridFromImg(graphImg));

        // Shift src and tgt to something on screen
        Pixel boundedSrc = new Pixel(Math.min(Math.max(src.x, 0), g.grid.length - 1), Math.min(Math.max(src.y, 0), g.grid[0].length - 1));
        Pixel boundedTgt = new Pixel(Math.min(Math.max(tgt.x, 0), g.grid.length - 1), Math.min(Math.max(tgt.y, 0), g.grid[0].length - 1));

        // Do BFS, then draw the path over in bright red
        final int RED = -16777216 + (255 << 16);
        Optional.ofNullable(g.getShortestPath(boundedSrc, boundedTgt))
                .orElse(new LinkedList<>())
                .forEach(p -> {
                    final int LINE_THICKNESS = 10;
                    for (int i = -LINE_THICKNESS + 1; i < LINE_THICKNESS; i++) {
                        for (int j = -LINE_THICKNESS + 1; j < LINE_THICKNESS; j++) {
                            int newX = p.x + i;
                            int newY = p.y + j;
                            if (newX < 0 || newX >= g.grid.length || newY < 0 || newY >= g.grid[0].length) {
                                continue;
                            }
                            floorPlan.setRGB(p.x + i, p.y + j, RED);
                        }
                    }
                });
        return floorPlan;
    }

    public static void main(String[] args) {
        try {
            // Load the image
            String imagePath = "/Users/oliverchan/Desktop/test.png";
            String graphPath = "/Users/oliverchan/Desktop/test.png";

            // Compute the path image
            BufferedImage img = ImageIO.read(new File(imagePath));
            BufferedImage graphImg = ImageIO.read(new File(graphPath));
            Pixel src = new Pixel(2000, -5);
            Pixel tgt = new Pixel(3001, 1500);
            BufferedImage drawnPath = drawPath(img, graphImg, src, tgt);

            // Save the image as "path.png"
            File outputfile = new File("/Users/oliverchan/Desktop/path.png");
            ImageIO.write(drawnPath, "png", outputfile);

        } catch (IOException ioe) {
            System.out.println("Caught an IO Exception: " + ioe.getMessage());
        }
    }
}
