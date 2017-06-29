'use strict';

const Path = require('path');

if (!process.env.NEO4J_INFO || process.env.NEO4J_INFO === undefined || process.env.NEO4J_INFO === '') {
    console.log('EXITING!! Missing NEO4J_INFO env value. Typically: http://radar:<password>@<server>:7687');
    console.log('try: export NEO4J_INFO=http://radar:<password>@<server>:7687 before running the reset-data script.');
    process.exit(1);
}
else {
    const Driver = require(Path.join(__dirname, '..', 'bin', 'driver'));

    const driver = new Driver();

    const delete_cypher = 'MATCH (n) DETACH DELETE(n)';

    const load_scraped =
        `//LOADS SCRAPED DATA INTO DATABASE \n
            LOAD CSV WITH HEADERS FROM "${process.argv.slice(2)[0]}/scraped.csv" AS csvLine \n
            MERGE (pb:PUBLICATION { publisher: csvLine.organization, date: apoc.date.format(apoc.date.parse(csvLine.publication, 'ms','MMM yyyy'),'ms','yyyy-MM')}) \n
            CREATE (b:BLIP { name: csvLine.name, slug: csvLine.slug , quadrant: lower(csvLine.quadrant), ring: lower(csvLine.ring), topic: "", description: csvLine.description, isNew: csvLine.isNew}) \n
            CREATE (b)-[i:Published_to]->(pb) \n`;

    console.log('Reloading base data...');

    driver.session.run(delete_cypher).then(() => {

        driver.session.run(load_scraped).then(() => {

            console.log('DONE');
            driver.close();
        });
    });


}
