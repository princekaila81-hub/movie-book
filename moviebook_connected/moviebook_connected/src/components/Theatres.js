
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getTheatres } from "../api";

const theatreImages = [
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=700",
  "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=700",
  "https://images.unsplash.com/photo-1485095329183-d0797cdc5676?w=700",
  "https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?w=700",
];

const Theatres = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [theatres, setTheatres] = React.useState([]);

  // GET SEARCH QUERY FROM URL
  const searchQuery =
    new URLSearchParams(location.search).get("search") || "";

  // LOAD THEATRES
  React.useEffect(() => {
    getTheatres()
      .then((data) =>
        setTheatres(
          Array.isArray(data.theatres)
            ? data.theatres
            : []
        )
      )
      .catch((error) =>
        console.error("Unable to load theatres:", error)
      );
  }, []);

  // SEARCH FILTER
  const filteredTheatres = theatres.filter((theatre) => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return true;

    // Handle location whether it is a string or object
    const locationText =
      typeof theatre.location === "string"
        ? theatre.location
        : theatre.location
          ? Object.values(theatre.location).join(" ")
          : "";

    const searchableValues = [
      theatre.name,
      locationText,
      theatre.city,
      theatre.screens,
    ];

    return searchableValues.some((value) =>
      value !== undefined &&
      value !== null &&
      value.toString().toLowerCase().includes(query)
    );
  });

  // CHOOSE THEATRE
  const chooseTheatre = (theatre) => {
    localStorage.setItem(
      "selectedTheatre",
      JSON.stringify(theatre)
    );

    const user = JSON.parse(
      localStorage.getItem("loggedInUser") || "null"
    );

    if (!user) {
      localStorage.setItem(
        "redirectAfterLogin",
        "/Theatres"
      );

      navigate("/Login");
      return;
    }

    navigate("/BookNow");
  };

  return (
    <>
      <style>{`

        * {
          box-sizing: border-box;
        }

        /* =====================================
           THEATRES PAGE
        ===================================== */

        .theatres-page {
          min-height: calc(100vh - 58px);
          padding: 24px 28px 40px;
          background: #f4f7fb;
          color: #111827;
        }

        .theatres-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        /* TITLE */

        .theatres-title {
          margin: 0 0 18px;
          text-align: left;
          font-size: 25px;
          font-weight: 800;
          color: #111827;
        }

        /* GRID */

        .theatres-grid {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        /* THEATRE CARD */

        .theatre-card {
          background: #ffffff;
          border: 1px solid #dfe5ec;
          border-radius: 6px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          display: flex;
          flex-direction: column;
        }

        .theatre-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 7px 18px rgba(15, 23, 42, 0.12);
        }

        /* THEATRE IMAGE */

        .theatre-image-wrapper {
          width: 100%;
          height: 125px;
          overflow: hidden;
          background: #e5e7eb;
        }

        .theatre-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.3s ease;
        }

        .theatre-card:hover img {
          transform: scale(1.03);
        }

        /* CONTENT */

        .theatre-content {
          padding: 9px 11px 11px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        /* THEATRE NAME */

        .theatre-content h2 {
          margin: 0 0 2px;
          height: 19px;
          color: #111827;
          font-size: 13px;
          font-weight: 700;
          line-height: 19px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* LOCATION */

        .theatre-location {
          height: 17px;
          margin: 0 0 3px;
          color: #94a3b8;
          font-size: 10px;
          line-height: 17px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* SCREENS */

        .theatre-screens {
          height: 17px;
          margin: 0 0 7px;
          color: #64748b;
          font-size: 10px;
          line-height: 17px;
        }

        /* BUTTON */

        .theatre-btn {
          width: 100%;
          height: 27px;
          padding: 5px 10px;
          border: none;
          border-radius: 4px;
          background: #087ff5;
          color: #ffffff;
          font-size: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .theatre-btn:hover {
          background: #006fe6;
        }

        /* EMPTY STATE */

        .theatres-empty {
          grid-column: 1 / -1;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 7px;
          padding: 45px 20px;
          text-align: center;
          color: #64748b;
        }

        .theatres-empty h3 {
          margin: 0 0 6px;
          color: #111827;
          font-size: 18px;
        }

        .theatres-empty p {
          margin: 0;
          font-size: 12px;
        }

        /* TABLET */

        @media (max-width: 850px) {
          .theatres-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        /* MOBILE */

        @media (max-width: 550px) {
          .theatres-page {
            padding: 18px 15px 30px;
          }

          .theatres-title {
            font-size: 22px;
            margin-bottom: 15px;
          }

          .theatres-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .theatre-image-wrapper {
            height: 160px;
          }
        }

      `}</style>

      <div className="theatres-page">

        <div className="theatres-container">

          {/* TITLE */}

          <h1 className="theatres-title">
            All Theatres
          </h1>

          {/* THEATRES */}

          <div className="theatres-grid">

            {filteredTheatres.length > 0 ? (

              filteredTheatres.map((theatre, index) => (

                <div
                  className="theatre-card"
                  key={theatre._id || theatre.id || index}
                >

                  {/* IMAGE */}

                  <div className="theatre-image-wrapper">

                    <img
                      src={
                        theatreImages[
                          index % theatreImages.length
                        ]
                      }
                      alt={theatre.name}
                    />

                  </div>

                  {/* CONTENT */}

                  <div className="theatre-content">

                    <h2>
                      {theatre.name}
                    </h2>

                    <p className="theatre-location">
                      {typeof theatre.location === "string"
                        ? theatre.location
                        : theatre.location
                          ? Object.values(theatre.location).join(", ")
                          : ""}
                    </p>

                    <p className="theatre-screens">
                      🎥 {theatre.screens} Screens
                    </p>

                    <button
                      className="theatre-btn"
                      onClick={() => chooseTheatre(theatre)}
                    >
                      View Shows
                    </button>

                  </div>

                </div>

              ))

            ) : (

              <div className="theatres-empty">

                <h3>
                  {searchQuery
                    ? "No Theatres Found"
                    : "No Theatres Available"}
                </h3>

                <p>
                  {searchQuery
                    ? `No theatres found for "${searchQuery}". Try another name or location.`
                    : "No theatres are currently available."}
                </p>

              </div>

            )}

          </div>

        </div>

      </div>
    </>
  );
};

export default Theatres;
