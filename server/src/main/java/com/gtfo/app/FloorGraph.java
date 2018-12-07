package com.gtfo.app;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.*;

public final class FloorGraph {

    private boolean[][] grid;

    /**
     * Construct the floor-plan graph given processed image
     *
     * @param path to image file
     */
    public FloorGraph(String path) throws IOException {
        BufferedImage img = null;
        img = ImageIO.read(new File(path));

        int width = img.getWidth();
        int height = img.getHeight();
        boolean[][] grid = new boolean[width][height];

        for (int i = 0; i < width; i++) {
            for (int j = 0; j < height; j++) {
                grid[i][j] = img.getRGB(i, j)  != 0;
            }
        }
        this.grid = grid;
    }

    public FloorGraph(boolean[][] grid) {
        this.grid = grid;
    }


    Set<Pixel> getNeighbors(Pixel p) {
        int x = p.x;
        int y = p.y;

        if (x < 0 || x >= grid.length || y < 0 || y >= grid[0].length) {
            throw new IllegalArgumentException("Coordinates out of bounds");
        }

        if (!grid[x][y]) {
            throw new IllegalArgumentException("Pixel black");
        }

        Set<Pixel> out = new HashSet<>();

        if (x > 0 && grid[x-1][y]) {
            out.add(new Pixel(x-1, y));
        }
        if (x < grid.length - 1 && grid[x+1][y]) {
            out.add(new Pixel(x+1, y));
        }
        if (y > 0 && grid[x][y-1]) {
            out.add(new Pixel(x, y-1));
        }
        if (y < grid.length - 1 && grid[x][y+1]) {
            out.add(new Pixel(x, y+1));
        }
        return out;
    }

    // helper to trace path for getShortestPath
    static List<Pixel> getPathFromParents(Pixel[][] parent, Pixel src, Pixel tgt) {
        Pixel curr = tgt;
        LinkedList<Pixel> out = new LinkedList<>();

        while (!curr.equals(src)) {
            out.offerFirst(curr);
            curr = parent[curr.x][curr.y];
        }

        out.offerFirst(src);
        return out;
    }

    /**
     * Get the shortest path using BFS.
     * @param src
     * @param tgt
     * @return path or null if none exists
     */
    public List<Pixel> getShortestPath(Pixel src, Pixel tgt) {
        boolean[][] visited = new boolean[grid.length][grid[0].length];
        Pixel[][] parent = new Pixel[grid.length][grid[0].length];
        LinkedList<Pixel> queue = new LinkedList<>();
        queue.add(src);
        visited[src.x][src.y] = true;

        while(!queue.isEmpty()) {
            Pixel curr = queue.poll();
            if (curr.equals(tgt)) {
                return getPathFromParents(parent, src, tgt);
            }

            for (Pixel n : getNeighbors(curr)) {
                if (!visited[n.x][n.y]) {
                    visited[n.x][n.y] = true;
                    parent[n.x][n.y] = curr;
                    queue.offer(n);
                }
            }
        }

        return null;
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

    public static void main(String[] args) {
        boolean[][] grid = new boolean[][] {{true, true, false},
                                            {true, true, true},
                                            {false, true, true}};
        FloorGraph g = new FloorGraph(grid);
        System.out.println(g.getShortestPath(new Pixel(0, 0), new Pixel(2, 2)));
    }
}
