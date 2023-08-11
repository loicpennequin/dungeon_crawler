import { Io } from '../core/io';
import { Emitter } from '../core/providers/event-emitter';
import { GameRepository } from './game.repository';
import { GameInstancePool } from './gameInstance.pool';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';

type Dependencies = {
  emitter: Emitter;
  gameInstancePool: GameInstancePool;
  gameRepo: GameRepository;
  io: Io;
};

export type GameSubscribers = () => void;

export const gameSubscribers = ({
  emitter,
  gameInstancePool,
  gameRepo,
  io
}: Dependencies): GameSubscribers => {
  return () => {
    emitter.on('GAME_CREATED', async game => {
      const worker = gameInstancePool.spawn(game.id);

      if (E.isLeft(worker)) {
        await gameRepo.delete(game.id);
      }
    });

    emitter.on('USER_JOINED_GAME', ({ game, user }) => {
      const instance = gameInstancePool.getInstance(game.id);
      const socket = io.getSocketFromUserId(user.id);

      if (O.isSome(socket)) {
        socket.value.join(game.id);
      }

      if (O.isSome(instance)) {
        instance.value.dispatch('join', { id: user.id });
        if (game.players.length === 1) {
          instance.value.start();
        }
      }
    });

    emitter.on('USER_LEFT_GAME', ({ game, user }) => {
      const instance = gameInstancePool.getInstance(game.id);
      const socket = io.getSocketFromUserId(user.id);

      if (O.isSome(socket)) {
        socket.value.leave(game.id);
      }

      if (O.isSome(instance)) {
        instance.value.dispatch('leave', { id: user.id });
        if (!game.players.length) {
          instance.value.stop();
          instance.value.scheduleShutdown();
        }
      }
    });
  };
};
