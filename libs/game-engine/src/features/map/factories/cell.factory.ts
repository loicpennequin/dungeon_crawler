import { Point } from '@dungeon-crawler/shared';
import { BBox, Collidable, bbox, collidable } from '../../physics/physics.components';
import { ECSEntity } from '../../ecs/ECSEntity';
import { CELL_TYPES, CellType } from './map.factory';
import { Obstacle, obstacle } from '../map.components';
import { GameZoneState } from '../../../gameZone';

export type CellEntity = ECSEntity & BBox & Obstacle & Collidable;

export const createCell = (
  state: GameZoneState,
  { x, y, type }: Point & { type: CellType }
): CellEntity => {
  const entity = state.world
    .createEntity()
    .with(
      bbox.component({
        x: x + 0.5,
        y: y + 0.5,
        width: 1,
        height: 1
      })
    )
    .with(
      obstacle.component({
        isWall: type === CELL_TYPES.WATER,
        isWater: type === CELL_TYPES.WATER,
        isRendered: false
      })
    )
    .with(collidable.component(true))
    .build();

  state.tree.insert(entity);

  return entity;
};
