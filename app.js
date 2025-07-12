// Import the neo4j-driver module
import neo4j from 'neo4j-driver';

// --- Database Connection Configuration ---

const URI = 'bolt://127.0.0.1:7687'; 
const USER = 'neo4j';
const PASSWORD = 'ebenezer000'; 

// Create a Driver instance
// The driver should typically be created once per application lifecycle.
const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));

// --- Function to test the connection ---
async function testConnection() {
    let session; // Declare session here to ensure it's always closed
    try {
        // Obtain a session from the driver
        // Sessions are used to execute Cypher queries.
        const databaseName = 'neo4j'; // Explicitly specify the default database name
        session = driver.session({ database: databaseName });

        // Run a simple query to verify connection and get the database name
      
        const result = await session.run('RETURN "Hello from Neo4j!" AS message'); 
        const message = result.records[0].get('message');

        console.log('Successfully connected to Neo4j!');
        console.log('Database message:', message);
        console.log(`Currently connected to database: ${databaseName}`);

    } catch (error) {
        console.error('Error connecting to Neo4j:', error);
        console.error('Please ensure your Neo4j database is running and credentials are correct.');
        console.error('Error details:', error.message);
    } finally {
        // Close the session to release resources
        if (session) {
            await session.close();
        }
        // Note: We won't close the driver here, as we'll reuse it for later operations.
        // driver.close() should be called when the application is shutting down.
    }
}

// --- Function to add or update a Movie node ---
async function addMovie(title, released, tagline) {
    let session;
    try {
        // Always specify the database when opening a session
        session = driver.session({ database: 'neo4j' });

        const query = `
            MERGE (m:Movie {title: $title})
            ON CREATE SET m.released = $released, m.tagline = $tagline
            RETURN m
        `;
        // Parameters are used to prevent Cypher injection and improve readability
        const result = await session.run(query, { title, released, tagline });
        const movie = result.records[0].get('m'); // 'm' is the alias from 'RETURN m'
        console.log(`[Movie Added/Updated]: '${movie.properties.title}'`);
        return movie;
    } catch (error) {
        console.error('Error adding movie:', error);
        throw error; // Re-throw to propagate the error for better handling upstream
    } finally {
        // Close the session to release resources back to the driver's connection pool
        if (session) {
            await session.close();
        }
    }
}



// --- Function to create unique constraints for Movie titles and Person names ---
async function createConstraints() {
    let session;
    try {
        session = driver.session({ database: 'neo4j' });

        // Create a unique constraint on the 'title' property of 'Movie' nodes
        // IF NOT EXISTS ensures it doesn't throw an error if the constraint already exists.
        await session.run('CREATE CONSTRAINT IF NOT EXISTS FOR (m:Movie) REQUIRE m.title IS UNIQUE');
        console.log('[Constraint Created]: Unique constraint on Movie(title)');

        // Create a unique constraint on the 'name' property of 'Person' nodes
        await session.run('CREATE CONSTRAINT IF NOT EXISTS FOR (p:Person) REQUIRE p.name IS UNIQUE');
        console.log('[Constraint Created]: Unique constraint on Person(name)');

    } catch (error) {
        console.error('Error creating constraints:', error);
        throw error; // Propagate the error if constraint creation fails
    } finally {
        if (session) {
            await session.close();
        }
    }
}

// --- Function to add or update a Person node (Actor/Director/etc.) ---
async function addPerson(name, born) {
    let session;
    try {
        session = driver.session({ database: 'neo4j' });
        const query = `
            MERGE (p:Person {name: $name})
            ON CREATE SET p.born = $born
            RETURN p
        `;
        const result = await session.run(query, { name, born });
        const person = result.records[0].get('p'); // 'p' is the alias from 'RETURN p'
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
async function addActorToMovie(actorName, movieTitle, roles) {
    let session;
    try {
        session = driver.session({ database: 'neo4j' });
        const query = `
            MATCH (p:Person {name: $actorName})
            MATCH (m:Movie {title: $movieTitle})
            MERGE (p)-[r:ACTED_IN]->(m)
            ON CREATE SET r.roles = $roles // roles is expected to be an array, e.g., ['Neo']
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


// --- Main execution block to demonstrate functionality ---

async function main() {
    try {
        await testConnection(); // First, ensure database connection is working



        console.log('\n--- Creating Constraints ---');
        await createConstraints(); // 2. Create constraints first

        console.log('\n--- Adding/Updating Movies ---');
        await addMovie('The Matrix', 1999, 'Welcome to the Real World.');
        await addMovie('The Matrix Reloaded', 2003, 'Free your mind.');
        await addMovie('Inception', 2010, 'Your mind is the scene of the crime.');
        await addMovie('Forrest Gump', 1994, 'Life is like a box of chocolates.');
        await addMovie('Pulp Fiction', 1994, 'Royale with Cheese.');



        // Second, add the people (actors)
        console.log('\n--- Adding/Updating People (Actors) ---');
        await addPerson('Keanu Reeves', 1964);
        await addPerson('Carrie-Anne Moss', 1967);
        await addPerson('Laurence Fishburne', 1961);
        await addPerson('Leonardo DiCaprio', 1974);
        await addPerson('Tom Hanks', 1956);
        await addPerson('Uma Thurman', 1970);
        await addPerson('John Travolta', 1954); // Ensure John Travolta is added before linking him

        // Third, add the relationships between people and movies
        console.log('\n--- Adding Relationships (Actors in Movies) ---');
        await addActorToMovie('Keanu Reeves', 'The Matrix', ['Neo']);
        await addActorToMovie('Carrie-Anne Moss', 'The Matrix', ['Trinity']);
        await addActorToMovie('Laurence Fishburne', 'The Matrix', ['Morpheus']);

        await addActorToMovie('Keanu Reeves', 'The Matrix Reloaded', ['Neo']);
        await addActorToMovie('Carrie-Anne Moss', 'The Matrix Reloaded', ['Trinity']);
        await addActorToMovie('Laurence Fishburne', 'The Matrix Reloaded', ['Morpheus']);

        await addActorToMovie('Leonardo DiCaprio', 'Inception', ['Cobb']);

        await addActorToMovie('Tom Hanks', 'Forrest Gump', ['Forrest Gump']);

        await addActorToMovie('Uma Thurman', 'Pulp Fiction', ['Mia Wallace']);
        await addActorToMovie('John Travolta', 'Pulp Fiction', ['Vincent Vega']);


    } catch (error) {
        console.error('An error occurred during main execution:', error);
    } finally {
        // Important: Close the driver connection pool when your application is done
        // In a real application, you'd manage the driver's lifecycle more robustly
        await driver.close();
        console.log('Neo4j Driver connection closed.');
    }
}

// --- Execute the main function ---
main();