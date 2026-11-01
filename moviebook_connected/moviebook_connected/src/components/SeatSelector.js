
import React, { useState } from "react";

const SeatSelector = () => {
  const rows = ["A", "B", "C", "D", "E", "F", "G"];

  const seatsPerRow = 8;

  // Example already-booked seats
  // You can later load these from your backend.
  const bookedSeats = [
    "A3",
    "A4",
    "B6",
    "C2",
    "D5",
    "F7",
  ];

  const [selectedSeats, setSelectedSeats] = useState([]);

  const toggleSeat = (seat) => {
    // Do not allow booked seats
    if (bookedSeats.includes(seat)) {
      return;
    }

    if (selectedSeats.includes(seat)) {
      setSelectedSeats(
        selectedSeats.filter(
          (item) => item !== seat
        )
      );
    } else {
      setSelectedSeats([
        ...selectedSeats,
        seat,
      ]);
    }
  };

  return (
    <>
      <style>{`

        /* ==============================
           SEAT SELECTOR
        ============================== */

        .seat-section {
          width: 100%;
          background: #ffffff;

          border: 1px solid #e1e7ef;

          border-radius: 7px;

          padding: 16px;

          box-shadow:
            0 2px 8px
            rgba(15, 23, 42, 0.05);
        }

        .seat-title {
          margin: 0 0 12px;

          font-size: 15px;

          font-weight: 800;

          color: #111827;
        }

        /* ==============================
           LEGEND
        ============================== */

        .seat-legend {
          display: flex;

          justify-content: flex-end;

          align-items: center;

          gap: 13px;

          margin-bottom: 10px;

          font-size: 9px;

          color: #64748b;
        }

        .legend-item {
          display: flex;

          align-items: center;

          gap: 4px;
        }

        .legend-seat {
          width: 10px;

          height: 10px;

          border-radius: 2px;

          border: 1px solid #d5dce5;
        }

        .legend-available {
          background: #eef2f7;
        }

        .legend-selected {
          background: #087ff5;

          border-color: #087ff5;
        }

        .legend-booked {
          background: #cbd5e1;

          border-color: #cbd5e1;
        }

        /* ==============================
           SCREEN
        ============================== */

        .screen-wrapper {
          width: 100%;

          display: flex;

          justify-content: center;

          margin: 3px 0 16px;
        }

        .cinema-screen {
          width: 75%;

          height: 17px;

          position: relative;

          background:
            linear-gradient(
              to bottom,
              #d7dee8,
              #edf1f6
            );

          border-radius:
            0 0 50% 50%;

          transform:
            perspective(70px)
            rotateX(-5deg);

          box-shadow:
            0 4px 7px
            rgba(148, 163, 184, 0.25);
        }

        .screen-text {
          position: absolute;

          width: 100%;

          top: 18px;

          text-align: center;

          color: #94a3b8;

          font-size: 8px;
        }

        /* ==============================
           SEAT AREA
        ============================== */

        .seat-layout {
          display: flex;

          flex-direction: column;

          gap: 5px;

          align-items: center;

          margin-top: 15px;
        }

        .seat-row {
          display: flex;

          align-items: center;

          gap: 5px;
        }

        .row-label {
          width: 12px;

          margin-right: 2px;

          color: #94a3b8;

          font-size: 8px;

          font-weight: 600;

          text-align: center;
        }

        /* ==============================
           SEAT
        ============================== */

        .seat {
          width: 16px;

          height: 13px;

          border-radius: 3px;

          border: 1px solid #d6dde6;

          background: #edf1f5;

          cursor: pointer;

          transition:
            background 0.15s ease,
            transform 0.15s ease;
        }

        .seat:hover {
          transform: scale(1.08);
        }

        /* SELECTED */

        .seat.selected {
          background: #087ff5;

          border-color: #087ff5;

          box-shadow:
            0 2px 5px
            rgba(8, 127, 245, 0.25);
        }

        /* BOOKED */

        .seat.booked {
          background: #cbd5e1;

          border-color: #cbd5e1;

          cursor: not-allowed;

          opacity: 0.9;
        }

        .seat.booked:hover {
          transform: none;
        }

        /* ==============================
           SELECTED SUMMARY
        ============================== */

        .selected-seat-info {
          margin-top: 15px;

          padding-top: 10px;

          border-top:
            1px solid #eef2f7;

          color: #64748b;

          font-size: 9px;

          text-align: center;
        }

        .selected-seat-info strong {
          color: #334155;
        }

        .no-seat {
          color: #94a3b8;
        }

        /* ==============================
           MOBILE
        ============================== */

        @media (max-width: 500px) {

          .seat {
            width: 15px;

            height: 12px;
          }

          .seat-row {
            gap: 4px;
          }

          .seat-legend {
            justify-content: center;
          }

        }

      `}</style>

      <div className="seat-section">

        <h2 className="seat-title">
          Select Seats
        </h2>

        {/* LEGEND */}

        <div className="seat-legend">

          <div className="legend-item">
            <span className="legend-seat legend-available"></span>
            Available
          </div>

          <div className="legend-item">
            <span className="legend-seat legend-selected"></span>
            Selected
          </div>

          <div className="legend-item">
            <span className="legend-seat legend-booked"></span>
            Booked
          </div>

        </div>

        {/* SCREEN */}

        <div className="screen-wrapper">

          <div className="cinema-screen">

            <span className="screen-text">
              Theater
            </span>

          </div>

        </div>

        {/* SEATS */}

        <div className="seat-layout">

          {rows.map((row) => (

            <div
              className="seat-row"
              key={row}
            >

              <span className="row-label">
                {row}
              </span>

              {Array.from(
                { length: seatsPerRow },
                (_, index) => {

                  const seatNumber =
                    index + 1;

                  const seatId =
                    `${row}${seatNumber}`;

                  const isBooked =
                    bookedSeats.includes(
                      seatId
                    );

                  const isSelected =
                    selectedSeats.includes(
                      seatId
                    );

                  return (
                    <button
                      key={seatId}
                      type="button"
                      className={`
                        seat
                        ${
                          isBooked
                            ? "booked"
                            : ""
                        }
                        ${
                          isSelected
                            ? "selected"
                            : ""
                        }
                      `}
                      onClick={() =>
                        toggleSeat(seatId)
                      }
                      disabled={isBooked}
                      title={seatId}
                    />
                  );
                }
              )}

            </div>

          ))}

        </div>

        {/* SELECTED SEATS */}

        <div className="selected-seat-info">

          {selectedSeats.length > 0 ? (

            <>
              Selected Seats:{" "}
              <strong>
                {selectedSeats.join(", ")}
              </strong>
            </>

          ) : (

            <span className="no-seat">
              No seats selected
            </span>

          )}

        </div>

      </div>
    </>
  );
};

export default SeatSelector;
