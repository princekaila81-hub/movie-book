import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const BookingSuccess = () => {
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    try {
      const data = localStorage.getItem("paymentSuccess");

      if (!data) {
        navigate("/");
        return;
      }

      const parsed = JSON.parse(data);

      // ------------------------------------------------
      // GET SELECTED SEATS
      // ------------------------------------------------
      let seats = [];

      if (Array.isArray(parsed.seats)) {
        seats = parsed.seats;
      } else if (Array.isArray(parsed.selectedSeats)) {
        seats = parsed.selectedSeats;
      } else if (typeof parsed.seats === "string") {
        seats = parsed.seats
          .split(",")
          .map((seat) => seat.trim())
          .filter(Boolean);
      } else if (typeof parsed.selectedSeats === "string") {
        seats = parsed.selectedSeats
          .split(",")
          .map((seat) => seat.trim())
          .filter(Boolean);
      }

      // ------------------------------------------------
      // CALCULATE TICKET COUNTS FROM SEAT ROW
      //
      // A,B = Regular
      // C,D,E = Premium
      // F,G = VIP
      // ------------------------------------------------
      let regular = 0;
      let premium = 0;
      let vip = 0;


      seats.forEach((seat) => {
        const seatName = String(seat).trim().toUpperCase();

        const row = seatName.charAt(0);

        if (["A", "B"].includes(row)) {
          regular++;
        } else if (["C", "D", "E"].includes(row)) {
          premium++;
        } else if (["F", "G"].includes(row)) {
          vip++;
        }
      });

      // If backend already contains valid counts,
      // use them only when calculated counts are zero.
      if (seats.length === 0) {
        regular = Number(parsed.regular) || 0;
        premium = Number(parsed.premium) || 0;
        vip = Number(parsed.vip) || 0;
      }

      const totalSeats =
        seats.length || regular + premium + vip;

      const totalAmount =
        regular * 200 +
        premium * 300 +
        vip * 500;

      const updatedBooking = {
        ...parsed,

        seats,
        regular,
        premium,
        vip,
        totalSeats,

        // Keep original amount if it is greater than 0,
        // otherwise calculate from seats.
        totalAmount:
          totalAmount > 0
            ? totalAmount
            : Number(parsed.totalAmount) || 0,
      };

      setBooking(updatedBooking);

      // Save corrected booking so PDF/download
      // and future pages have correct counts.
      localStorage.setItem(
        "paymentSuccess",
        JSON.stringify(updatedBooking)
      );
    } catch (error) {
      console.error("Booking data error:", error);
      navigate("/");
    }
  }, [navigate]);

        console.log("booking",booking)


  // ------------------------------------------------
  // DOWNLOAD TICKET AS PDF
  // ------------------------------------------------
  const downloadTicket = async () => {
    const ticketElement =
      document.getElementById("download-ticket");

    if (!ticketElement) {
      alert("Ticket not found.");
      return;
    }

    try {
      const canvas = await html2canvas(ticketElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = 190;
      const pdfHeight =
        (canvas.height * pdfWidth) / canvas.width;

      const x = 10;
      const y = 10;

      pdf.addImage(
        imgData,
        "PNG",
        x,
        y,
        pdfWidth,
        pdfHeight
      );

      pdf.save(
        `MovieBook-Ticket-${booking.bookingId || "Ticket"}.pdf`
      );
    } catch (error) {
      console.error("PDF download error:", error);
      alert("Unable to download ticket.");
    }
  };

  if (!booking) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px",
        }}
      >
        <h2>Loading ticket...</h2>
      </div>
    );
  }

  const movie =
    typeof booking.movie === "object"
      ? booking.movie
      : null;

  const movieTitle =
    movie?.title ||
    booking.movie ||
    "Movie";

  const movieImage =
    movie?.image ||
    "";

  const theatre =
    typeof booking.theatre === "object"
      ? booking.theatre?.name
      : booking.theatre || "Theatre";

  const seats = Array.isArray(booking.seats)
    ? booking.seats
    : [];

  return (
    <>
      <style>{`

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #eef5ff;
          font-family: Arial, sans-serif;
        }

        .success-page {
          min-height: 100vh;
          padding: 35px 20px 60px;
          background:
            linear-gradient(
              135deg,
              #dbeafe,
              #f8fafc
            );
        }

        .success-icon {
          width: 72px;
          height: 72px;
          margin: 0 auto 12px;

          border-radius: 50%;

          background: #22c55e;
          color: white;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 42px;
          font-weight: bold;

          box-shadow:
            0 8px 20px rgba(34,197,94,.25);
        }

        .success-title {
          text-align: center;
          margin: 0;

          font-size: 32px;
          color: #111827;
        }

        .success-description {
          text-align: center;
          color: #64748b;
          margin-bottom: 25px;
        }

        .ticket {
          width: 100%;
          max-width: 850px;

          margin: auto;

          background: white;

          border-radius: 18px;

          padding: 30px;

          box-shadow:
            0 10px 35px
            rgba(15,23,42,.12);
        }

        .movie-section {
          display: flex;
          align-items: center;

          gap: 25px;

          padding-bottom: 25px;

          border-bottom:
            1px solid #e5e7eb;
        }

        .poster {
          width: 145px;
          height: 190px;

          object-fit: cover;

          border-radius: 10px;

          box-shadow:
            0 5px 15px
            rgba(0,0,0,.15);
        }

        .movie-info {
          flex: 1;
        }

        .movie-info h2 {
          margin: 0 0 15px;

          font-size: 30px;

          color: #0f172a;
        }

        .movie-info p {
          margin: 9px 0;

          font-size: 17px;

          color: #475569;
        }

        .confirmed {
          display: inline-block;

          margin-top: 10px;

          padding: 9px 16px;

          border-radius: 8px;

          background: #dcfce7;

          color: #15803d;

          font-weight: bold;
        }

        .seat-box {
          margin-top: 25px;

          padding: 18px;

          background: #f8fafc;

          border-radius: 12px;

          border: 1px solid #e2e8f0;
        }

        .seat-box h3 {
          margin: 0 0 12px;

          color: #334155;
        }

        .seat-list {
          display: flex;

          flex-wrap: wrap;

          gap: 10px;
        }

        .seat {
          padding: 9px 15px;

          background: #dbeafe;

          color: #1d4ed8;

          border-radius: 8px;

          font-weight: bold;
        }

        .details {
          margin-top: 25px;
        }

        .detail-row {
          display: flex;

          justify-content:
            space-between;

          align-items: center;

          padding: 16px 5px;

          border-bottom:
            1px solid #e5e7eb;

          font-size: 18px;
        }

        .detail-row span:first-child {
          color: #64748b;
        }

        .detail-row span:last-child {
          color: #111827;
          font-weight: bold;
        }

        .total {
          display: flex;

          justify-content:
            space-between;

          padding: 22px 5px;

          font-size: 25px;

          font-weight: bold;

          color: #0f172a;
        }

        .total-amount {
          color: #0d7ff2;
          font-size: 29px;
        }

        .booking-id {
          margin-top: 15px;

          padding: 18px;

          background: #f8fafc;

          border-radius: 10px;

          display: flex;

          justify-content:
            space-between;

          font-size: 17px;
        }

        .payment {
          margin-top: 15px;

          padding: 15px;

          border-radius: 10px;

          background: #dcfce7;

          color: #166534;

          display: flex;

          justify-content:
            space-between;
        }

        .actions {
          max-width: 850px;

          margin: 20px auto 0;

          display: flex;

          gap: 15px;
        }

        .actions button {
          flex: 1;

          padding: 15px;

          border: none;

          border-radius: 9px;

          font-size: 16px;

          font-weight: bold;

          cursor: pointer;
        }

        .download-btn {
          background: #087ff5;
          color: white;
        }

        .home-btn {
          background: white;
          color: #111827;

          border:
            1px solid #cbd5e1 !important;
        }

        .download-btn:hover {
          background: #066ed3;
        }

        .home-btn:hover {
          background: #f1f5f9;
        }

        @media(max-width:700px) {

          .movie-section {
            flex-direction: column;
            text-align: center;
          }

          .movie-info h2 {
            font-size: 24px;
          }

          .detail-row,
          .total,
          .booking-id,
          .payment {
            flex-direction: column;

            align-items: flex-start;

            gap: 6px;
          }

          .actions {
            flex-direction: column;
          }

        }

      `}</style>

      <div className="success-page">

        <div className="success-icon">
          ✓
        </div>

        <h1 className="success-title">
          Booking Confirmed!
        </h1>

        <p className="success-description">
          Your movie ticket has been booked successfully.
        </p>

        {/* ================================
             TICKET AREA
             ================================ */}

        <div
          className="ticket"
          id="download-ticket"
        >

          {/* MOVIE */}

          <div className="movie-section">

            {movieImage && (
              <img
                src={movieImage}
                alt={movieTitle}
                className="poster"
                crossOrigin="anonymous"
              />
            )}

            <div className="movie-info">

              <h2>
                {movieTitle}
              </h2>

              <p>
                🎬 {theatre}
              </p>

              <p>
                📅 {booking.date}
              </p>

              <p>
                🕐 {booking.time}
              </p>

              <div className="confirmed">
                ✓ Confirmed
              </div>

            </div>

          </div>

          {/* SEATS */}

          <div className="seat-box">

            <h3>
              🎟️ Selected Seats
            </h3>

            <div className="seat-list">

              {seats.length > 0 ? (
                seats.map((seat, index) => (
                  <span
                    className="seat"
                    key={`${seat}-${index}`}
                  >
                    {seat}
                  </span>
                ))
              ) : (
                <span>
                  No seats selected
                </span>
              )}

            </div>

          </div>

          {/* TICKET COUNTS */}

          <div className="details">

            <div className="detail-row">
              <span>
                Regular Tickets
              </span>

              <span>
                {booking.regular} × ₹200
              </span>
            </div>

            <div className="detail-row">
              <span>
                Premium Tickets
              </span>

              <span>
                {booking.premium} × ₹300
              </span>
            </div>

            <div className="detail-row">
              <span>
                VIP Tickets
              </span>

              <span>
                {booking.vip} × ₹500
              </span>
            </div>

            <div className="detail-row">
              <span>
                Total Tickets
              </span>

              <span>
                {booking.totalSeats}
              </span>
            </div>

          </div>

          {/* TOTAL */}

          <div className="total">

            <span>
              Total Paid
            </span>

            <span className="total-amount">
              ₹{booking.totalAmount}
            </span>

          </div>

          {/* BOOKING ID */}

          <div className="booking-id">

            <span>
              Booking ID
            </span>

            <strong>
              {booking.bookingId || "N/A"}
            </strong>

          </div>

          {/* PAYMENT */}

          <div className="payment">

            <span>
              Payment Status
            </span>

            <strong>
              ✓ {booking.paymentStatus || "Paid"}
            </strong>

          </div>

          <p>
            Payment Method:{" "}
            <strong>
              {booking.paymentMethod || "Online"}
            </strong>
          </p>

          <p>
            Paid On:{" "}
            <strong>
              {booking.date || "N/A"}
            </strong>
          </p>

        </div>

        {/* ================================
             BUTTONS
             ================================ */}

        <div className="actions">

          <button
            className="download-btn"
            onClick={downloadTicket}
          >
            ⬇️ Download Ticket
          </button>

          <button
            className="home-btn"
            onClick={() => navigate("/")}
          >
            🏠 Go to Home
          </button>

        </div>

      </div>
    </>
  );
};

export default BookingSuccess;