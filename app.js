const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const path = require("path");
const databasePath = path.join(__dirname, "moviesData.db");

let database = null;

const initializeDBServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("starting server at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`error at ${e.message}`);
    process.exit(1);
  }
};

initializeDBServer();

const convertmovieRequestobjectToResponsiveObject = (object) => {
  return {
    movieId: object.movie_id,
    directorId: object.director_id,
    movieName: object.movie_name,
    leadActor: object.lead_actor,
  };
};

const convertDirectorRequestToResponsiveObject = (object) => {
  return {
    directorId: object.director_id,
    directorName: object.director_name,
  };
};

//get movieNames

app.get("/movies/", async (request, response) => {
  const getMoviesNamesQuery = `
    select
    *
    from
    movie;`;
  const movies = await database.all(getMoviesNamesQuery);
  console.log(movies);
  response.send(
    movies.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

//post movie api
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMoivieQuery = `
    insert into
    movie(director_id,movie_name,lead_actor)
    values(
        ${directorId},
        '${movieName}',
        '${leadActor}'
    );`;
  await database.run(postMoivieQuery);
  response.send("Movie Successfully Added");
});

//get movie api
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT 
      *
    FROM 
      movie 
    WHERE 
      movie_id = ${movieId};`;
  const movie = await database.get(getMovieQuery);
  response.send(convertmovieRequestobjectToResponsiveObject(movie));
});

//put or update movie

app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;

  const { movieId } = request.params;
  const updateMovieQuery = `
            UPDATE
              movie
            SET
              director_id = ${directorId},
              movie_name = '${movieName}',
              lead_actor = '${leadActor}'
            WHERE
              movie_id = ${movieId};`;

  await database.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//delete movie
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    delete from
    movie
    where
    movie_id=${movieId};`;
  await database.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//get director api
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    select
    *
    from 
    director;`;
  const directors = await database.all(getDirectorsQuery);
  response.send(
    directors.map((eachDirector) =>
      convertDirectorRequestToResponsiveObject(eachDirector)
    )
  );
});

//get directed movie names api
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie
    WHERE
      director_id='${directorId}';`;
  const moviesArray = await database.all(getDirectorMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});
module.exports = app;
