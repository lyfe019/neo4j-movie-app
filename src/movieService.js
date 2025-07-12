import neo4j from 'neo4j-driver';

// --- Database Connection Configuration ---
const URI = 'bolt://127.0.0.1:7687';
const USER = 'neo4j';
const PASSWORD = 'ebenezer000'; 

// Create a Driver instance (only once per application)
const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));

// --- Function to test the connection ---
export async function testConnection() {
    let session;
    try {
        const databaseName = 'neo4j';
        session = driver.session({ database: databaseName });
        const result = await session.run('RETURN "Hello from Neo4j!" AS message');
        const message = result.records[0].get('message');

        console.log('Successfully connected to Neo4j!');
        console.log('Database message:', message);
        console.log(`Currently connected to database: ${databaseName}`);

    } catch (error) {
        console.error('Error connecting to Neo4j:', error);
        console.error('Please ensure your Neo4j database is running and credentials are correct.');
        console.error('Error details:', error.message);
        throw error; // Re-throw to propagate for main error handling
    } finally {
        if (session) {
            await session.close();
        }
    }
}

// --- Function to create unique constraints ---
export async function createConstraints() {
    let session;
    try {
        session = driver.session({ database: 'neo4j' });
        await session.run('CREATE CONSTRAINT IF NOT EXISTS FOR (m:Movie) REQUIRE m.title IS UNIQUE');
        console.log('[Constraint Created]: Unique constraint on Movie(title)');
        await session.run('CREATE CONSTRAINT IF NOT EXISTS FOR (p:Person) REQUIRE p.name IS UNIQUE');
        console.log('[Constraint Created]: Unique constraint on Person(name)');
    } catch (error) {
        console.error('Error creating constraints:', error);
        throw error;
    } finally {
        if (session) {
            await session.close();
        }
    }
}

// --- Function to add or update a Movie node ---
export async function addMovie(title, released, tagline) {
    let session;
    try {
        session = driver.session({ database: 'neo4j' });
        const query = `
            MERGE (m:Movie {title: $title})
            ON CREATE SET m.released = $released, m.tagline = $tagline
            RETURN m
        `;
        const result = await session.run(query, { title, released, tagline });
        const movie = result.records[0].get('m');
        console.log(`[Movie Added/Updated]: '${movie.properties.title}'`);
        return movie;
    } catch (error) {
        console.error('Error adding movie:', error);
        throw error;
    } finally {
        if (session) {
            await session.close();
        }
    }
}

// --- Function to add or update a Person node (Actor/Director/etc.) ---
export async function addPerson(name, born) {
    let session;
    try {
        session = driver.session({ database: 'neo4j' });
        const query = `
            MERGE (p:Person {name: $name})
            ON CREATE SET p.born = $born
            RETURN p
        `;
        const result = await session.run(query, { name, born });
        const person = result.records[0].get('p');
        console.log(`[Person Added/Updated]: '${person.properties.name}'`);
        return person;
    } catch (error) {
        console.error('Error adding person:', error);
        throw error;
    } finally {
        if (session) {
            await session.close();
        }
    }
}

// --- Function to add an actor to a movie with their roles (ACTED_IN relationship) ---
export async function addActorToMovie(actorName, movieTitle, roles) {
    let session;
    try {
        session = driver.session({ database: 'neo4j' });
        const query = `
            MATCH (p:Person {name: $actorName})
            MATCH (m:Movie {title: $movieTitle})
            MERGE (p)-[r:ACTED_IN]->(m)
            ON CREATE SET r.roles = $roles
            RETURN p.name AS actor, m.title AS movie, r.roles AS rolesPlayed
        `;
        const result = await session.run(query, { actorName, movieTitle, roles });
        const record = result.records[0];
        console.log(`[Relationship Added/Updated]: '${record.get('actor')}' acted in '${record.get('movie')}' as ${record.get('rolesPlayed').join(', ')}.`);
        return record;
    } catch (error) {
        console.error('Error adding actor to movie:', error);
        throw error;
    } finally {
        if (session) {
            await session.close();
        }
    }
}

// --- Function to get a Movie node by its title ---
export async function getMovieByTitle(title) {
    let session;
    try {
        session = driver.session({ database: 'neo4j' });
        const query = `
            MATCH (m:Movie {title: $title})
            RETURN m
        `;
        const result = await session.run(query, { title });
        if (result.records.length > 0) {
            const movie = result.records[0].get('m');
            console.log(`[Query Result]: Found Movie: '${movie.properties.title}' (Released: ${movie.properties.released}, Tagline: '${movie.properties.tagline}')`);
            return movie;
        } else {
            console.log(`[Query Result]: Movie with title '${title}' not found.`);
            return null;
        }
    } catch (error) {
        console.error(`Error getting movie by title '${title}':`, error);
        throw error;
    } finally {
        if (session) {
            await session.close();
        }
    }
}

// --- Function to get a Person node by their name ---
export async function getPersonByName(name) {
    let session;
    try {
        session = driver.session({ database: 'neo4j' });
        const query = `
            MATCH (p:Person {name: $name})
            RETURN p
        `;
        const result = await session.run(query, { name });
        if (result.records.length > 0) {
            const person = result.records[0].get('p');
            console.log(`[Query Result]: Found Person: '${person.properties.name}' (Born: ${person.properties.born})`);
            return person;
        } else {
            console.log(`[Query Result]: Person with name '${name}' not found.`);
            return null;
        }
    } catch (error) {
        console.error(`Error getting person by name '${name}':`, error);
        throw error;
    } finally {
        if (session) {
            await session.close();
        }
    }
}

// --- Function to get all movies an actor has acted in ---
export async function getMoviesByActor(actorName) {
    let session;
    try {
        session = driver.session({ database: 'neo4j' });
        const query = `
            MATCH (p:Person {name: $actorName})-[:ACTED_IN]->(m:Movie)
            RETURN m.title AS title, m.released AS released, m.tagline AS tagline
        `;
        const result = await session.run(query, { actorName });
        const movies = result.records.map(record => ({
            title: record.get('title'),
            released: record.get('released'),
            tagline: record.get('tagline')
        }));

        if (movies.length > 0) {
            console.log(`\n[Query Result]: Movies acted in by '${actorName}':`);
            movies.forEach(movie => console.log(`  - ${movie.title} (${movie.released}) - "${movie.tagline}"`));
            return movies;
        } else {
            console.log(`\n[Query Result]: No movies found for actor '${actorName}'.`);
            return [];
        }
    } catch (error) {
        console.error(`Error getting movies by actor '${actorName}':`, error);
        throw error;
    } finally {
        if (session) {
            await session.close();
        }
    }
}

// --- Function to get all actors in a specific movie and their roles ---
export async function getActorsInMovie(movieTitle) {
    let session;
    try {
        session = driver.session({ database: 'neo4j' });
        const query = `
            MATCH (p:Person)-[r:ACTED_IN]->(m:Movie {title: $movieTitle})
            RETURN p.name AS actorName, r.roles AS roles
        `;
        const result = await session.run(query, { movieTitle });
        const actorsWithRoles = result.records.map(record => ({
            actorName: record.get('actorName'),
            roles: record.get('roles')
        }));

        if (actorsWithRoles.length > 0) {
            console.log(`\n[Query Result]: Actors in '${movieTitle}':`);
            actorsWithRoles.forEach(actor => console.log(`  - ${actor.actorName} as ${actor.roles.join(', ')}`));
            return actorsWithRoles;
        } else {
            console.log(`\n[Query Result]: No actors found for movie '${movieTitle}'.`);
            return [];
        }
    } catch (error) {
        console.error(`Error getting actors in movie '${movieTitle}':`, error);
        throw error;
    } finally {
        if (session) {
            await session.close();
        }
    }
}

// --- Function to close the Neo4j Driver ---
export async function closeDriver() {
    if (driver) {
        await driver.close();
        console.log('Neo4j Driver connection closed.');
    }
}