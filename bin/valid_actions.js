'use strict';
/**
 * This is an outline of the valid calls that can be made to the API it allows for the CreateQueryString
 * to properly concatenate query statements to find the proper nodes and relations.
 * @namespace ValidActions
 */
const ValidActions = {
    'blips': {
        'hook': 'MATCH (n:BLIP)',
        'action': (val) => {

            return ValidActions.blips[val]();
        },
        'id': (val) => {

            return `MATCH (n:BLIP) WHERE ID(n) = ${val}`;
        },
        'published': () => {

            return 'MATCH (n)-[:Published_to]->(y) WITH y AS n';
        },
        'contributed': () => {

            return 'MATCH (n)-[:Proposed_at]->(y) WITH y AS n';
        },
        'proposed': () => {

            return 'MATCH (n)<-[:Proposed]-(y) WITH y AS n';
        },
        'supported': () => {

            return 'MATCH (y)-[:Supports]->(n) WITH y AS n';
        },
        'search': (val) => {

            return `MATCH(n) WHERE n.name =~ '(?i).*${val}.*' OR n.description =~ '(?i).*${val}.*' ` +
                `OR n.ring =~ '^(?i)${val}$' OR n.quadrant =~ '^(?i)${val}$'`;
        },
        'return': 'RETURN COLLECT(DISTINCT n)'
    },
    'items': {
        'hook': 'MATCH (n:BLIP)',
        'name': (val) => {

            return `MATCH (n) WHERE n.slug = \"${val}\"`;
        },
        'search': (val) => {

            return `MATCH(n) WHERE n.name =~ '(?i).*${val}.*'`;
        },
        'return': 'RETURN COLLECT(DISTINCT n)'
    },
    'contributors': {
        'hook': 'MATCH (n:PERSON)',
        'name': (val) => {

            return `MATCH (n) WHERE n.name = \"${val}\"`;
        },
        'action': (val) => {

            return ValidActions.contributors[val]();
        },
        'proposed': () => {

            return 'MATCH (n)-[w:Proposed]->(y) WITH y AS n';
        },
        'attended': () => {

            return 'MATCH (n)-[w:Attended]->(y) WITH y as n';
        },
        'search': (val) => {

            return `MATCH(n) WHERE n.name =~ '(?i).*${val}.*' OR n.description =~ '(?i).*${val}.*' ` +
                `OR n.ring =~ '^(?i)${val}$' OR n.quadrant =~ '^(?i)${val}$'`;
        },
        'supported': () => {

            return 'MATCH (n)-[:Supports]->(y) WITH y AS n';
        },
        'support_id': (val) => {

            return `MATCH (n)-[r:Supports]->(y) WHERE ID(y)=${val} WITH r.weight AS n`;
        },
        'return': 'RETURN COLLECT(DISTINCT n)'
    },
    'meetings': {
        'hook': 'MATCH (n:MEETING)',
        'date': (val) => {

            return `MATCH (n) WHERE n.date = \"${val}\"`;
        },
        'action': (val) => {

            return ValidActions.meetings[val]();
        },
        'proposed': () => {

            return 'MATCH (y)-[w:Proposed_at]->(n) WITH y AS n';
        },
        'attended': () => {

            return 'MATCH (y)-[w:Attended]->(n) WITH y AS n';
        },
        'contributed': () => {

            return 'MATCH (n)-[m:Contributed_to]->(y) WITH y AS n';
        },
        'return': 'RETURN COLLECT(DISTINCT n)'
    },
    'publications': {
        'hook': 'MATCH (n:PUBLICATION)',
        'action': (val) => {

            return ValidActions.publications[val]();
        },
        'publisher': (val) => {

            return `MATCH (n) WHERE n.publisher = \"${val}\"`;
        },
        'date': (val) => {

            return `MATCH (n) WHERE n.date = \"${val}\"`;
        },
        'published': (val) => {

            return 'MATCH (y)-[p:Published_to]->(n) WITH y AS n';
        },
        'contributed': (val) => {

            return 'MATCH (y)-[m:Contributed_to]->(n) WITH y AS n';
        },
        'return': 'RETURN COLLECT(DISTINCT n)'
    }
};

module.exports = ValidActions;
