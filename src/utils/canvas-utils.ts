import Konva from 'konva';

/**
 * Finds the selectable ancestor of a given node.
 * @param node - The starting node.
 * @returns The selectable ancestor node or null.
 */
export function findSelectableAncestor(
  node: Konva.Node | null
): Konva.Node | null {
  while (node && node.getType() !== 'Stage') {
    if (node.name && node.name().includes('selectable')) return node;
    node = node.getParent();
  }
  return null;
}
