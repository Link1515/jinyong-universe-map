import cytoscape, { type Core, type ElementDefinition } from 'cytoscape'
import type { VisibleGraph } from '../types'

const NODE_WIDTH = 92
const NODE_HEIGHT = 54
const MIN_NODE_SPACING = 150
const BASE_RING_RADIUS = 210
const COMPONENT_PADDING = 220

interface GraphCallbacks {
  onNodeSelect: (nodeId: string) => void
  onEdgeSelect: (edgeId: string) => void
}

interface GraphViewApi {
  update: (graph: VisibleGraph) => void
  highlightNode: (nodeId: string | null) => void
  setSelection: (nodeId: string | null, edgeId: string | null) => void
  destroy: () => void
}

export function createGraphView(container: HTMLElement, callbacks: GraphCallbacks): GraphViewApi {
  const positions = new Map<string, { x: number; y: number }>()
  let hasRenderedGraph = false
  const zoomStep = 1.15

  const root = document.createElement('div')
  root.className = 'graph-shell'
  container.append(root)

  const zoomControls = document.createElement('div')
  zoomControls.className = 'graph-zoom-controls'
  zoomControls.innerHTML = `
    <button type="button" class="graph-zoom-button" data-zoom-action="in" aria-label="放大圖譜">+</button>
    <button type="button" class="graph-zoom-button" data-zoom-action="out" aria-label="縮小圖譜">-</button>
  `
  container.append(zoomControls)

  const cy = cytoscape({
    container: root,
    elements: [],
    layout: { name: 'preset' },
    wheelSensitivity: 2.2,
    minZoom: 0.3,
    maxZoom: 2.2,
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
          'curve-style': 'bezier',
          'line-style': 'data(lineStyle)',
          label: 'data(label)',
          color: '#6d543d',
          'font-size': 11,
          'text-background-color': 'rgba(255, 248, 237, 0.92)',
          'text-background-opacity': 1,
          'text-background-padding': 3,
          'text-rotation': 'autorotate',
          'overlay-opacity': 0,
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

  zoomControls.querySelectorAll<HTMLElement>('[data-zoom-action]').forEach(element => {
    element.addEventListener('click', () => {
      const action = element.dataset.zoomAction === 'in' ? zoomStep : 1 / zoomStep
      zoomByStep(cy, action)
    })
  })

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

    const edgeElements: ElementDefinition[] = graph.relationships.map(relationship => ({
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
      },
    }))

    cy.elements().remove()
    cy.add([...nodeElements, ...edgeElements])

    const hasPresetPositions = nodeElements.some(element => 'position' in element)
    const layout = cy.layout(
      hasPresetPositions
        ? {
            name: 'preset',
            animate: false,
            fit: false,
          }
        : {
            name: 'cose',
            animate: false,
            fit: false,
            randomize: false,
            padding: 120,
            nodeRepulsion(node) {
              return 320000 + node.degree(false) * 42000
            },
            idealEdgeLength(edge) {
              const weight = Number(edge.data('weight')) || 1
              return 210 + Math.max(0, 5 - weight) * 28
            },
            edgeElasticity(edge) {
              const weight = Number(edge.data('weight')) || 1
              return 90 + weight * 18
            },
            gravity: 0.08,
            componentSpacing: 320,
            nestingFactor: 0.7,
            numIter: 3200,
            initialTemp: 900,
            coolingFactor: 0.96,
          }
    )

    layout.run()
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
      fitGraph(cy)
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
    zoomControls.remove()
  }

  return {
    update,
    highlightNode,
    setSelection,
    destroy,
  }
}

function fitGraph(cy: Core): void {
  if (cy.elements().empty()) {
    return
  }

  cy.fit(cy.elements(), 96)

  const nextZoom = Math.min(cy.zoom(), 0.78)
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
