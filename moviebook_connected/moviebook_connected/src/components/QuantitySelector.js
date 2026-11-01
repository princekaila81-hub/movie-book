import React from "react";

const QuantitySelector = ({ title, price, value, onChange }) => {
  return (
    <div className="quantity-row">
      <style>{`

        .quantity-row {
          display: flex;
          justify-content: space-between;
          align-items: center;

          padding: 16px;
          margin-bottom: 12px;

          border: 1px solid #ddd;
          border-radius: 10px;

          background: white;
        }

        .quantity-info h3 {
          margin: 0 0 5px;
        }

        .quantity-info p {
          margin: 0;
          color: #666;
        }

        .quantity-control {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .quantity-control button {
          width: 38px;
          height: 38px;

          border: none;
          border-radius: 6px;

          background: #111827;
          color: white;

          font-size: 22px;
          cursor: pointer;
        }

        .quantity-control span {
          min-width: 25px;
          text-align: center;
          font-size: 20px;
          font-weight: bold;
        }

      `}</style>

      <div className="quantity-info">
        <h3>{title}</h3>

        <p>₹{price} per ticket</p>
      </div>

      <div className="quantity-control">
        <button onClick={() => onChange(Math.max(0, value - 1))}>−</button>

        <span>{value}</span>

        <button onClick={() => onChange(value + 1)}>+</button>
      </div>
    </div>
  );
};

export default QuantitySelector;
