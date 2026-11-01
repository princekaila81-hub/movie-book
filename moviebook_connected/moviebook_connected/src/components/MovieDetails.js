
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const MovieDetails = () => {
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);

  useEffect(() => {
    try {
      const data = JSON.parse(
        localStorage.getItem("selectedMovie")
      );

      if (!data) {
        navigate("/Movies");
        return;
      }

      setMovie(data);
    } catch {
      navigate("/Movies");
    }
  }, [navigate]);

  const bookNow = () => {
    const user = JSON.parse(
      localStorage.getItem("loggedInUser") || "null"
    );

    if (!user) {
      localStorage.setItem(
        "redirectAfterLogin",
        "/BookNow"
      );

      navigate("/Login");

      return;
    }

    navigate("/Theatres");
  };

  if (!movie) {
    return (
      <>
        <style>{`
          .details-loading {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f4f7fb;
            color: #111827;
            font-size: 20px;
            font-weight: 600;
          }
        `}</style>

        <div className="details-loading">
          Loading...
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`

        * {
          box-sizing: border-box;
        }

        /* =====================================
           PAGE
        ===================================== */

        .details-page {
          min-height: calc(100vh - 58px);

          padding: 28px 35px 50px;

          background: #f4f7fb;

          color: #111827;
        }

        .details-container {
          max-width: 1150px;

          margin: 0 auto;
        }

        /* =====================================
           MAIN MOVIE SECTION
        ===================================== */

        .details-card {
          width: 100%;

          background: white;

          border: 1px solid #e2e8f0;

          border-radius: 8px;

          padding: 22px;

          display: flex;

          gap: 28px;

          box-shadow:
            0 4px 14px
            rgba(15, 23, 42, 0.07);
        }

        /* =====================================
           POSTER
        ===================================== */

        .details-poster-wrapper {
          width: 260px;

          min-width: 260px;

          height: 370px;

          overflow: hidden;

          border-radius: 6px;

          background: #e5e7eb;
        }

        .details-poster {
          width: 100%;

          height: 100%;

          object-fit: cover;

          display: block;
        }

        /* =====================================
           MOVIE INFORMATION
        ===================================== */

        .details-info {
          flex: 1;

          padding: 4px 5px;

          display: flex;

          flex-direction: column;

          align-items: flex-start;
        }

        /* =====================================
           TITLE
        ===================================== */

        .details-title-row {
          display: flex;

          align-items: center;

          gap: 10px;

          margin-bottom: 8px;

          flex-wrap: wrap;
        }

        .details-info h1 {
          margin: 0;

          color: #111827;

          font-size: 28px;

          font-weight: 800;

          line-height: 35px;
        }

        /* =====================================
           NOW PLAYING
        ===================================== */

        .now-playing {
          display: inline-flex;

          align-items: center;

          padding: 5px 9px;

          border-radius: 4px;

          background: #087ff5;

          color: white;

          font-size: 10px;

          font-weight: 600;
        }

        /* =====================================
           MOVIE META
        ===================================== */

        .details-meta {
          display: flex;

          align-items: center;

          flex-wrap: wrap;

          gap: 8px;

          margin-bottom: 15px;

          color: #64748b;

          font-size: 13px;
        }

        .details-rating {
          color: #111827;

          font-weight: 600;
        }

        .details-star {
          color: #f59e0b;

          margin-right: 3px;
        }

        .meta-divider {
          color: #cbd5e1;
        }

        /* =====================================
           DESCRIPTION
        ===================================== */

        .details-description {
          max-width: 600px;

          margin: 0 0 22px;

          color: #64748b;

          font-size: 14px;

          line-height: 1.7;
        }

        /* =====================================
           BOOK BUTTON
        ===================================== */

        .book-btn {
          min-width: 145px;

          padding: 11px 22px;

          border: none;

          border-radius: 5px;

          background: #087ff5;

          color: white;

          font-size: 13px;

          font-weight: 700;

          cursor: pointer;

          transition: 0.2s ease;
        }

        .book-btn:hover {
          background: #006fe6;

          transform: translateY(-1px);

          box-shadow:
            0 4px 10px
            rgba(8, 127, 245, 0.25);
        }

        /* =====================================
           ABOUT + CAST SECTION
        ===================================== */

        .details-bottom {
          display: grid;

          grid-template-columns: 1fr 300px;

          gap: 25px;

          margin-top: 25px;
        }

        /* =====================================
           ABOUT MOVIE
        ===================================== */

        .about-movie {
          background: white;

          border: 1px solid #e2e8f0;

          border-radius: 8px;

          padding: 20px;

          box-shadow:
            0 3px 10px
            rgba(15, 23, 42, 0.05);
        }

        .about-movie h2 {
          margin: 0 0 10px;

          color: #111827;

          font-size: 20px;

          font-weight: 800;
        }

        .about-movie p {
          margin: 0;

          color: #64748b;

          font-size: 13px;

          line-height: 1.7;
        }

        /* =====================================
           CAST CARD
        ===================================== */

        .cast-card {
          background: white;

          border: 1px solid #e2e8f0;

          border-radius: 8px;

          padding: 18px;

          box-shadow:
            0 3px 10px
            rgba(15, 23, 42, 0.05);
        }

        .cast-card h2 {
          margin: 0 0 15px;

          color: #111827;

          font-size: 18px;

          font-weight: 800;
        }

        .cast-placeholder {
          display: flex;

          align-items: center;

          gap: 10px;

          padding: 8px 0;

          border-bottom: 1px solid #f1f5f9;

          color: #475569;

          font-size: 12px;
        }

        .cast-placeholder:last-child {
          border-bottom: none;
        }

        .cast-icon {
          width: 38px;

          height: 38px;

          border-radius: 6px;

          display: flex;

          align-items: center;

          justify-content: center;

          background: #e8f2ff;

          font-size: 18px;
        }

        /* =====================================
           RESPONSIVE
        ===================================== */

        @media (max-width: 850px) {

          .details-card {
            flex-direction: column;

            align-items: center;
          }

          .details-poster-wrapper {
            width: 260px;

            min-width: 260px;
          }

          .details-info {
            width: 100%;

            align-items: flex-start;
          }

          .details-bottom {
            grid-template-columns: 1fr;
          }

        }

        @media (max-width: 600px) {

          .details-page {
            padding: 18px 15px 35px;
          }

          .details-card {
            padding: 15px;

            gap: 18px;
          }

          .details-poster-wrapper {
            width: 220px;

            min-width: 220px;

            height: 315px;
          }

          .details-info h1 {
            font-size: 23px;
          }

          .details-meta {
            font-size: 11px;
          }

          .details-description {
            font-size: 12px;
          }

        }

      `}</style>

      <div className="details-page">

        <div className="details-container">

          {/* =====================================
              MAIN MOVIE DETAILS
          ===================================== */}

          <div className="details-card">

            {/* POSTER */}

            <div className="details-poster-wrapper">

              <img
                className="details-poster"
                src={movie.image}
                alt={movie.title}
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/300x450?text=No+Image";
                }}
              />

            </div>

            {/* MOVIE INFO */}

            <div className="details-info">

              <div className="details-title-row">

                <h1>
                  {movie.title}
                </h1>

                <span className="now-playing">
                  Now Playing
                </span>

              </div>

              {/* META */}

              <div className="details-meta">

                <span className="details-rating">
                  <span className="details-star">
                    ★
                  </span>

                  {movie.rating || "N/A"}
                </span>

                <span className="meta-divider">
                  •
                </span>

                <span>
                  {movie.genre || "Genre"}
                </span>

                {movie.duration && (
                  <>
                    <span className="meta-divider">
                      •
                    </span>

                    <span>
                      {movie.duration}
                    </span>
                  </>
                )}

                {movie.releaseDate && (
                  <>
                    <span className="meta-divider">
                      •
                    </span>

                    <span>
                      {movie.releaseDate}
                    </span>
                  </>
                )}

              </div>

              {/* DESCRIPTION */}

              <p className="details-description">
                {movie.description ||
                  "Enjoy this movie on the big screen."}
              </p>

              {/* BOOK */}

              <button
                className="book-btn"
                onClick={bookNow}
              >
                🎟️ Book Tickets
              </button>

            </div>

          </div>

          {/* =====================================
              BOTTOM SECTION
          ===================================== */}

          <div className="details-bottom">

            {/* ABOUT */}

            <div className="about-movie">

              <h2>
                About the Movie
              </h2>

              <p>
                {movie.description ||
                  `The story of ${movie.title} and
                  an unforgettable cinematic
                  experience.`}
              </p>

            </div>

            {/* CAST */}

            <div className="cast-card">

              <h2>
                Cast
              </h2>

              <div className="cast-placeholder">

                <div className="cast-icon">
                  🎭
                </div>

                <div>
                  <strong>
                    Movie Cast
                  </strong>
                  <br />

                  <span>
                    Featured in this movie
                  </span>
                </div>

              </div>

              <div className="cast-placeholder">

                <div className="cast-icon">
                  ⭐
                </div>

                <div>
                  <strong>
                    {movie.title}
                  </strong>
                  <br />

                  <span>
                    Main Movie
                  </span>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </>
  );
};

export default MovieDetails;
