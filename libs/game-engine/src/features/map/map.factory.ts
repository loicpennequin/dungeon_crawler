import { Point, randomInt, subVector } from '@dungeon-crawler/shared';
import type { MapGenerator } from './types';
import { WIDTH } from '../../constants';
import { ECSWorld } from '../ecs/ECSWorld';
import { GameState } from '../../gameState';
import { createCell } from './cell.factory';

export const CELL_TYPES = {
  GROUND: 0, // walkable, doesn't block vision and projectiles
  WATER: 1, // not walkable, doesn't block vision or projectiles
  WALL: 2 // not walkabe, blocks vision and projectiles
} as const;
export type CellType = 0 | 1 | 2; // GROUND / water / wall

export type Tileset = 'base';

export type MapCell = Point & {
  type: CellType;
};

export type MapFactoryOptions = {
  width: number;
  height: number;
  tileset: Tileset;
  generator: MapGenerator<MapCell>;
};

export type GameMap = {
  width: number;
  height: number;
  init(state: GameState): void;
  getValidSpawnPoint(): Point;
  getCellAt(pt: Point): MapCell;
  serialize(): SerializedMap;
};

export type SerializedMap = {
  id: number;
  width: number;
  height: number;
  tileset: Tileset;
  rows: CellType[][];
};
export const MAP_CHUNK_SIZE = WIDTH;

export const createGameMap = ({
  width,
  height,
  tileset,
  generator
}: MapFactoryOptions): GameMap => {
  const chunkCoordsToIndex = ({ x, y }: Point) => MAP_CHUNK_SIZE * y + x;
  const getChunkKey = ({ x, y }: Point) => `${x}:${y}`;

  // map of tile chunks, indexed by their top-left stringified coordinates
  const chunks = new Map<string, MapCell[]>();

  const getOrCreateChunk = ({ x, y }: Point) => {
    const key = getChunkKey({ x, y });

    if (!chunks.has(key)) {
      chunks.set(
        key,
        generator.getChunk({
          width: x + MAP_CHUNK_SIZE > width ? width - x : MAP_CHUNK_SIZE,
          height: y + MAP_CHUNK_SIZE > height ? height - y : MAP_CHUNK_SIZE,
          startsAt: { x, y }
        })
      );
    }

    return chunks.get(key)!;
  };

  const map: GameMap = {
    width,
    height,

    init(state) {
      const chunk = getOrCreateChunk({ x: 0, y: 0 });

      chunk.forEach(cell => {
        if (cell.type !== CELL_TYPES.GROUND) {
          createCell(state, cell);
        }
      });
    },

    getCellAt({ x, y }) {
      const topLeft = {
        x: MAP_CHUNK_SIZE * Math.floor(x / MAP_CHUNK_SIZE),
        y: MAP_CHUNK_SIZE * Math.floor(y / MAP_CHUNK_SIZE)
      };

      const chunk = getOrCreateChunk(topLeft);
      const index = chunkCoordsToIndex(subVector({ x, y }, topLeft));

      return chunk[index];
    },

    getValidSpawnPoint() {
      let point = { x: randomInt(width), y: randomInt(height) };
      let cell = map.getCellAt(point);

      while (cell.type !== CELL_TYPES.GROUND) {
        point = { x: randomInt(width), y: randomInt(height) };
        cell = map.getCellAt(point);
      }

      return point;
    },

    serialize() {
      const rows: CellType[][] = [];
      for (let y = 0; y < height; y++) {
        const row: CellType[] = [];
        rows.push(row);
        for (let x = 0; x < width; x++) {
          row.push(map.getCellAt({ x, y }).type);
        }
      }

      return {
        id: 1,
        width,
        height,
        tileset,
        rows
      };
    }
  };

  return map;
};
