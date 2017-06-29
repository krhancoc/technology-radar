'use strict';
/**
 * Object that hold the Cypher Query for creating nodes and relationship nodes.  Used within create.js
 */

// TODO Change "Company" to another field -- does it make sense to have a field for this?  Or tie it to the user?

const createStrings = {
    user: () => {

        return 'CREATE (n:PERSON {name: {name}, displayName: {displayName}, hash: {hash}, group: ""})';
    },

    blip: () => {

        return `CREATE (n: BLIP {name: {name}, slug: {slug}, description: {description}, ring: {ring}, quadrant: {quadrant}, publisher: \"${process.env.company}\"}) \n`
            + 'WITH n \n'
            + 'MATCH (y:PERSON) WHERE y.name = {user} \n'
            + 'WITH n, y\n'
            + 'CREATE (n)<-[:Proposed]-(y) RETURN (n)';
    },

    meeting: (date) => {

        return `MERGE (n:MEETING {date: "${date}"}) RETURN (n)`;
    },

    proposed_at: (meeting_id, blip_id) => {

        return `MATCH (n:MEETING) WHERE ID(n) = toInt(${meeting_id}) `
            + `WITH n MATCH (b:BLIP) WHERE ID(b) = toInt(${blip_id}) `
            + 'WITH n, b CREATE (b)-[:Proposed_at]->(n)';
    },

    publication: (date, intro) => {
        intro = intro.replace(/\"/g,'\\"');
        return `MERGE (n:PUBLICATION {date: "${date}", publisher: "${process.env.company}", intro: "${intro}"}) RETURN (n)`;
    },

    contributed_to: (publication_id, meeting_id) => {

        return `MATCH (n:PUBLICATION) WHERE ID(n) = toInt(${publication_id}) `
            + `WITH n MATCH (b:MEETING) WHERE ID(b) = toInt(${meeting_id}) `
            + 'WITH n, b MERGE (b)-[:Contributed_to]->(n)';
    },

    published_to: (publication_id, meeting_id) => {

        return `MATCH (z:MEETING) WHERE ID(z) = toInt(${meeting_id}) `
            + 'WITH z MATCH (n)-[:Proposed_at]->(z) '
            + `WITH n MATCH (x:PUBLICATION) WHERE ID(x) = toInt(${publication_id})`
            + 'WITH n, x MERGE (n)-[:Published_to]->(x)';
    },

    support: (name, blip_id, weight) => {

        return `MATCH(n:PERSON) WHERE n.name = "${name}" ` +
            `WITH n MATCH(x:BLIP) WHERE ID(x) = toInt(${blip_id}) ` +
            `WITH n, x CREATE (n)-[:Supports {weight: toInt(${weight})}]->(x)`;
    },

    attended: (meeting_id, elem_id) => {

        return `MATCH (n) WHERE ID(n) = toInt(${elem_id})` +
                `WITH n MATCH(x) WHERE ID(x) = toInt(${meeting_id})` +
                `WITH n, x CREATE (n)-[:Attended]->(x)`;
    }
};


module.exports = createStrings;
