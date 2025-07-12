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

// --- Main execution block to demonstrate functionality ---

async function main() {
    try {
        await testConnection(); // First, ensure database connection is working

        console.log('\n--- Adding/Updating Movies ---');
        await addMovie('The Matrix', 1999, 'Welcome to the Real World.');
        await addMovie('The Matrix Reloaded', 2003, 'Free your mind.');
        await addMovie('Inception', 2010, 'Your mind is the scene of the crime.');
        await addMovie('Forrest Gump', 1994, 'Life is like a box of chocolates.');
        await addMovie('Pulp Fiction', 1994, 'Royale with Cheese.');

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