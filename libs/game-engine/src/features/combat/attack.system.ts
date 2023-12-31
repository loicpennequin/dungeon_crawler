import {
  circleRectIntersection,
  deg2Rad,
  dist,
  rad2Deg,
  subVector
} from '@dungeon-crawler/shared';
import { GameZoneState } from '../../gameZone';
import { ECSEntity } from '../ecs/ECSEntity';
import { ECSSystem } from '../ecs/ECSSystem';
import { BBox, bbox, orientation, rectToBBox } from '../physics/physics.components';
import { Player, player } from '../player/player.components';
import {
  Animatable,
  Spritable,
  animatable,
  spritable
} from '../render/render.components';
import { Attacker, attacker } from './combat.components';
import { sprites } from '@dungeon-crawler/resources/src/sprites';
import { Monster, monster } from '../monster/monster.components';

export const attackSystem = (
  zone: GameZoneState
): ECSSystem<[Attacker, Spritable, Animatable]> => {
  const handlePlayerAttack = (player: ECSEntity & BBox & Attacker & Player) => {
    const { range, shape, angle } = player.player.character.attack;

    const attackBbox = rectToBBox({
      x: player.bbox.x,
      y: player.bbox.y,
      width: range,
      height: range
    });

    const attackVector = subVector(player.attacker.target!, player.bbox);
    const attackAngle = rad2Deg(Math.atan2(attackVector.y, attackVector.x));
    const minAngle = attackAngle - angle / 2;
    const maxAngle = attackAngle + angle / 2;

    const struckEntities = zone.tree
      .search(attackBbox)
      .filter<ECSEntity & BBox & Monster & Animatable & Spritable>(
        (entity): entity is ECSEntity & BBox & Monster & Animatable & Spritable => {
          if (entity.entity_id === player.entity_id) return false;
          if (player.attacker.struckTargets.includes(entity.entity_id)) return false;

          if (!monster.has(entity) || !animatable.has(entity) || !spritable.has(entity)) {
            return false;
          }

          const intersections = circleRectIntersection(
            { x: player.bbox.x, y: player.bbox.y, radius: range },
            entity.bbox
          );
          if (!intersections.length) return false;
          // console.log('==');
          return intersections.some(point => {
            const intersectionVector = subVector(point, player.bbox);
            const intersectionAngle = rad2Deg(
              Math.atan2(intersectionVector.y, intersectionVector.x)
            );

            return intersectionAngle >= minAngle && intersectionAngle <= maxAngle;
          });
        }
      );

    struckEntities.forEach(entity => {
      entity.animatable.state = 'hit';
      if (orientation.has(entity)) {
        entity.orientation = player.bbox.x < entity.bbox.x ? 'left' : 'right';
      }
    });
  };

  return {
    target: [attacker.brand, spritable.brand, animatable.brand],
    run(world, props, entities) {
      entities.forEach(entity => {
        if (entity.animatable.state !== 'attacking') {
          entity.attacker.target = null;
          entity.attacker.struckTargets = [];
          return;
        }

        if (!entity.attacker.target) return;

        if (orientation.has(entity) && bbox.has(entity)) {
          entity.orientation =
            entity.attacker.target.x > entity.bbox.x ? 'right' : 'left';
        }

        if (player.has(entity) && bbox.has(entity)) {
          handlePlayerAttack(entity);
        }
      });
    }
  };
};
