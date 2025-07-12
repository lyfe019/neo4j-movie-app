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

// --- Run the connection test when the script executes ---
testConnection();

// Export the driver instance so other modules can import and use it later
export default driver;