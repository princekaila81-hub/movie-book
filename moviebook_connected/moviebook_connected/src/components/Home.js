
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMovies } from "../api";

// Fallback images: used when fewer than 4 movie images are available
const fallbackSlides = [
  {
    image:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=2000&q=90",
    title: "Movie Experience",
  },
  {
    image:
      "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=2000&q=90",
    title: "Cinema Magic",
  },
  {
    image:
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=2000&q=90",
    title: "Big Screen Entertainment",
  },
  {
    image:
      "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=2000&q=90",
    title: "Unforgettable Stories",
  },
];

const Home = () => {
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const loadMovies = async () => {
      try {
        const data = await getMovies();

        if (Array.isArray(data)) {
          setMovies(data);
        } else if (Array.isArray(data.movies)) {
          setMovies(data.movies);
        } else {
          setMovies([]);
        }
      } catch (error) {
        console.error("Failed to load movies:", error);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, []);

  // Get movie images for hero slideshow
  const movieSlides = movies
    .filter((movie) => movie.image || movie.poster)
    .slice(0, 4)
    .map((movie) => ({
      image: movie.image || movie.poster,
      title: movie.title || "Now Showing",
    }));

  // Fill remaining slides with fallback images
  const heroSlides = [
    ...movieSlides,
    ...fallbackSlides.slice(0, Math.max(0, 4 - movieSlides.length)),
  ];

  // Automatic slideshow: changes every 4 seconds
  useEffect(() => {
    if (heroSlides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((previous) => (previous + 1) % heroSlides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((previous) => (previous + 1) % heroSlides.length);
  };

  const previousSlide = () => {
    setCurrentSlide(
      (previous) =>
        (previous - 1 + heroSlides.length) % heroSlides.length
    );
  };

  const handleBookMovie = (movie) => {
    localStorage.setItem("selectedMovie", JSON.stringify(movie));
    navigate("/BookNow");
  };

  const handleBrowseMovies = () => {
    navigate("/Movies");
  };

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        .home-page {
          min-height: 100vh;
          padding-bottom: 55px;
          background: #f5f6fa;
          color: #172033;
          font-family: Arial, sans-serif;
        }

        /* HERO SECTION */

        .hero-section {
          position: relative;
          width: calc(100% - 60px);
          max-width: 1500px;
          min-height: 620px;
          margin: 22px auto 0;
          overflow: hidden;
          border-radius: 17px;
          background: #101827;
          display: flex;
          align-items: center;
          box-shadow: 0 12px 35px rgba(25,35,55,.15);
        }

        .hero-background {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          transition: opacity .7s ease, transform 5s ease;
          animation: heroFade .8s ease;
        }

        .hero-section:hover .hero-background {
          transform: scale(1.025);
        }

        @keyframes heroFade {
          from {
            opacity: .45;
          }
          to {
            opacity: 1;
          }
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            rgba(5,12,27,.94) 0%,
            rgba(5,12,27,.78) 40%,
            rgba(5,12,27,.30) 75%,
            rgba(5,12,27,.10) 100%
          );
        }

        .hero-content {
          position: relative;
          z-index: 2;
          width: 700px;
          max-width: 75%;
          padding: 55px 65px;
          color: white;
        }

        .hero-brand {
          font-size: 30px;
          font-weight: 900;
          margin-bottom: 30px;
          letter-spacing: -1px;
        }

        .hero-brand span {
          color: #c084fc;
        }

        .hero-tagline {
          display: inline-block;
          color: #d8b4fe;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 3px;
          margin-bottom: 18px;
        }

        .hero-content h1 {
          max-width: 650px;
          margin: 0;
          font-size: clamp(38px,5vw,65px);
          line-height: 1.08;
          font-weight: 900;
          letter-spacing: -1.5px;
        }

        .hero-content p {
          max-width: 570px;
          margin: 22px 0 30px;
          color: #e2e8f0;
          font-size: 16px;
          line-height: 1.8;
        }

        .browse-btn,
        .movie-book-btn {
          border: none;
          border-radius: 8px;
          background: linear-gradient(135deg,#a855f7,#7c3aed);
          color: white;
          padding: 14px 24px;
          font-weight: bold;
          cursor: pointer;
          transition: .3s;
        }

        .browse-btn:hover,
        .movie-book-btn:hover {
          background: #7e22ce;
          transform: translateY(-2px);
        }

        /* HERO ARROWS */

        .hero-arrow {
          position: absolute;
          z-index: 4;
          top: 50%;
          transform: translateY(-50%);
          width: 45px;
          height: 45px;
          border: none;
          border-radius: 50%;
          background: white;
          color: #172033;
          font-size: 30px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: .3s;
        }

        .hero-arrow:hover {
          background: #a855f7;
          color: white;
        }

        .hero-arrow.left {
          left: 20px;
        }

        .hero-arrow.right {
          right: 20px;
        }

        /* DOTS */

        .hero-dots {
          position: absolute;
          z-index: 4;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 9px;
        }

        .hero-dot {
          width: 10px;
          height: 10px;
          padding: 0;
          border: none;
          border-radius: 20px;
          background: rgba(255,255,255,.65);
          cursor: pointer;
          transition: .3s;
        }

        .hero-dot.active {
          width: 28px;
          background: #c084fc;
        }

        /* MOVIES SECTION */

        .movies-section {
          width: calc(100% - 100px);
          max-width: 1450px;
          margin: 65px auto 0;
        }

        .movies-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 28px;
        }

        .section-label {
          display: block;
          color: #9333ea;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 3px;
          margin-bottom: 10px;
        }

        .movies-header h2 {
          margin: 0 0 9px;
          color: #172033;
          font-size: 32px;
          font-weight: 900;
        }

        .movies-header p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
        }

        .view-all-btn {
          border: none;
          background: transparent;
          color: #9333ea;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
        }

        .view-all-btn:hover {
          color: #6b21a8;
        }

        /* MOVIE GRID */

        .movie-grid {
          display: grid;
          grid-template-columns: repeat(6,minmax(0,1fr));
          gap: 19px;
        }

        .movie-card {
          min-width: 0;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          border-radius: 11px;
          background: white;
          box-shadow: 0 4px 15px rgba(15,23,42,.06);
          transition: .3s ease;
        }

        .movie-card:hover {
          transform: translateY(-7px);
          border-color: #c084fc;
          box-shadow: 0 13px 30px rgba(15,23,42,.13);
        }

        .movie-poster-wrapper {
          position: relative;
          overflow: hidden;
          aspect-ratio: 2/3;
          background: #e5e7eb;
        }

        .movie-poster {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform .5s ease;
        }

        .movie-card:hover .movie-poster {
          transform: scale(1.07);
        }

        .movie-poster-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(15,23,42,.55);
          opacity: 0;
          transition: .3s ease;
        }

        .movie-card:hover .movie-poster-overlay {
          opacity: 1;
        }

        .movie-details {
          padding: 14px;
        }

        .movie-title {
          margin: 0 0 7px;
          color: #172033;
          font-size: 14px;
          font-weight: 800;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .movie-genre {
          margin: 0 0 13px;
          color: #64748b;
          font-size: 12px;
        }

        .movie-book-btn {
          width: 100%;
          padding: 10px;
          font-size: 12px;
        }

        .mobile-book-btn {
          display: none;
        }

        /* LOADING */

        .loading-box {
          min-height: 200px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 15px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: white;
          color: #64748b;
        }

        .loading-spinner {
          width: 35px;
          height: 35px;
          border: 3px solid #e9d5ff;
          border-top-color: #9333ea;
          border-radius: 50%;
          animation: homeSpin .8s linear infinite;
        }

        @keyframes homeSpin {
          to {
            transform: rotate(360deg);
          }
        }

        /* NO MOVIES */

        .no-movies {
          padding: 55px 20px;
          text-align: center;
          border: 1px dashed #d1d5db;
          border-radius: 12px;
          background: white;
          color: #64748b;
        }

        .no-movies h3 {
          margin: 0 0 9px;
          color: #172033;
          font-size: 20px;
        }

        /* INFORMATION */

        .home-info {
          width: calc(100% - 100px);
          max-width: 1450px;
          margin: 60px auto 0;
          display: grid;
          grid-template-columns: repeat(3,minmax(0,1fr));
          gap: 20px;
        }

        .info-card {
          display: flex;
          align-items: flex-start;
          gap: 17px;
          padding: 25px 22px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: white;
          box-shadow: 0 4px 15px rgba(15,23,42,.04);
          transition: .3s;
        }

        .info-card:hover {
          transform: translateY(-5px);
          border-color: #c084fc;
          box-shadow: 0 10px 25px rgba(15,23,42,.08);
        }

        .info-icon {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: #f3e8ff;
          font-size: 23px;
        }

        .info-card h3 {
          margin: 2px 0 9px;
          color: #172033;
          font-size: 17px;
        }

        .info-card p {
          margin: 0;
          color: #64748b;
          font-size: 13px;
          line-height: 1.7;
        }

        /* RESPONSIVE */

        @media(max-width:1200px) {
          .movie-grid {
            grid-template-columns: repeat(4,minmax(0,1fr));
          }

          .home-info {
            grid-template-columns: repeat(2,minmax(0,1fr));
          }
        }

        @media(max-width:900px) {
          .hero-section {
            width: calc(100% - 30px);
            min-height: 550px;
          }

          .hero-content {
            max-width: 85%;
            padding: 40px;
          }

          .hero-content h1 {
            font-size: 43px;
          }

          .movies-section,
          .home-info {
            width: calc(100% - 50px);
          }

          .movie-grid {
            grid-template-columns: repeat(3,minmax(0,1fr));
          }
        }

        @media(max-width:600px) {
          .hero-section {
            width: calc(100% - 20px);
            min-height: 520px;
            margin-top: 10px;
          }

          .hero-overlay {
            background: rgba(5,12,27,.76);
          }

          .hero-content {
            max-width: 100%;
            padding: 28px;
          }

          .hero-content h1 {
            font-size: 35px;
          }

          .hero-content p {
            font-size: 14px;
          }

          .hero-arrow {
            width: 34px;
            height: 34px;
            font-size: 23px;
          }

          .hero-arrow.left {
            left: 7px;
          }

          .hero-arrow.right {
            right: 7px;
          }

          .movies-section,
          .home-info {
            width: calc(100% - 30px);
          }

          .movies-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .movies-header h2 {
            font-size: 26px;
          }

          .movie-grid {
            grid-template-columns: repeat(2,minmax(0,1fr));
            gap: 13px;
          }

          .movie-details {
            padding: 11px;
          }

          .movie-poster-overlay {
            display: none;
          }

          .mobile-book-btn {
            display: block;
          }

          .home-info {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="home-page">
        <section className="hero-section">

          {/* SLIDESHOW BACKGROUND */}
          <div
            key={heroSlides[currentSlide]?.image}
            className="hero-background"
            style={{
              backgroundImage: `url("${heroSlides[currentSlide]?.image}")`,
            }}
          />

          <div className="hero-overlay"></div>

          {/* PREVIOUS BUTTON */}
          <button
            className="hero-arrow left"
            aria-label="Previous slide"
            onClick={previousSlide}
          >
            ‹
          </button>

          <div className="hero-content">
            <div className="hero-brand">
              <span>Movie</span>Book
            </div>

            <span className="hero-tagline">
              YOUR CINEMATIC JOURNEY STARTS HERE
            </span>

            <h1>
              Experience
              <br />
              Movies Like Never Before
            </h1>

            <p>
              Book tickets for the latest movies in your favourite
              theatres. Discover amazing stories, choose your seats
              and enjoy the big screen experience.
            </p>

            <button
              className="browse-btn"
              onClick={handleBrowseMovies}
            >
              ▶ Explore Movies →
            </button>
          </div>

          {/* NEXT BUTTON */}
          <button
            className="hero-arrow right"
            aria-label="Next slide"
            onClick={nextSlide}
          >
            ›
          </button>

          {/* SLIDE DOTS */}
          <div className="hero-dots">
            {heroSlides.map((slide, index) => (
              <button
                key={slide.image + index}
                className={`hero-dot ${
                  currentSlide === index ? "active" : ""
                }`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </section>

        {/* MOVIES SECTION */}
        <section className="movies-section">
          <div className="movies-header">
            <div>
              <span className="section-label">NOW SHOWING</span>
              <h2>Trending Movies</h2>
              <p>Discover the latest movies playing in theatres.</p>
            </div>

            <button
              className="view-all-btn"
              onClick={handleBrowseMovies}
            >
              View All Movies →
            </button>
          </div>

          {loading && (
            <div className="loading-box">
              <div className="loading-spinner"></div>
              <p>Loading movies...</p>
            </div>
          )}

          {!loading && movies.length === 0 && (
            <div className="no-movies">
              <h3>No Movies Available</h3>
              <p>Please add movies from the Admin Panel.</p>
            </div>
          )}

          {!loading && movies.length > 0 && (
            <div className="movie-grid">
              {movies.map((movie) => (
                <div className="movie-card" key={movie._id}>
                  <div className="movie-poster-wrapper">
                    <img
                      className="movie-poster"
                      src={
                        movie.image ||
                        movie.poster ||
                        "https://via.placeholder.com/300x450?text=No+Image"
                      }
                      alt={movie.title}
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/300x450?text=No+Image";
                      }}
                    />

                    <div className="movie-poster-overlay">
                      <button
                        className="movie-book-btn"
                        onClick={() => handleBookMovie(movie)}
                      >
                        Book Tickets
                      </button>
                    </div>
                  </div>

                  <div className="movie-details">
                    <h3 className="movie-title">{movie.title}</h3>

                    <p className="movie-genre">
                      {movie.genre || "Movie"}
                    </p>

                    <button
                      className="movie-book-btn mobile-book-btn"
                      onClick={() => handleBookMovie(movie)}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* INFORMATION SECTION */}
        <section className="home-info">
          <div className="info-card">
            <div className="info-icon">🎬</div>
            <div>
              <h3>Latest Movies</h3>
              <p>
                Discover the latest movies playing in theatres and
                book your favourite seats.
              </p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">🎟️</div>
            <div>
              <h3>Easy Booking</h3>
              <p>
                Select your movie, theatre, showtime and seats in
                just a few simple steps.
              </p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">🍿</div>
            <div>
              <h3>Enjoy Your Movie</h3>
              <p>
                Complete your booking and enjoy your favourite movie
                with MovieBook.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
