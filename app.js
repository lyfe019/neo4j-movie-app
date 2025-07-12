// app.js

import {
    testConnection,
    createConstraints,
    addMovie,
    addPerson,
    addActorToMovie,
    getMovieByTitle,
    getPersonByName,
    getMoviesByActor,
    getActorsInMovie,
    closeDriver // Import the new closeDriver function
} from './src/movieService.js'; // Adjust path if your structure differs

// --- Main execution block ---
async function main() {
    try {
        await testConnection();

        console.log('\n--- Creating Constraints ---');
        await createConstraints();

        console.log('\n--- Adding/Updating Movies ---');
        await addMovie('The Matrix', 1999, 'Welcome to the Real World.');
        await addMovie('The Matrix Reloaded', 2003, 'Free your mind.');
        await addMovie('Inception', 2010, 'Your mind is the scene of the crime.');
        await addMovie('Forrest Gump', 1994, 'Life is like a box of chocolates.');
        await addMovie('Pulp Fiction', 1994, 'Royale with Cheese.');

        console.log('\n--- Adding/Updating People (Actors) ---');
        await addPerson('Keanu Reeves', 1964);
        await addPerson('Carrie-Anne Moss', 1967);
        await addPerson('Laurence Fishburne', 1961);
        await addPerson('Leonardo DiCaprio', 1974);
        await addPerson('Tom Hanks', 1956);
        await addPerson('Uma Thurman', 1970);
        await addPerson('John Travolta', 1954);

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

        console.log('\n--- Querying Data (Basic Reads) ---');
        await getMovieByTitle('The Matrix');
        await getPersonByName('Keanu Reeves');
        await getMovieByTitle('Non Existent Movie');
        await getPersonByName('Non Existent Person');

        console.log('\n--- Querying Relationships ---');
        await getMoviesByActor('Keanu Reeves');
        await getActorsInMovie('The Matrix');
        await getMoviesByActor('Non Existent Actor');
        await getActorsInMovie('Non Existent Movie Title');

    } catch (error) {
        console.error('An error occurred during main execution:', error);
    } finally {
        // Ensure the driver is closed even if an error occurs
        await closeDriver();
    }
}

// --- Execute the main function ---
main();