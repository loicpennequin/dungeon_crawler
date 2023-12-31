import { GameState, createGameState } from './gameState';
import { createEmitter } from './emitter';
import { EventMap, inferEventInput } from './events';
import { TICK_RATE } from './constants';
import { stringify } from 'zipson';
import { SerializedGameZoneState } from './gameZone';

export type { EventMap };
export {
  type CellType,
  type Tileset,
  type MapCell,
  CELL_TYPES
} from './features/map/factories/map.factory';
export type { SerializedGameZoneState };

export type SerializedPlayerState = SerializedGameZoneState;

export type SerializedGameState = Record<string, SerializedPlayerState>;

export type DispatchFunction = <T extends keyof EventMap>(
  type: T,
  payload: inferEventInput<T>
) => void;

export type GameEngine = {
  dispatch: DispatchFunction;
  subscribe: (cb: (state: SerializedGameState) => void) => () => void;
  start: () => void;
  stop: () => void;
};

export type GameFactory = (opts: { debug?: boolean }) => GameEngine;

const tickDuration = 1000 / TICK_RATE;
const perfWarning = (elapsed: number) => {
  console.log(
    `tick duration over performance budget by ${(elapsed - tickDuration).toFixed(1)}ms`
  );
};

export const createGame: GameFactory = ({ debug = false }) => {
  const state = createGameState();
  const emitter = createEmitter(state);
  const eventQueue: Set<{ type: keyof EventMap; payload: any }> = new Set();

  if (debug) {
    emitter.on('*', (e, payload) => {
      if (e === 'tick') return;
      console.log(e, payload);
    });
  }
  let interval: ReturnType<typeof setInterval> | null;
  let lastTick = performance.now();

  const tick = () => {
    const now = performance.now();
    const delta = now - lastTick;

    eventQueue.forEach(event => {
      emitter.emit(event.type, event.payload);
    });
    eventQueue.clear();

    state.zones.forEach(zone => {
      zone.run(delta, now);
    });

    lastTick = now;

    emitter.emit('tick', state);

    const elapsed = performance.now() - now;
    if (elapsed > tickDuration) {
      perfWarning(elapsed);
    }
  };

  const serializeState = (state: GameState): SerializedGameState => {
    const serialized: SerializedGameState = Object.fromEntries(
      state.players.map(player => {
        const zone = state.zones.find(z => z.id === player.currentZoneId);
        if (!zone) {
          throw new Error(
            `Could not find zone for player ${player.id}: ${player.currentZoneId}`
          );
        }

        return [
          player.id,
          stringify(zone.serialize(Date.now())) as unknown as SerializedGameZoneState
        ];
      })
    );

    return serialized;
  };

  return {
    dispatch(type, payload) {
      eventQueue.add({ type, payload });
    },

    subscribe(cb) {
      const _cb = (state: GameState) => {
        cb(serializeState(state));
      };
      emitter.on('tick', _cb);

      return () => {
        emitter.off('tick', _cb);
      };
    },

    start() {
      if (interval) return;
      interval = setInterval(tick, tickDuration);
    },

    stop() {
      if (!interval) return;
      clearInterval(interval);
      interval = null;
    }
  };
};
