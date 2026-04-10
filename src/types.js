// @ts-check

/**
 * @typedef {Object} Novel
 * @property {string} id
 * @property {string} name
 * @property {string} era
 * @property {string} description
 */

/**
 * @typedef {Object} Character
 * @property {string} id
 * @property {string} name
 * @property {string[]} aliases
 * @property {string[]} novels
 * @property {"male"|"female"|"unknown"} gender
 * @property {string[]} factions
 * @property {string} title
 * @property {string} description
 * @property {string[]} tags
 */

/**
 * @typedef {Object} RelationshipMetadata
 * @property {string=} note
 * @property {string=} sourceArc
 */

/**
 * @typedef {Object} Relationship
 * @property {string} id
 * @property {string} source
 * @property {string} target
 * @property {string} type
 * @property {string} label
 * @property {string} description
 * @property {boolean} directed
 * @property {string[]} novels
 * @property {number} weight
 * @property {RelationshipMetadata=} metadata
 */

/**
 * @typedef {Object} RelationshipType
 * @property {string} id
 * @property {string} name
 * @property {string} group
 * @property {string} color
 * @property {"solid"|"dashed"|"dotted"} line
 */
