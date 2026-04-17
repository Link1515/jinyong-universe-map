import cytoscape, { type Core, type EdgeSingular, type ElementDefinition, type NodeSingular } from 'cytoscape'
import type { VisibleGraph } from '../types'

const NODE_WIDTH = 92
const NODE_HEIGHT = 54
const MIN_NODE_SPACING = 168
const BASE_RING_RADIUS = 230
const COMPONENT_PADDING = 280
const NODE_COLLISION_GAP = 46
const EDGE_AVOIDANCE_GAP = 58
const POST_LAYOUT_PASSES = 84
const MAX_POST_LAYOUT_SHIFT = 14
const RELATED_EDGE_LENGTH = 275

interface Point {
  x: number
  y: number
}

interface GraphCallbacks {
  onNodeSelect: (nodeId: string) => void
  onEdgeSelect: (edgeId: string) => void
}

interface GraphViewApi {
  update: (graph: VisibleGraph) => void
  highlightNode: (nodeId: string | null) => void
  setSelection: (nodeId: string | null, edgeId: string | null) => void
  zoomIn: () => void
  zoomOut: () => void
  fit: () => void
  destroy: () => void
}

export function createGraphView(container: HTMLElement, callbacks: GraphCallbacks): GraphViewApi {
  const positions = new Map<string, { x: number; y: number }>()
  let hasRenderedGraph = false
  const zoomStep = 1.15

  const root = document.createElement('div')
  root.className = 'graph-shell'
  container.append(root)

  const cy = cytoscape({
    container: root,
    elements: [],
    layout: { name: 'preset' },
    wheelSensitivity: 2.2,
    minZoom: 0.18,
    maxZoom: 2.4,
    boxSelectionEnabled: false,
    style: [
      {
        selector: 'node',
        style: {
          'background-color': '#fff7eb',
          shape: 'round-rectangle',
          'border-width': 2,
          'border-color': 'rgba(79, 57, 29, 0.28)',
          label: 'data(name)',
          color: '#382b1e',
          'font-size': 15,
          'font-weight': 700,
          'text-wrap': 'wrap',
          'text-max-width': 72,
          'text-halign': 'center',
          'text-valign': 'center',
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
          'overlay-opacity': 0,
        },
      },
      {
        selector: 'edge',
        style: {
          width: 'mapData(weight, 1, 5, 2, 6)',
          'line-color': 'data(color)',
          'target-arrow-color': 'data(color)',
          'target-arrow-shape': 'data(arrowShape)',
          'curve-style': 'data(curveStyle)',
          'control-point-distances': 'data(controlPointDistances)',
          'control-point-weights': '0.5',
          'loop-direction': '-45deg',
          'loop-sweep': '60deg',
          'line-style': 'data(lineStyle)',
          label: 'data(label)',
          color: '#6d543d',
          'font-size': 11,
          'text-background-color': 'rgba(255, 248, 237, 0.92)',
          'text-background-opacity': 1,
          'text-background-padding': 4,
          'text-rotation': 'autorotate',
          'text-margin-y': -6,
          'overlay-opacity': 0,
          'z-index': 1,
        },
      },
      {
        selector: '.is-selected',
        style: {
          'border-color': '#8c3b2a',
          'border-width': 4,
          'line-color': '#8c3b2a',
          'target-arrow-color': '#8c3b2a',
          opacity: 1,
          'z-index': 999,
        },
      },
      {
        selector: '.is-highlighted',
        style: {
          'border-color': '#8c3b2a',
          'border-width': 4,
          'background-color': '#fff2df',
          opacity: 1,
        },
      },
      {
        selector: '.is-muted',
        style: {
          opacity: 0.18,
        },
      },
    ] as any,
  })

  cy.on('tap', 'node', event => {
    callbacks.onNodeSelect(event.target.id())
  })

  cy.on('tap', 'edge', event => {
    callbacks.onEdgeSelect(event.target.id())
  })

  cy.on('tap', event => {
    if (event.target === cy) {
      callbacks.onNodeSelect('')
      callbacks.onEdgeSelect('')
    }
  })

  cy.on('dragfree', 'node', event => {
    const position = event.target.position()
    positions.set(event.target.id(), { x: position.x, y: position.y })
  })

  const resizeObserver = new ResizeObserver(() => {
    cy.resize()
    if (!hasRenderedGraph || cy.elements().empty()) {
      return
    }
    fitGraph(cy)
  })

  resizeObserver.observe(container)

  function update(graph: VisibleGraph): void {
    cy.nodes().forEach(node => {
      const position = node.position()
      positions.set(node.id(), { x: position.x, y: position.y })
    })

    const seedPositions = buildSeedPositions(graph)

    const nodeElements: ElementDefinition[] = graph.characters.map(character => {
      const position = positions.get(character.id) ?? seedPositions.get(character.id)

      return {
        group: 'nodes',
        data: {
          id: character.id,
          name: character.name,
          title: character.title,
        },
        ...(position ? { position } : {}),
      }
    })

    const edgeRouteData = buildEdgeRouteData(graph)
    const edgeElements: ElementDefinition[] = graph.relationships.map(relationship => {
      const routeData = edgeRouteData.get(relationship.id)

      return {
        group: 'edges',
        data: {
          id: relationship.id,
          source: relationship.source,
          target: relationship.target,
          label: relationship.label,
          weight: relationship.weight,
          color: relationship.typeConfig?.color ?? '#666666',
          lineStyle: toCyLineStyle(relationship.typeConfig?.line),
          arrowShape: relationship.directed ? 'triangle' : 'none',
          curveStyle: routeData?.curveStyle ?? 'unbundled-bezier',
          controlPointDistances: routeData?.controlPointDistances ?? 0,
        },
      }
    })

    cy.elements().remove()
    cy.add([...nodeElements, ...edgeElements])

    const layout = cy.layout({
      name: 'cose',
      animate: false,
      fit: false,
      randomize: false,
      padding: 160,
      nodeRepulsion(node) {
        return 520000 + node.degree(false) * 72000
      },
      nodeOverlap: 80,
      idealEdgeLength(edge) {
        const weight = Number(edge.data('weight')) || 1
        return RELATED_EDGE_LENGTH + Math.max(0, 5 - weight) * 30
      },
      edgeElasticity(edge) {
        const weight = Number(edge.data('weight')) || 1
        return 92 + weight * 18
      },
      gravity: 0.05,
      componentSpacing: 360,
      nestingFactor: 0.65,
      numIter: 5200,
      initialTemp: 1200,
      coolingFactor: 0.97,
    })

    layout.run()
    improveGraphSpacing(cy)
    fitGraph(cy)
    hasRenderedGraph = true

    cy.nodes().forEach(node => {
      const position = node.position()
      positions.set(node.id(), { x: position.x, y: position.y })
    })
  }

  function highlightNode(nodeId: string | null): void {
    cy.elements().removeClass('is-highlighted is-selected is-muted')

    if (!nodeId) {
      return
    }

    const node = cy.getElementById(nodeId)
    if (!node.nonempty()) {
      return
    }

    const connected = node.closedNeighborhood()
    cy.elements().difference(connected.union(node)).addClass('is-muted')
    node.addClass('is-highlighted is-selected')
    connected.edges().addClass('is-highlighted')
    cy.animate({
      center: { eles: node },
      zoom: Math.min(1.4, cy.maxZoom()),
      duration: 220,
    })
  }

  function setSelection(nodeId: string | null, edgeId: string | null): void {
    cy.elements().removeClass('is-selected')

    if (!nodeId && !edgeId) {
      cy.elements().removeClass('is-highlighted is-muted')
    }

    if (nodeId) {
      const node = cy.getElementById(nodeId)
      if (node.nonempty()) {
        node.addClass('is-selected')
      }
    }

    if (edgeId) {
      const edge = cy.getElementById(edgeId)
      if (edge.nonempty()) {
        edge.addClass('is-selected')
      }
    }
  }

  function destroy(): void {
    resizeObserver.disconnect()
    cy.destroy()
    root.remove()
  }

  return {
    update,
    highlightNode,
    setSelection,
    zoomIn() {
      zoomByStep(cy, zoomStep)
    },
    zoomOut() {
      zoomByStep(cy, 1 / zoomStep)
    },
    fit() {
      fitGraph(cy)
    },
    destroy,
  }
}

function fitGraph(cy: Core): void {
  if (cy.elements().empty()) {
    return
  }

  cy.fit(cy.elements(), 72)

  const nextZoom = Math.min(cy.zoom(), 0.88)
  if (nextZoom !== cy.zoom()) {
    cy.zoom({
      level: nextZoom,
      renderedPosition: {
        x: cy.width() / 2,
        y: cy.height() / 2,
      },
    })
  }

  cy.center()
}

function zoomByStep(cy: Core, multiplier: number): void {
  if (cy.elements().empty()) {
    return
  }

  const currentZoom = cy.zoom()
  const nextZoom = Math.max(cy.minZoom(), Math.min(currentZoom * multiplier, cy.maxZoom()))
  if (nextZoom === currentZoom) {
    return
  }

  cy.zoom({
    level: nextZoom,
    renderedPosition: {
      x: cy.width() / 2,
      y: cy.height() / 2,
    },
  })
}

function toCyLineStyle(line: 'solid' | 'dashed' | 'dotted' | undefined): 'solid' | 'dashed' | 'dotted' {
  if (line === 'dashed' || line === 'dotted') {
    return line
  }

  return 'solid'
}

function buildEdgeRouteData(graph: VisibleGraph): Map<
  string,
  {
    curveStyle: 'straight' | 'unbundled-bezier'
    controlPointDistances: number
  }
> {
  const edgeGroups = new Map<string, string[]>()

  graph.relationships.forEach(relationship => {
    const key = [relationship.source, relationship.target].sort().join('::')
    const edgeIds = edgeGroups.get(key) ?? []
    edgeIds.push(relationship.id)
    edgeGroups.set(key, edgeIds)
  })

  const routeData = new Map<
    string,
    {
      curveStyle: 'straight' | 'unbundled-bezier'
      controlPointDistances: number
    }
  >()

  edgeGroups.forEach(edgeIds => {
    if (edgeIds.length === 1) {
      routeData.set(edgeIds[0], {
        curveStyle: 'unbundled-bezier',
        controlPointDistances: 18,
      })
      return
    }

    const centerIndex = (edgeIds.length - 1) / 2
    edgeIds.forEach((edgeId, index) => {
      const offset = (index - centerIndex) * 44
      routeData.set(edgeId, {
        curveStyle: 'unbundled-bezier',
        controlPointDistances: offset === 0 ? 18 : offset,
      })
    })
  })

  return routeData
}

function improveGraphSpacing(cy: Core): void {
  const nodes = cy.nodes().toArray()
  const edges = cy.edges().toArray()

  if (nodes.length < 2) {
    return
  }

  for (let pass = 0; pass < POST_LAYOUT_PASSES; pass += 1) {
    let totalShift = 0

    totalShift += pullConnectedNodesCloser(edges)
    totalShift += separateOverlappingNodes(nodes)
    totalShift += moveNodesAwayFromEdges(nodes, edges)

    if (totalShift < 0.5) {
      break
    }
  }
}

function pullConnectedNodesCloser(edges: EdgeSingular[]): number {
  let totalShift = 0

  edges.forEach(edge => {
    const source = edge.source()
    const target = edge.target()
    const sourcePosition = source.position()
    const targetPosition = target.position()
    const dx = targetPosition.x - sourcePosition.x
    const dy = targetPosition.y - sourcePosition.y
    const distance = Math.hypot(dx, dy)

    if (distance === 0) {
      return
    }

    const weight = Number(edge.data('weight')) || 1
    const targetDistance = RELATED_EDGE_LENGTH + Math.max(0, 5 - weight) * 24

    if (distance <= targetDistance) {
      return
    }

    const shift = Math.min((distance - targetDistance) * 0.028, MAX_POST_LAYOUT_SHIFT)
    const unitX = dx / distance
    const unitY = dy / distance

    moveNode(source, unitX * shift, unitY * shift)
    moveNode(target, -unitX * shift, -unitY * shift)
    totalShift += shift * 2
  })

  return totalShift
}

function separateOverlappingNodes(nodes: NodeSingular[]): number {
  let totalShift = 0
  const minXDistance = NODE_WIDTH + NODE_COLLISION_GAP
  const minYDistance = NODE_HEIGHT + NODE_COLLISION_GAP

  for (let leftIndex = 0; leftIndex < nodes.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < nodes.length; rightIndex += 1) {
      const left = nodes[leftIndex]
      const right = nodes[rightIndex]
      const leftPosition = left.position()
      const rightPosition = right.position()
      let dx = rightPosition.x - leftPosition.x
      let dy = rightPosition.y - leftPosition.y

      if (Math.abs(dx) >= minXDistance || Math.abs(dy) >= minYDistance) {
        continue
      }

      if (dx === 0 && dy === 0) {
        dx = deterministicOffset(left.id(), right.id())
        dy = deterministicOffset(right.id(), left.id())
      }

      const overlapX = minXDistance - Math.abs(dx)
      const overlapY = minYDistance - Math.abs(dy)

      if (overlapX < overlapY) {
        const shift = Math.min(overlapX / 2, MAX_POST_LAYOUT_SHIFT)
        const direction = Math.sign(dx) || 1
        moveNode(left, -shift * direction, 0)
        moveNode(right, shift * direction, 0)
        totalShift += shift * 2
      } else {
        const shift = Math.min(overlapY / 2, MAX_POST_LAYOUT_SHIFT)
        const direction = Math.sign(dy) || 1
        moveNode(left, 0, -shift * direction)
        moveNode(right, 0, shift * direction)
        totalShift += shift * 2
      }
    }
  }

  return totalShift
}

function moveNodesAwayFromEdges(nodes: NodeSingular[], edges: EdgeSingular[]): number {
  let totalShift = 0

  edges.forEach(edge => {
    const source = edge.source()
    const target = edge.target()
    const sourcePosition = source.position()
    const targetPosition = target.position()

    nodes.forEach(node => {
      if (node.same(source) || node.same(target)) {
        return
      }

      const nodePosition = node.position()
      const projection = projectPointToSegment(nodePosition, sourcePosition, targetPosition)

      if (projection.distance >= EDGE_AVOIDANCE_GAP) {
        return
      }

      const fallback = perpendicularUnit(sourcePosition, targetPosition)
      const direction = normalizePoint({
        x: nodePosition.x - projection.point.x,
        y: nodePosition.y - projection.point.y,
      }) ?? fallback
      const shift = Math.min((EDGE_AVOIDANCE_GAP - projection.distance) * 0.36, MAX_POST_LAYOUT_SHIFT)

      moveNode(node, direction.x * shift, direction.y * shift)
      totalShift += shift
    })
  })

  return totalShift
}

function moveNode(node: NodeSingular, dx: number, dy: number): void {
  const position = node.position()
  node.position({
    x: position.x + dx,
    y: position.y + dy,
  })
}

function projectPointToSegment(point: Point, start: Point, end: Point): { point: Point; distance: number } {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const lengthSquared = dx * dx + dy * dy

  if (lengthSquared === 0) {
    return {
      point: start,
      distance: distanceBetween(point, start),
    }
  }

  const ratio = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared))
  const projected = {
    x: start.x + ratio * dx,
    y: start.y + ratio * dy,
  }

  return {
    point: projected,
    distance: distanceBetween(point, projected),
  }
}

function normalizePoint(point: Point): Point | null {
  const length = Math.hypot(point.x, point.y)

  if (length === 0) {
    return null
  }

  return {
    x: point.x / length,
    y: point.y / length,
  }
}

function perpendicularUnit(start: Point, end: Point): Point {
  return normalizePoint({
    x: -(end.y - start.y),
    y: end.x - start.x,
  }) ?? { x: 0, y: -1 }
}

function distanceBetween(left: Point, right: Point): number {
  return Math.hypot(left.x - right.x, left.y - right.y)
}

function deterministicOffset(leftId: string, rightId: string): number {
  let hash = 0
  const value = `${leftId}:${rightId}`

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 997
  }

  return (hash % 2 === 0 ? 1 : -1) * (8 + (hash % 11))
}

function buildSeedPositions(graph: VisibleGraph): Map<string, { x: number; y: number }> {
  const adjacency = new Map<string, Set<string>>()

  graph.characters.forEach(character => {
    adjacency.set(character.id, new Set())
  })

  graph.relationships.forEach(relationship => {
    adjacency.get(relationship.source)?.add(relationship.target)
    adjacency.get(relationship.target)?.add(relationship.source)
  })

  const components = getConnectedComponents(graph.characters.map(character => character.id), adjacency)
  const componentLayouts = components
    .map(characterIds => layoutComponent(characterIds, adjacency))
    .sort((left, right) => right.radius - left.radius)

  if (componentLayouts.length === 1) {
    return componentLayouts[0]?.positions ?? new Map()
  }

  const positioned = new Map<string, { x: number; y: number }>()
  const totalSpan = componentLayouts.reduce((sum, component) => sum + component.radius * 2 + COMPONENT_PADDING, 0)
  const orbitRadius = Math.max(520, totalSpan / (2 * Math.PI))

  componentLayouts.forEach((component, index) => {
    const angle = (-Math.PI / 2) + (index * 2 * Math.PI) / componentLayouts.length
    const offsetX = Math.cos(angle) * orbitRadius
    const offsetY = Math.sin(angle) * orbitRadius

    component.positions.forEach((position, nodeId) => {
      positioned.set(nodeId, {
        x: position.x + offsetX,
        y: position.y + offsetY,
      })
    })
  })

  return positioned
}

function getConnectedComponents(nodeIds: string[], adjacency: Map<string, Set<string>>): string[][] {
  const remaining = new Set(nodeIds)
  const components: string[][] = []

  while (remaining.size > 0) {
    const start = remaining.values().next().value as string
    const queue = [start]
    const component: string[] = []
    remaining.delete(start)

    while (queue.length > 0) {
      const current = queue.shift()

      if (!current) {
        continue
      }

      component.push(current)

      adjacency.get(current)?.forEach(neighbor => {
        if (!remaining.has(neighbor)) {
          return
        }

        remaining.delete(neighbor)
        queue.push(neighbor)
      })
    }

    components.push(component)
  }

  return components.sort((left, right) => right.length - left.length)
}

function layoutComponent(characterIds: string[], adjacency: Map<string, Set<string>>): {
  positions: Map<string, { x: number; y: number }>
  radius: number
} {
  const positions = new Map<string, { x: number; y: number }>()

  if (characterIds.length === 0) {
    return { positions, radius: 0 }
  }

  if (characterIds.length === 1) {
    positions.set(characterIds[0], { x: 0, y: 0 })
    return { positions, radius: BASE_RING_RADIUS / 2 }
  }

  const rootId = [...characterIds].sort((left, right) => {
    const degreeDiff = (adjacency.get(right)?.size ?? 0) - (adjacency.get(left)?.size ?? 0)
    return degreeDiff || left.localeCompare(right)
  })[0]

  const levels = assignLevels(rootId, adjacency)
  const rings = new Map<number, string[]>()

  characterIds.forEach(nodeId => {
    const level = levels.get(nodeId) ?? 0
    const ring = rings.get(level) ?? []
    ring.push(nodeId)
    rings.set(level, ring)
  })

  positions.set(rootId, { x: 0, y: 0 })

  let maxRadius = 0
  const levelEntries = [...rings.entries()].sort((left, right) => left[0] - right[0])

  levelEntries.forEach(([level, ringNodes]) => {
    if (level === 0) {
      return
    }

    const orderedNodes = orderRingNodes(ringNodes, adjacency, positions)
    const requiredRadius = (orderedNodes.length * MIN_NODE_SPACING) / (2 * Math.PI)
    const radius = Math.max(level * BASE_RING_RADIUS, requiredRadius)
    const angleStep = (2 * Math.PI) / orderedNodes.length
    const angleOffset = level % 2 === 0 ? angleStep / 2 : 0

    orderedNodes.forEach((nodeId, index) => {
      const angle = angleOffset + index * angleStep
      positions.set(nodeId, {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      })
    })

    maxRadius = Math.max(maxRadius, radius)
  })

  return {
    positions,
    radius: maxRadius + Math.max(NODE_WIDTH, NODE_HEIGHT),
  }
}

function assignLevels(rootId: string, adjacency: Map<string, Set<string>>): Map<string, number> {
  const levels = new Map<string, number>([[rootId, 0]])
  const queue = [rootId]

  while (queue.length > 0) {
    const current = queue.shift()

    if (!current) {
      continue
    }

    const nextLevel = (levels.get(current) ?? 0) + 1

    adjacency.get(current)?.forEach(neighbor => {
      if (levels.has(neighbor)) {
        return
      }

      levels.set(neighbor, nextLevel)
      queue.push(neighbor)
    })
  }

  return levels
}

function orderRingNodes(
  nodeIds: string[],
  adjacency: Map<string, Set<string>>,
  positions: Map<string, { x: number; y: number }>
): string[] {
  return [...nodeIds].sort((left, right) => {
    const angleDiff = getAnchorAngle(left, adjacency, positions) - getAnchorAngle(right, adjacency, positions)

    if (Math.abs(angleDiff) > 0.0001) {
      return angleDiff
    }

    const degreeDiff = (adjacency.get(right)?.size ?? 0) - (adjacency.get(left)?.size ?? 0)
    return degreeDiff || left.localeCompare(right)
  })
}

function getAnchorAngle(
  nodeId: string,
  adjacency: Map<string, Set<string>>,
  positions: Map<string, { x: number; y: number }>
): number {
  const anchors = [...(adjacency.get(nodeId) ?? [])]
    .map(neighborId => positions.get(neighborId))
    .filter((position): position is { x: number; y: number } => Boolean(position))

  if (anchors.length === 0) {
    return Number.POSITIVE_INFINITY
  }

  const center = anchors.reduce(
    (result, position) => ({
      x: result.x + position.x,
      y: result.y + position.y,
    }),
    { x: 0, y: 0 }
  )

  return Math.atan2(center.y / anchors.length, center.x / anchors.length)
}
