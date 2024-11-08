const { Pool } = require('pg');

// PostgreSQL connection
const pool = new Pool({
  user: 'postgres', //This _should_ be your username, as it's the default one Postgres uses
  host: 'localhost',
  database: 'movie_rental_db', //This should be changed to reflect your actual database
  password: '1234', //This should be changed to reflect the password you used when setting up Postgres
  port: 5432,
});




/**
 * Creates the database tables, if they do not already exist.
 */
async function createTable() {
  const createMoviesTableQuery = `
    CREATE TABLE IF NOT EXISTS Movies (
      movie_id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      release_year INT NOT NULL,
      genre VARCHAR(100) NOT NULL,
      director VARCHAR(255) NOT NULL
    );
  `;
  
  const createCustomersTableQuery = `
    CREATE TABLE IF NOT EXISTS Customers (
      customer_id SERIAL PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone_number TEXT NOT NULL
    );
  `;
  
  const createRentalsTableQuery = `
    CREATE TABLE IF NOT EXISTS Rentals (
      rental_id SERIAL PRIMARY KEY,
      customer_id INT REFERENCES Customers(customer_id) ON DELETE CASCADE,
      movie_id INT REFERENCES Movies(movie_id) ON DELETE CASCADE,
      rental_date DATE NOT NULL,
      return_date DATE
    );
  `;

  try {
    await pool.query(createMoviesTableQuery);
    await pool.query(createCustomersTableQuery);
    await pool.query(createRentalsTableQuery);
    console.log("Tables created successfully.");
  } catch (err) {
    console.error("Error creating tables:", err);
  }
}


/**
 * Inserts a new movie into the Movies table.
 * 
 * @param {string} title Title of the movie
 * @param {number} year Year the movie was released
 * @param {string} genre Genre of the movie
 * @param {string} director Director of the movie
 */
async function insertMovie(title, year, genre, director) {
  const insertMovieQuery = `
    INSERT INTO Movies (title, release_year, genre, director)
    VALUES ($1, $2, $3, $4)
    RETURNING movie_id;
  `;

  try {
    const res = await pool.query(insertMovieQuery, [title, year, genre, director]);
    console.log(`Movie added with ID: ${res.rows[0].movie_id}`);
  } catch (err) {
    console.error("Error inserting movie:", err);
  }
}


/**
 * Prints all movies in the database to the console
 */
async function displayMovies() {
  const displayMoviesQuery = `SELECT * FROM Movies;`;

  try {
    const res = await pool.query(displayMoviesQuery);
    res.rows.forEach(movie => {
      console.log(`ID: ${movie.movie_id}, Title: ${movie.title}, Year: ${movie.release_year}, Genre: ${movie.genre}, Director: ${movie.director}`);
    });
  } catch (err) {
    console.error("Error displaying movies:", err);
  }
}


/**
 * Updates a customer's email address.
 * 
 * @param {number} customerId ID of the customer
 * @param {string} newEmail New email address of the customer
 */
async function updateCustomerEmail(customerId, newEmail) {
  const updateEmailQuery = `
    UPDATE Customers
    SET email = $1
    WHERE customer_id = $2
    RETURNING email;
  `;

  try {
    const res = await pool.query(updateEmailQuery, [newEmail, customerId]);
    if (res.rowCount > 0) {
      console.log(`Customer's email updated to: ${res.rows[0].email}`);
    } else {
      console.log("Customer not found.");
    }
  } catch (err) {
    console.error("Error updating customer email:", err);
  }
}


/**
 * Removes a customer from the database along with their rental history.
 * 
 * @param {number} customerId ID of the customer to remove
 */
async function removeCustomer(customerId) {
  const deleteCustomerQuery = `DELETE FROM Customers WHERE customer_id = $1;`;

  try {
    const res = await pool.query(deleteCustomerQuery, [customerId]);
    if (res.rowCount > 0) {
      console.log("Customer and rental history removed.");
    } else {
      console.log("Customer not found.");
    }
  } catch (err) {
    console.error("Error removing customer:", err);
  }
}


/**
 * Prints a help message to the console
 */
function printHelp() {
  console.log('Usage:');
  console.log('  insert <title> <year> <genre> <director> - Insert a movie');
  console.log('  show - Show all movies');
  console.log('  update <customer_id> <new_email> - Update a customer\'s email');
  console.log('  remove <customer_id> - Remove a customer from the database');
}

/**
 * Runs our CLI app to manage the movie rentals database
 */
async function runCLI() {
  await createTable();

  const args = process.argv.slice(2);
  switch (args[0]) {
    case 'insert':
      if (args.length !== 5) {
        printHelp();
        return;
      }
      await insertMovie(args[1], parseInt(args[2]), args[3], args[4]);
      break;
    case 'show':
      await displayMovies();
      break;
    case 'update':
      if (args.length !== 3) {
        printHelp();
        return;
      }
      await updateCustomerEmail(parseInt(args[1]), args[2]);
      break;
    case 'remove':
      if (args.length !== 2) {
        printHelp();
        return;
      }
      await removeCustomer(parseInt(args[1]));
      break;
    default:
      printHelp();
      break;
  }
};

runCLI();
