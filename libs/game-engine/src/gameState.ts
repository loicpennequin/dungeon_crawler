import { mapRange } from '@dungeon-crawler/shared';
import { HEIGHT, SEED, WIDTH } from './constants';
import { ECSWorld, createWorld } from './features/ecs/ECSWorld';
import { createNoiseGenerator } from './features/map/generators/noise';
import { CELL_TYPES, GameMap, createGameMap } from './features/map/map.factory';
import { physicsSystem } from './features/physics/physics.system';

export type GameState = {
  isRunning: boolean;
  world: ECSWorld;
  map: GameMap;
};

export const createGameState = (): GameState => {
  const state: GameState = {
    isRunning: false,
    map: createGameMap({
      width: WIDTH,
      height: HEIGHT,
      generator: createNoiseGenerator({
        seed: SEED,
        scale({ x, y, value }) {
          const normalized = mapRange(value, [-1, 1], [0, 1]);

          if (normalized < 0.005) {
            return { x, y, type: CELL_TYPES.WATER };
          }
          if (normalized > 0.7) {
            return { x, y, type: CELL_TYPES.WALL };
          }
          return { x, y, type: CELL_TYPES.GROUND };
        }
      })
    }),
    world: createWorld()
  };

  state.world.addSystem('physics', physicsSystem(state));
  return state;
};
