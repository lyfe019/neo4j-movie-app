# Neo4j Movie & Actor Connection Manager (Node.js)

A simple Node.js application demonstrating basic CRUD (Create, Read, Update, Delete - though we only implemented C and R for now) operations and relationship management with a Neo4j graph database. This project focuses on connecting actors to movies via "ACTED_IN" relationships, including roles as relationship properties.

## Features

-   Connects to a Neo4j database using `neo4j-driver`.
-   Tests database connectivity.
-   Creates unique constraints for `Movie` titles and `Person` names.
-   Adds/updates `Movie` nodes (title, released, tagline).
-   Adds/updates `Person` nodes (name, born).
-   Establishes `ACTED_IN` relationships between `Person` and `Movie` nodes, including `roles` as a property.
-   Queries `Movie` and `Person` nodes by their unique identifiers.
-   Queries relationships: find movies an actor acted in, and find actors in a specific movie.
-   Modularized codebase for better organization (`src/movieService.js`).

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

1.  **Node.js**: Make sure you have Node.js (LTS version recommended) installed. You can download it from [nodejs.org](https://nodejs.org/).
2.  **Neo4j Database**: You need a running Neo4j instance.
    * **Neo4j Desktop**: Recommended for local development. Download from [neo4j.com/download](https://neo4j.com/download/). Create a new local database.
    * **Docker**: You can run Neo4j via Docker:
        ```bash
        docker run --name neo4j-movie-db -p 7474:7474 -p 7687:7687 -e NEO4J_AUTH=neo4j/<your_password> neo4j:latest
        ```
        Replace `<your_password>` with a strong password.
    * Ensure your Neo4j database is running and accessible.

### Installation

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/your-username/neo4j-movie-app.git](https://github.com/your-username/neo4j-movie-app.git)
    cd neo4j-movie-app
    ```
    (Replace `your-username` with your actual GitHub username.)

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

### Configuration

Open `src/movieService.js` and update the database connection details:

```javascript
const URI = 'bolt://127.0.0.1:7687'; // Your Neo4j URI (usually localhost)
const USER = 'neo4j'; // Your Neo4j username
const PASSWORD = 'your_neo4j_password'; // <<< IMPORTANT: REPLACE WITH YOUR ACTUAL PASSWORD!