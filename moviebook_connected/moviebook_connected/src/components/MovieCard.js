
import React from "react";
import { useNavigate } from "react-router-dom";

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();

  const openMovie = () => {
    localStorage.setItem(
      "selectedMovie",
      JSON.stringify(movie)
    );

    navigate("/MovieDetails");
  };

  return (
    <div className="movie-card">
      <style>{`

        /* =====================================
           MOVIE CARD
        ===================================== */

        .movie-card {
          width: 100%;
          height: 100%;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 3px 10px rgba(15, 23, 42, 0.07);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .movie-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 9px 22px rgba(15, 23, 42, 0.14);
        }

        /* MOVIE IMAGE */

        .movie-image {
          width: 100%;
          height: 230px;
          object-fit: cover;
          display: block;
          flex-shrink: 0;
          background: #e5e7eb;
        }

        /* CONTENT */

        .movie-content {
          padding: 11px 12px 12px;
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 145px;
        }

        /* TITLE */

        .movie-content h2 {
          height: 38px;
          margin: 0 0 5px;
          color: #111827;
          font-size: 14px;
          font-weight: 700;
          line-height: 19px;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        /* GENRE */

        .movie-genre {
          height: 20px;
          margin: 0 0 3px;
          color: #64748b;
          font-size: 11px;
          line-height: 20px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* RATING */

        .movie-rating {
          height: 20px;
          margin: 0 0 10px;
          display: flex;
          align-items: center;
          gap: 4px;
          color: #475569;
          font-size: 12px;
        }

        .movie-star {
          color: #f59e0b;
          font-size: 14px;
        }

        /* BUTTON */

        .movie-btn {
          width: 100%;
          height: 32px;
          margin-top: auto;
          padding: 7px 10px;
          border: none;
          border-radius: 4px;
          background: #087ff5;
          color: white;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .movie-btn:hover {
          background: #006fe6;
          transform: translateY(-1px);
        }

        /* RESPONSIVE */

        @media (max-width: 800px) {
          .movie-image {
            height: 230px;
          }
        }

        @media (max-width: 500px) {
          .movie-image {
            height: 190px;
          }

          .movie-content {
            padding: 9px;
          }

          .movie-content h2 {
            font-size: 12px;
            line-height: 17px;
            height: 34px;
          }

          .movie-btn {
            height: 30px;
            font-size: 10px;
          }
        }

      `}</style>

      {/* MOVIE IMAGE WITH LAZY LOADING */}

      <img
        className="movie-image"
        src={movie.image || movie.poster || "https://via.placeholder.com/300x450?text=No+Image"}
        alt={movie.title || "Movie poster"}
        loading="lazy"
        decoding="async"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src =
            "https://via.placeholder.com/300x450?text=No+Image";
        }}
      />

      {/* MOVIE CONTENT */}

      <div className="movie-content">

        <h2>
          {movie.title}
        </h2>

        <p className="movie-genre">
          {movie.genre || "Genre"}
        </p>

        <div className="movie-rating">
          <span className="movie-star">★</span>

          <span>
            {movie.rating || "N/A"}
          </span>
        </div>

        <button
          className="movie-btn"
          onClick={openMovie}
        >
          View Details
        </button>

      </div>
    </div>
  );
};

export default MovieCard;
