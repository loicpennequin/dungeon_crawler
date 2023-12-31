/**
 *  THE CONTENT OF THIS FILE IS AUTOGENERATED BY THE CLI. DONT EDIT IT DIRECTLY
 *  If you need to edit the template, to to libs/cli/src/commands/feature.ts
 */
import { mergeQueryKeys, type inferQueryKeyStore } from '@lukemorales/query-key-factory';
import { authKeys } from '../auth/utils/auth.keys';
import { gameKeys } from '../game/utils/game.keys';

export const queryKeys = mergeQueryKeys(authKeys, gameKeys);
export type QueryKeys = inferQueryKeyStore<typeof queryKeys>;
