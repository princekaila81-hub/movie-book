import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBookings } from "../api";

const BookNow = () => {
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [theatre, setTheatre] = useState(null);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [selectedTime, setSelectedTime] = useState("01:30 PM");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [availabilityError, setAvailabilityError] = useState("");

  const regularPrice = 200;
  const premiumPrice = 300;
  const vipPrice = 500;

  const showTimes = [
    "11:00 AM",
    "01:30 PM",
    "04:00 PM",
    "07:00 PM",
    "10:00 PM",
  ];

  // =========================
  // LOAD MOVIE & THEATRE
  // =========================

  useEffect(() => {
    try {
      const savedMovie = localStorage.getItem("selectedMovie");
      const savedTheatre = localStorage.getItem("selectedTheatre");

      if (!savedMovie) {
        navigate("/Movies");
        return;
      }

      setMovie(JSON.parse(savedMovie));

      if (savedTheatre) {
        setTheatre(JSON.parse(savedTheatre));
      }
    } catch (error) {
      console.error("BookNow loading error:", error);
      navigate("/Movies");
    }
  }, [navigate]);

  // =========================
  // SEAT ROWS
  // =========================

  const rows = [
    {
      name: "A",
      type: "Regular",
      price: regularPrice,
    },
    {
      name: "B",
      type: "Regular",
      price: regularPrice,
    },
    {
      name: "C",
      type: "Regular",
      price: regularPrice,
    },
    {
      name: "D",
      type: "Regular",
      price: regularPrice,
    },
    {
      name: "E",
      type: "Premium",
      price: premiumPrice,
    },
    {
      name: "F",
      type: "Premium",
      price: premiumPrice,
    },
    {
      name: "G",
      type: "VIP",
      price: vipPrice,
    },
  ];

  const seatNumbers = [1, 2, 3, 4, 5, 6, 7, 8];

  // =========================
  // LOAD BOOKED SEATS
  // =========================

  useEffect(() => {
    if (!movie) return;

    if (!theatre) {
      setAvailabilityLoading(false);
      setAvailabilityError(
        "Theatre information is missing. Please go back and choose a theatre."
      );
      return;
    }

    let isCurrent = true;
    setAvailabilityLoading(true);
    setAvailabilityError("");

    const loadBookedSeats = async () => {
      try {
        const response = await getBookings();
        const serverBookings = Array.isArray(response.bookings)
          ? response.bookings
          : [];
        let savedBookings = [];

        try {
          const parsedBookings = JSON.parse(
            localStorage.getItem("bookings") || "[]"
          );
          savedBookings = Array.isArray(parsedBookings)
            ? parsedBookings
            : [];
        } catch {
          savedBookings = [];
        }

        const currentMovieId = String(
          movie?._id || movie?.id || ""
        );
        const currentTheatreId = String(
          theatre?._id || theatre?.id || ""
        );
        const alreadyBooked = [...serverBookings, ...savedBookings]
          .filter((booking) => {
            const bookingMovieId = String(
              booking.movie?._id || booking.movie?.id || booking.movie || ""
            );
            const bookingTheatreId = String(
              booking.theatre?._id || booking.theatre?.id || booking.theatre || ""
            );

            return (
              bookingMovieId === currentMovieId &&
              bookingTheatreId === currentTheatreId &&
              booking.date === selectedDate &&
              booking.time === selectedTime &&
              booking.bookingStatus?.toLowerCase() !== "cancelled"
            );
          })
          .flatMap((booking) =>
            Array.isArray(booking.seats) ? booking.seats : []
          );

        if (isCurrent) {
          const bookedSeatList = [...new Set(alreadyBooked)];
          setBookedSeats(bookedSeatList);
          setSelectedSeats((previous) =>
            previous.filter((seat) => !bookedSeatList.includes(seat))
          );
        }
      } catch (error) {
        if (isCurrent) {
          setBookedSeats([]);
          setAvailabilityError(
            error.message || "Unable to check seat availability."
          );
        }
      } finally {
        if (isCurrent) {
          setAvailabilityLoading(false);
        }
      }
    };

    loadBookedSeats();

    return () => {
      isCurrent = false;
    };
  }, [
    movie,
    theatre,
    selectedDate,
    selectedTime,
  ]);

  // =========================
  // GET SEAT TYPE
  // =========================

  const getSeatType = (row) => {
    if (["A", "B", "C", "D"].includes(row)) {
      return "Regular";
    }

    if (["E", "F"].includes(row)) {
      return "Premium";
    }

    return "VIP";
  };

  // =========================
  // SELECT / DESELECT SEAT
  // =========================

  const toggleSeat = (seat) => {
    if (bookedSeats.includes(seat)) {
      return;
    }

    setSelectedSeats((previous) => {
      if (previous.includes(seat)) {
        return previous.filter(
          (item) => item !== seat
        );
      }

      return [...previous, seat];
    });
  };

  // =========================
  // SELECTED SEATS
  // =========================

  const regularSeats = selectedSeats.filter(
    (seat) =>
      getSeatType(seat.charAt(0)) === "Regular"
  );

  const premiumSeats = selectedSeats.filter(
    (seat) =>
      getSeatType(seat.charAt(0)) === "Premium"
  );

  const vipSeats = selectedSeats.filter(
    (seat) =>
      getSeatType(seat.charAt(0)) === "VIP"
  );

  // =========================
  // PRICE CALCULATION
  // =========================

  const regularTotal =
    regularSeats.length * regularPrice;

  const premiumTotal =
    premiumSeats.length * premiumPrice;

  const vipTotal =
    vipSeats.length * vipPrice;

  const totalAmount =
    regularTotal +
    premiumTotal +
    vipTotal;

  // =========================
  // PROCEED TO PAYMENT
  // =========================

  const proceedToPayment = () => {
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

    if (selectedSeats.length === 0) {
      alert("Please select at least one seat.");
      return;
    }

    const currentBooking = {
      movie,
      theatre,
      date: selectedDate,
      time: selectedTime,

      seats: selectedSeats,

      regularSeats,
      premiumSeats,
      vipSeats,

      regularTotal,
      premiumTotal,
      vipTotal,

      totalAmount,

      user,
    };

    localStorage.setItem(
      "currentBooking",
      JSON.stringify(currentBooking)
    );

    navigate("/Payment");
  };

  // =========================
  // LOADING
  // =========================

  if (!movie) {
    return (
      <div className="loading">
        Loading...
      </div>
    );
  }

  return (
    <>
      <style>{`

        * {
          box-sizing: border-box;
        }

        .book-page {
          min-height: 100vh;
          background: #f4f7fb;
          padding: 25px;
          color: #111827;
        }

        .book-container {
          max-width: 1250px;
          margin: auto;
        }

        /* =========================
           MAIN BOOKING AREA
        ========================= */

        .booking-main {
          background: white;
          border-radius: 14px;
          padding: 25px;

          box-shadow:
            0 4px 18px rgba(0, 0, 0, 0.08);

          display: block;
        }

        /* =========================
           MOVIE INFORMATION
        ========================= */

        .movie-info {
          display: flex;
          gap: 18px;
          margin-bottom: 25px;
        }

        .movie-poster {
          width: 110px;
          height: 150px;

          object-fit: cover;

          border-radius: 9px;

          flex-shrink: 0;
        }

        .movie-info h1 {
          margin: 5px 0 10px;

          font-size: 26px;
        }

        .movie-meta {
          color: #667085;

          font-size: 14px;

          margin: 7px 0;
        }

        .rating {
          color: #f59e0b;

          font-weight: bold;
        }

        /* =========================
           SECTION TITLE
        ========================= */

        .section-title {
          font-size: 17px;

          font-weight: 700;

          margin: 20px 0 10px;
        }

        /* =========================
           DATE
        ========================= */

        .date-list {
          display: flex;

          gap: 9px;

          flex-wrap: wrap;
        }

        .date-btn {
          min-width: 70px;

          padding: 9px 10px;

          border: 1px solid #d8dee8;

          background: white;

          border-radius: 8px;

          cursor: pointer;

          font-size: 12px;
        }

        .date-btn strong {
          display: block;

          font-size: 13px;
        }

        .date-btn span {
          color: #777;
        }

        .date-btn.active {
          background: #087ff5;

          color: white;

          border-color: #087ff5;
        }

        .date-btn.active span {
          color: white;
        }

        /* =========================
           SHOW TIME
        ========================= */

        .time-list {
          display: flex;

          gap: 9px;

          flex-wrap: wrap;
        }

        .time-btn {
          padding: 10px 14px;

          border: 1px solid #d8dee8;

          background: white;

          border-radius: 8px;

          cursor: pointer;

          font-size: 13px;
        }

        .time-btn.active {
          background: #087ff5;

          color: white;

          border-color: #087ff5;
        }

        /* =========================
           SEAT SECTION
        ========================= */

        .seat-section {
          background: #fafcff;

          border: 1px solid #e1e7ef;

          border-radius: 12px;

          padding: 20px;

          margin-top: 22px;
        }

        .seat-header {
          display: flex;

          justify-content: space-between;

          align-items: center;

          margin-bottom: 18px;
        }

        .seat-header h2 {
          margin: 0;

          font-size: 20px;
        }

        .legend {
          display: flex;

          gap: 14px;

          font-size: 11px;

          color: #555;

          flex-wrap: wrap;
        }

        .legend-item {
          display: flex;

          align-items: center;

          gap: 5px;
        }

        .legend-box {
          width: 14px;

          height: 14px;

          border-radius: 3px;

          border: 1px solid #d3dbe5;
        }

        .legend-available {
          background: #e9eef5;
        }

        .legend-selected {
          background: #087ff5;
        }

        .legend-booked {
          background: #9aa5b5;
        }

        .availability-message {
          margin: 0 0 14px;
          color: #64748b;
          font-size: 13px;
        }

        .availability-error {
          color: #b42318;
        }

        /* =========================
           SCREEN
        ========================= */

        .screen {
          width: 70%;

          height: 32px;

          margin: 0 auto 28px;

          background: #e7ecf3;

          border-radius:
            50% 50% 8px 8px;

          text-align: center;

          padding-top: 8px;

          font-size: 11px;

          color: #7b8797;

          transform:
            perspective(80px)
            rotateX(-8deg);
        }

        /* =========================
           SEAT CATEGORY
        ========================= */

        .category-name {
          font-size: 12px;

          font-weight: bold;

          color: #555;

          margin:
            14px 0 7px;
        }

        .seat-row {
          display: flex;

          align-items: center;

          justify-content: center;

          gap: 7px;

          margin: 7px 0;
        }

        .row-label {
          width: 18px;

          font-size: 11px;

          font-weight: bold;

          color: #777;
        }

        .seat {
          width: 27px;

          height: 23px;

          border: none;

          border-radius:
            5px 5px 3px 3px;

          background: #e3e9f1;

          color: #6b7280;

          font-size: 9px;

          cursor: pointer;

          transition: 0.15s;
        }

        .seat:hover:not(.booked):not(:disabled) {
          transform:
            translateY(-2px);
        }

        .seat.selected {
          background: #087ff5;

          color: white;
        }

        .seat.booked {
          background: #aeb8c5;

          color: white;

          cursor: not-allowed;
        }

        .aisle {
          width: 15px;
        }

        /* =========================
           BOTTOM BOOKING SUMMARY
        ========================= */

        .booking-summary {
          margin-top: 20px;

          background: white;

          border-radius: 14px;

          padding: 20px 24px;

          box-shadow:
            0 4px 18px
            rgba(0, 0, 0, 0.08);

          display: grid;

          grid-template-columns:
            1.2fr
            1.2fr
            0.9fr
            0.9fr
            1.4fr
            0.9fr
            190px;

          align-items: center;

          gap: 18px;
        }

        .summary-heading {
          font-size: 19px;

          font-weight: 800;
        }

        .summary-movie {
          display: flex;

          align-items: center;

          gap: 10px;

          min-width: 0;
        }

        .summary-poster {
          width: 55px;

          height: 72px;

          object-fit: cover;

          border-radius: 6px;

          flex-shrink: 0;
        }

        .summary-movie-title {
          font-size: 14px;

          font-weight: 700;
        }

        .summary-small {
          font-size: 11px;

          color: #687385;

          margin-top: 4px;
        }

        .summary-info {
          border-left:
            1px solid #e1e5eb;

          padding-left: 15px;

          min-width: 0;
        }

        .summary-info-label {
          color: #687385;

          font-size: 11px;

          margin-bottom: 5px;
        }

        .summary-info-value {
          font-size: 13px;

          font-weight: 700;

          word-break: break-word;
        }

        .summary-seats {
          border-left:
            1px solid #e1e5eb;

          padding-left: 15px;

          min-width: 0;
        }

        .summary-seat-list {
          display: flex;

          flex-wrap: wrap;

          gap: 4px;

          margin-top: 6px;
        }

        .small-seat {
          background: #087ff5;

          color: white;

          border-radius: 4px;

          padding: 3px 6px;

          font-size: 9px;
        }

        .summary-price {
          border-left:
            1px solid #e1e5eb;

          padding-left: 15px;
        }

        .summary-price-value {
          font-size: 21px;

          color: #087ff5;

          font-weight: 800;

          margin-top: 3px;
        }

        .summary-payment button {
          width: 100%;

          padding: 13px 14px;

          border: none;

          border-radius: 8px;

          background: #087ff5;

          color: white;

          font-weight: bold;

          font-size: 13px;

          cursor: pointer;

          transition: 0.2s;
        }

        .summary-payment button:hover:not(:disabled) {
          background: #006bd6;

          transform:
            translateY(-1px);
        }

        .summary-payment button:disabled {
          background: #aab4c2;

          cursor: not-allowed;
        }

        /* =========================
           LOADING
        ========================= */

        .loading {
          min-height: 100vh;

          display: flex;

          align-items: center;

          justify-content: center;

          font-size: 20px;

          font-weight: bold;
        }

        /* =========================
           RESPONSIVE
        ========================= */

        @media (max-width: 1100px) {

          .booking-summary {
            grid-template-columns:
              1fr 1fr 1fr;

            gap: 15px;
          }

          .summary-heading {
            grid-column:
              1 / -1;
          }

          .summary-payment {
            grid-column:
              1 / -1;
          }
        }

        @media (max-width: 650px) {

          .book-page {
            padding: 10px;
          }

          .booking-main {
            padding: 15px;
          }

          .movie-info {
            align-items: flex-start;
          }

          .movie-poster {
            width: 85px;

            height: 120px;
          }

          .movie-info h1 {
            font-size: 20px;
          }

          .seat-section {
            padding: 12px;
          }

          .seat-header {
            align-items: flex-start;

            flex-direction: column;

            gap: 10px;
          }

          .seat {
            width: 22px;

            height: 20px;
          }

          .seat-row {
            gap: 4px;
          }

          .aisle {
            width: 7px;
          }

          .screen {
            width: 85%;
          }

          .booking-summary {
            grid-template-columns: 1fr;

            padding: 18px;
          }

          .summary-info,
          .summary-seats,
          .summary-price {
            border-left: none;

            border-top:
              1px solid #e1e5eb;

            padding:
              12px 0 0;
          }

          .summary-payment {
            width: 100%;
          }
        }

      `}</style>

      <div className="book-page">

        <div className="book-container">

          {/* =========================
              MAIN BOOKING AREA
          ========================= */}

          <div className="booking-main">

            {/* MOVIE */}

            <div className="movie-info">

              <img
                src={movie.image}
                alt={movie.title}
                className="movie-poster"
              />

              <div>

                <h1>
                  {movie.title}
                </h1>

                <div className="movie-meta">
                  <span className="rating">
                    ⭐ {movie.rating || "N/A"}
                  </span>
                </div>

                <div className="movie-meta">
                  {movie.genre || "Movie"}
                  {" • "}
                  {movie.duration || "3h 0m"}
                </div>

                {theatre && (
                  <div className="movie-meta">
                    🎬 {theatre.name}
                  </div>
                )}

              </div>

            </div>

            {/* DATE */}

            <div className="section-title">
              Select Date
            </div>

            <div className="date-list">

              {[0, 1, 2, 3, 4].map((day) => {

                const date = new Date();

                date.setDate(
                  date.getDate() + day
                );

                const value =
                  date
                    .toISOString()
                    .split("T")[0];

                const dayNumber =
                  date.getDate();

                const month =
                  date.toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                    }
                  );

                const weekday =
                  date.toLocaleDateString(
                    "en-US",
                    {
                      weekday: "short",
                    }
                  );

                return (
                  <button
                    key={value}
                    className={
                      selectedDate === value
                        ? "date-btn active"
                        : "date-btn"
                    }
                    onClick={() => {
                      if (selectedDate === value) return;
                      setSelectedSeats([]);
                      setBookedSeats([]);
                      setAvailabilityLoading(true);
                      setAvailabilityError("");
                      setSelectedDate(value);
                    }}
                  >
                    <strong>
                      {dayNumber} {month}
                    </strong>

                    <span>
                      {day === 0
                        ? "Today"
                        : weekday}
                    </span>
                  </button>
                );
              })}

            </div>

            {/* SHOW TIME */}

            <div className="section-title">
              Select Show Time
            </div>

            <div className="time-list">

              {showTimes.map((time) => (
                <button
                  key={time}
                  className={
                    selectedTime === time
                      ? "time-btn active"
                      : "time-btn"
                  }
                  onClick={() => {
                    if (selectedTime === time) return;
                    setSelectedSeats([]);
                    setBookedSeats([]);
                    setAvailabilityLoading(true);
                    setAvailabilityError("");
                    setSelectedTime(time);
                  }}
                >
                  {time}
                </button>
              ))}

            </div>

            {/* SEATS */}

            <div className="seat-section">

              <div className="seat-header">

                <h2>
                  Select Seats
                </h2>

                <div className="legend">

                  <div className="legend-item">
                    <span
                      className="
                        legend-box
                        legend-available
                      "
                    />
                    Available
                  </div>

                  <div className="legend-item">
                    <span
                      className="
                        legend-box
                        legend-selected
                      "
                    />
                    Selected
                  </div>

                  <div className="legend-item">
                    <span
                      className="
                        legend-box
                        legend-booked
                      "
                    />
                    Booked
                  </div>

                </div>

              </div>

              {availabilityLoading && (
                <p className="availability-message" role="status">
                  Checking seat availability...
                </p>
              )}

              {availabilityError && (
                <p className="availability-message availability-error" role="alert">
                  {availabilityError} Please try again before selecting seats.
                </p>
              )}

              {/* SCREEN */}

              <div className="screen">
                SCREEN
              </div>

              {/* SEAT ROWS */}

              {rows.map((row, index) => {

                const previousType =
                  index > 0
                    ? rows[index - 1].type
                    : null;

                return (
                  <React.Fragment
                    key={row.name}
                  >

                    {row.type !==
                      previousType && (
                      <div className="category-name">
                        {row.type}
                        {" — ₹"}
                        {row.price}
                      </div>
                    )}

                    <div className="seat-row">

                      <span className="row-label">
                        {row.name}
                      </span>

                      {seatNumbers.map(
                        (number) => {

                          const seat =
                            `${row.name}${number}`;

                          const isSelected =
                            selectedSeats.includes(
                              seat
                            );

                          const isBooked =
                            bookedSeats.includes(
                              seat
                            );

                          return (
                            <React.Fragment
                              key={seat}
                            >

                              {number === 5 && (
                                <span className="aisle" />
                              )}

                              <button
                                className={`
                                  seat
                                  ${
                                    isSelected
                                      ? "selected"
                                      : ""
                                  }
                                  ${
                                    isBooked
                                      ? "booked"
                                      : ""
                                  }
                                `}
                                disabled={
                                  isBooked ||
                                  availabilityLoading ||
                                  Boolean(availabilityError)
                                }
                                onClick={() =>
                                  toggleSeat(
                                    seat
                                  )
                                }
                              >
                                {number}
                              </button>

                            </React.Fragment>
                          );
                        }
                      )}

                    </div>

                  </React.Fragment>
                );
              })}

            </div>

          </div>

          {/* =========================
              ONLY BOTTOM SUMMARY
          ========================= */}

          <div className="booking-summary">

            {/* HEADING */}

            <div className="summary-heading">
              Booking Summary
            </div>

            {/* MOVIE */}

            <div className="summary-movie">

              <img
                src={movie.image}
                alt={movie.title}
                className="summary-poster"
              />

              <div>

                <div className="summary-movie-title">
                  {movie.title}
                </div>

                <div className="summary-small">
                  ⭐ {movie.rating || "N/A"}
                </div>

                <div className="summary-small">
                  {movie.genre || "Movie"}
                </div>

              </div>

            </div>

            {/* THEATRE */}

            <div className="summary-info">

              <div className="summary-info-label">
                Theatre
              </div>

              <div className="summary-info-value">
                {theatre?.name ||
                  "PVR Cinemas"}
              </div>

            </div>

            {/* DATE */}

            <div className="summary-info">

              <div className="summary-info-label">
                Date
              </div>

              <div className="summary-info-value">
                {selectedDate}
              </div>

            </div>

            {/* TIME */}

            <div className="summary-info">

              <div className="summary-info-label">
                Show Time
              </div>

              <div className="summary-info-value">
                {selectedTime}
              </div>

            </div>

            {/* SEATS */}

            <div className="summary-seats">

              <div className="summary-info-label">
                Selected Seats
              </div>

              <div className="summary-seat-list">

                {selectedSeats.length === 0 ? (

                  <span className="summary-small">
                    No seats selected
                  </span>

                ) : (

                  selectedSeats.map(
                    (seat) => (
                      <span
                        key={seat}
                        className="small-seat"
                      >
                        {seat}
                      </span>
                    )
                  )

                )}

              </div>

            </div>

            {/* TOTAL */}

            <div className="summary-price">

              <div className="summary-info-label">
                Total Amount
              </div>

              <div className="summary-price-value">
                ₹{totalAmount}
              </div>

            </div>

            {/* PAYMENT */}

            <div className="summary-payment">

              <button
                disabled={
                  selectedSeats.length === 0 ||
                  availabilityLoading ||
                  Boolean(availabilityError)
                }
                onClick={
                  proceedToPayment
                }
              >
                Proceed to Payment →
              </button>

            </div>

          </div>

        </div>

      </div>
    </>
  );
};

export default BookNow;