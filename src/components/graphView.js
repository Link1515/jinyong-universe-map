import cytoscape from 'cytoscape'

/**
 * @param {HTMLElement} container
 * @param {{
 *  onNodeSelect: (nodeId: string) => void,
 *  onEdgeSelect: (edgeId: string) => void
 * }} callbacks
 */
export function createGraphView(container, callbacks) {
  /** @type {Map<string, { x: number, y: number }>} */
  const positions = new Map()
  let hasRenderedGraph = false

  const root = document.createElement('div')
  root.className = 'graph-shell'
  container.append(root)

  const cy = cytoscape({
    container: root,
    elements: [],
    layout: { name: 'preset' },
    // Keep wheel zoom feeling closer to design tools like Figma:
    // each wheel notch should produce a clearly noticeable zoom step.
    wheelSensitivity: 2.2,
    minZoom: 0.3,
    maxZoom: 2.2,
    boxSelectionEnabled: false,
    style: [
      {
        selector: 'node',
        style: {
          'background-color': '#fff7eb',
          'border-width': 2,
          'border-color': 'rgba(79, 57, 29, 0.28)',
          label: 'data(name)',
          color: '#382b1e',
          'font-size': 15,
          'font-weight': 700,
          'text-wrap': 'wrap',
          'text-max-width': 78,
          'text-valign': 'bottom',
          'text-margin-y': 12,
          width: 48,
          height: 48,
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
    ],
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
    fitGraph()
  })

  resizeObserver.observe(container)

  /**
   * @param {{ characters: any[], relationships: any[] }} graph
   */
  function update(graph) {
    cy.nodes().forEach(node => {
      const position = node.position()
      positions.set(node.id(), { x: position.x, y: position.y })
    })

    const nodeElements = graph.characters.map(character => {
      const position = positions.get(character.id)
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

    const edgeElements = graph.relationships.map(relationship => ({
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
            randomize: true,
            padding: 120,
            nodeRepulsion(node) {
              return 240000 + node.degree(false) * 32000
            },
            idealEdgeLength(edge) {
              const weight = Number(edge.data('weight')) || 1
              return 180 + Math.max(0, 5 - weight) * 24
            },
            edgeElasticity(edge) {
              const weight = Number(edge.data('weight')) || 1
              return 80 + weight * 16
            },
            gravity: 0.12,
            componentSpacing: 260,
            nestingFactor: 0.7,
            numIter: 3000,
            initialTemp: 1200,
            coolingFactor: 0.955,
          }
    )

    layout.run()
    fitGraph()
    hasRenderedGraph = true

    cy.nodes().forEach(node => {
      const position = node.position()
      positions.set(node.id(), { x: position.x, y: position.y })
    })
  }

  /**
   * @param {string | null} nodeId
   */
  function highlightNode(nodeId) {
    cy.elements().removeClass('is-highlighted is-selected is-muted')

    if (!nodeId) {
      fitGraph()
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

  /**
   * @param {string | null} nodeId
   * @param {string | null} edgeId
   */
  function setSelection(nodeId, edgeId) {
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

  function fitGraph() {
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

  return {
    update,
    highlightNode,
    setSelection,
  }
}

/**
 * @param {"solid"|"dashed"|"dotted"|undefined} line
 */
function toCyLineStyle(line) {
  if (line === 'dashed') {
    return 'dashed'
  }
  if (line === 'dotted') {
    return 'dotted'
  }
  return 'solid'
}
