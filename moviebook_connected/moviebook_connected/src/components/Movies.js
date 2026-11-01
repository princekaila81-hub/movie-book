
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import MovieCard from "./MovieCard";
import { getMovies } from "../api";

const Movies = () => {
  const location = useLocation();

  const [movies, setMovies] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("All");

  // SEARCH QUERY FROM HEADER
  const searchQuery =
    new URLSearchParams(location.search).get("search") || "";

  // LOAD MOVIES
  useEffect(() => {
    const loadMovies = async () => {
      try {
        const data = await getMovies();

        setMovies(
          Array.isArray(data.movies)
            ? data.movies
            : []
        );
      } catch (error) {
        console.error("Unable to load movies:", error);
        setMovies([]);
      }
    };

    loadMovies();
  }, []);

  // GENRE + SEARCH FILTER
  const filteredMovies = movies.filter((movie) => {
    // GENRE FILTER
    const genreMatch =
      selectedGenre === "All" ||
      (
        movie.genre &&
        movie.genre
          .toString()
          .toLowerCase()
          .split(/[,|]/)
          .map((genre) => genre.trim())
          .includes(selectedGenre.toLowerCase())
      );

    // SEARCH FILTER
    const query = searchQuery.trim().toLowerCase();

    const searchMatch =
      !query ||
      [
        movie.title,
        movie.name,
        movie.genre,
        movie.theatre,
        movie.description,
        movie.language
      ].some((value) =>
        value &&
        value.toString().toLowerCase().includes(query)
      );

    return genreMatch && searchMatch;
  });

  // GENRES
  const genres = [
    "All",
    "Action",
    "Drama",
    "Comedy",
    "Thriller",
    "Horror",
    "Sci-Fi",
    "Adventure"
  ];

  return (
    <>
      <style>{`

        * {
          box-sizing: border-box;
        }

        /* =====================================
           MAIN PAGE
        ===================================== */

        .movies-page {
          min-height: calc(100vh - 58px);
          background: #f4f7fb;
          padding: 25px 35px 50px;
          color: #111827;
        }

        .movies-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* =====================================
           TITLE
        ===================================== */

        .movies-title {
          margin: 0 0 16px;
          text-align: left;
          font-size: 26px;
          font-weight: 800;
          color: #111827;
        }

        /* =====================================
           GENRE FILTER
        ===================================== */

        .movie-categories {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .category-btn {
          padding: 7px 18px;
          border: 1px solid #e2e8f0;
          border-radius: 5px;
          background: white;
          color: #64748b;
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: 0.2s;
        }

        .category-btn:hover {
          border-color: #087ff5;
          color: #087ff5;
        }

        /* ACTIVE GENRE */

        .category-btn.active {
          background: #087ff5;
          border-color: #087ff5;
          color: white;
          font-weight: 600;
        }

        .category-btn.active:hover {
          background: #006fe6;
          border-color: #006fe6;
          color: white;
        }

        /* =====================================
           MOVIE GRID
        ===================================== */

        .movies-grid {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }

        /* =====================================
           MOVIE CARD
        ===================================== */

        .movies-grid > * {
          min-width: 0;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 7px;
          padding: 10px;
          box-shadow: 0 3px 10px rgba(15, 23, 42, 0.06);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .movies-grid > *:hover {
          transform: translateY(-4px);
          box-shadow: 0 9px 22px rgba(15, 23, 42, 0.12);
        }

        /* =====================================
           IMAGE
        ===================================== */

        .movies-grid img {
          width: 100%;
          height: 220px;
          object-fit: cover;
          display: block;
          border-radius: 5px;
        }

        /* =====================================
           TEXT
        ===================================== */

        .movies-grid h2,
        .movies-grid h3,
        .movies-grid h4 {
          margin-top: 8px;
          margin-bottom: 5px;
          color: #111827;
          font-weight: 700;
        }

        .movies-grid p {
          margin-top: 4px;
          margin-bottom: 5px;
          color: #64748b;
          font-size: 12px;
        }

        /* =====================================
           BUTTON
        ===================================== */

        .movies-grid button {
          border: none;
          border-radius: 4px;
          background: #087ff5;
          color: white;
          padding: 7px 16px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
        }

        .movies-grid button:hover {
          background: #006fe6;
        }

        /* =====================================
           NO MOVIES
        ===================================== */

        .movies-empty {
          grid-column: 1 / -1;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 50px 20px;
          text-align: center;
          color: #64748b;
        }

        .movies-empty h3 {
          margin: 0 0 8px;
          color: #111827;
          font-size: 18px;
        }

        .movies-empty p {
          margin: 0;
          font-size: 13px;
        }

        /* =====================================
           RESULT COUNT
        ===================================== */

        .movie-result-count {
          margin: 0 0 15px;
          color: #64748b;
          font-size: 12px;
        }

        /* =====================================
           RESPONSIVE
        ===================================== */

        @media (max-width: 1100px) {
          .movies-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 800px) {
          .movies-page {
            padding: 20px;
          }

          .movies-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 14px;
          }

          .movies-grid img {
            height: 240px;
          }
        }

        @media (max-width: 500px) {
          .movies-page {
            padding: 15px;
          }

          .movies-title {
            font-size: 22px;
          }

          .movie-categories {
            gap: 6px;
          }

          .category-btn {
            padding: 6px 12px;
            font-size: 10px;
          }

          .movies-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }

          .movies-grid > * {
            padding: 7px;
          }

          .movies-grid img {
            height: 190px;
          }
        }

      `}</style>

      <div className="movies-page">

        <div className="movies-container">

          {/* TITLE */}

          <h1 className="movies-title">
            All Movies
          </h1>

          {/* GENRE BUTTONS */}

          <div className="movie-categories">

            {genres.map((genre) => (

              <button
                key={genre}
                className={`category-btn ${
                  selectedGenre === genre ? "active" : ""
                }`}
                onClick={() => setSelectedGenre(genre)}
              >
                {genre}
              </button>

            ))}

          </div>

          {/* RESULT COUNT */}

          <p className="movie-result-count">
            {searchQuery
              ? `Found ${filteredMovies.length} movies for "${searchQuery}"`
              : selectedGenre === "All"
                ? `Showing all ${movies.length} movies`
                : `Showing ${filteredMovies.length} ${selectedGenre} movies`}
          </p>

          {/* FILTERED MOVIES */}

          <div className="movies-grid">

            {filteredMovies.length > 0 ? (

              filteredMovies.map((movie) => (

                <MovieCard
                  key={movie.id || movie._id}
                  movie={movie}
                />

              ))

            ) : (

              <div className="movies-empty">

                <h3>
                  {searchQuery
                    ? "No Movies Found"
                    : `No ${selectedGenre} Movies Found`}
                </h3>

                <p>
                  {searchQuery
                    ? `No movies found for "${searchQuery}". Try another movie name.`
                    : "There are currently no movies available in this genre."}
                </p>

              </div>

            )}

          </div>

        </div>

      </div>
    </>
  );
};

export default Movies;
