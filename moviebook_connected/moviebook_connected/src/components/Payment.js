
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBooking } from "../api";

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000/api";

const Payment = () => {

  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);

  const [processing, setProcessing] =
    useState(false);

  const [razorpayLoaded, setRazorpayLoaded] =
    useState(false);

  const [popup, setPopup] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });


  // =====================================================
  // LOAD BOOKING
  // =====================================================

  useEffect(() => {

    try {

      const bookingData =
        localStorage.getItem("currentBooking");

      if (!bookingData) {
        navigate("/BookNow");
        return;
      }

      const parsedBooking =
        JSON.parse(bookingData);


      // MOVIE FALLBACK
      if (!parsedBooking.movie) {

        const selectedMovie =
          localStorage.getItem("selectedMovie");

        if (selectedMovie) {

          try {

            parsedBooking.movie =
              JSON.parse(selectedMovie);

          } catch (error) {

            console.error(
              "Movie parse error:",
              error
            );

          }

        }

      }


      // MOVIE ID FALLBACK
      if (
        !parsedBooking.movieId &&
        parsedBooking.movie
      ) {

        parsedBooking.movieId =
          parsedBooking.movie._id ||
          parsedBooking.movie.id ||
          null;

      }


      // THEATRE FALLBACK
      if (!parsedBooking.theatre) {

        const selectedTheatre =
          localStorage.getItem("selectedTheatre");

        if (selectedTheatre) {

          try {

            const parsedTheatre =
              JSON.parse(selectedTheatre);


            if (
              typeof parsedTheatre === "object" &&
              parsedTheatre !== null
            ) {

              parsedBooking.theatre =
                parsedTheatre.name || "";

              parsedBooking.theatreId =
                parsedTheatre._id ||
                parsedTheatre.id ||
                null;

            } else {

              parsedBooking.theatre =
                parsedTheatre;

            }

          } catch (error) {

            console.error(
              "Theatre parse error:",
              error
            );

          }

        }

      }


      // THEATRE ID FALLBACK
      if (!parsedBooking.theatreId) {

        const selectedTheatre =
          localStorage.getItem("selectedTheatre");

        if (selectedTheatre) {

          try {

            const parsedTheatre =
              JSON.parse(selectedTheatre);

            if (
              typeof parsedTheatre === "object" &&
              parsedTheatre !== null
            ) {

              parsedBooking.theatreId =
                parsedTheatre._id ||
                parsedTheatre.id ||
                null;

            }

          } catch (error) {

            console.error(
              "Theatre ID error:",
              error
            );

          }

        }

      }


      localStorage.setItem(
        "currentBooking",
        JSON.stringify(parsedBooking)
      );

      setBooking(parsedBooking);


    } catch (error) {

      console.error(
        "Payment booking loading error:",
        error
      );

      navigate("/BookNow");

    }

  }, [navigate]);


  // =====================================================
  // LOAD RAZORPAY CHECKOUT
  // =====================================================

  useEffect(() => {

    if (window.Razorpay) {

      setRazorpayLoaded(true);

      return;

    }


    const script =
      document.createElement("script");

    script.src =
      "https://checkout.razorpay.com/v1/checkout.js";

    script.async = true;


    script.onload = () => {

      console.log(
        "Razorpay Checkout Loaded"
      );

      setRazorpayLoaded(true);

    };


    script.onerror = () => {

      console.error(
        "Razorpay Checkout Failed"
      );

      setRazorpayLoaded(false);

      showPopup(
        "error",
        "Payment Gateway Error",
        "Razorpay could not be loaded."
      );

    };


    document.body.appendChild(script);


    return () => {
      // Keep Razorpay script loaded
    };

  }, []);


  // =====================================================
  // SELECTED SEATS
  // =====================================================

  const selectedSeats =
    Array.isArray(booking?.seats)
      ? booking.seats
      : [];


  // =====================================================
  // SEAT CATEGORY
  // =====================================================

  const regularSeats =
    selectedSeats.filter((seat) => {

      const row =
        String(seat)
          .trim()
          .charAt(0)
          .toUpperCase();

      return (
        row === "A" ||
        row === "B" ||
        row === "C"
      );

    });


  const premiumSeats =
    selectedSeats.filter((seat) => {

      const row =
        String(seat)
          .trim()
          .charAt(0)
          .toUpperCase();

      return (
        row === "D" ||
        row === "E" ||
        row === "F"
      );

    });


  const vipSeats =
    selectedSeats.filter((seat) => {

      const row =
        String(seat)
          .trim()
          .charAt(0)
          .toUpperCase();

      return row === "G";

    });


  // =====================================================
  // COUNTS
  // =====================================================

  const regularCount =
    regularSeats.length > 0
      ? regularSeats.length
      : Number(
          booking?.regularCount ||
          booking?.regular ||
          0
        );


  const premiumCount =
    premiumSeats.length > 0
      ? premiumSeats.length
      : Number(
          booking?.premiumCount ||
          booking?.premium ||
          0
        );


  const vipCount =
    vipSeats.length > 0
      ? vipSeats.length
      : Number(
          booking?.vipCount ||
          booking?.vip ||
          0
        );


  // =====================================================
  // PRICE
  // =====================================================

  const regularPrice = 200;

  const premiumPrice = 300;

  const vipPrice = 500;


  const regularTotal =
    regularCount * regularPrice;

  const premiumTotal =
    premiumCount * premiumPrice;

  const vipTotal =
    vipCount * vipPrice;


  const calculatedTotal =
    regularTotal +
    premiumTotal +
    vipTotal;


  const totalAmount =
    calculatedTotal > 0
      ? calculatedTotal
      : Number(
          booking?.totalAmount || 0
        );


  // =====================================================
  // POPUP
  // =====================================================

  const showPopup = (
    type,
    title,
    message
  ) => {

    setPopup({

      show: true,

      type,

      title,

      message,

    });

  };


  const closePopup = () => {

    setPopup({

      show: false,

      type: "success",

      title: "",

      message: "",

    });

  };


  // =====================================================
  // GET ID
  // =====================================================

  const getId = (value) => {

    if (!value) {
      return null;
    }


    if (
      typeof value === "string"
    ) {

      return value;

    }


    if (
      typeof value === "object"
    ) {

      if (value._id) {

        if (
          typeof value._id === "object" &&
          value._id.$oid
        ) {

          return value._id.$oid;

        }

        return value._id;

      }


      if (value.id) {

        return value.id;

      }


      if (value.$oid) {

        return value.$oid;

      }

    }


    return null;

  };


  // =====================================================
  // GET LOGGED USER
  // =====================================================

  const getLoggedInUser = () => {

    try {

      return JSON.parse(
        localStorage.getItem(
          "loggedInUser"
        ) || "null"
      );

    } catch {

      return null;

    }

  };


  // =====================================================
  // CREATE RAZORPAY ORDER
  // =====================================================

  const createRazorpayOrder =
    async () => {

      const token =
        localStorage.getItem("token");


      const response =
        await fetch(
          `${API_BASE_URL}/payment/create-order`,
          {

            method: "POST",

            headers: {

              "Content-Type":
                "application/json",

              ...(token
                ? {
                    Authorization:
                      `Bearer ${token}`,
                  }
                : {}),

            },

            body: JSON.stringify({

              amount:
                Number(totalAmount),

            }),

          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Unable to create payment order"
        );

      }


      return data;

    };


  // =====================================================
  // VERIFY RAZORPAY PAYMENT
  // =====================================================

  const verifyRazorpayPayment =
    async (paymentData) => {

      const token =
        localStorage.getItem("token");


      const response =
        await fetch(
          `${API_BASE_URL}/payment/verify`,
          {

            method: "POST",

            headers: {

              "Content-Type":
                "application/json",

              ...(token
                ? {
                    Authorization:
                      `Bearer ${token}`,
                  }
                : {}),

            },

            body:
              JSON.stringify(
                paymentData
              ),

          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Payment verification failed"
        );

      }


      return data;

    };


  // =====================================================
  // CREATE BOOKING AFTER PAYMENT
  // =====================================================

  const saveBooking =
    async (paymentResponse) => {

      const loggedInUser =
        getLoggedInUser();


      const userId =
        getId(loggedInUser?._id) ||
        getId(loggedInUser?.id);


      if (!userId) {

        throw new Error(
          "User login information not found."
        );

      }


      // MOVIE ID
      let movieId =
        getId(booking.movieId) ||
        getId(booking.movie);


      if (!movieId) {

        try {

          const selectedMovie =
            JSON.parse(
              localStorage.getItem(
                "selectedMovie"
              ) || "null"
            );


          movieId =
            getId(selectedMovie);

        } catch {

          movieId = null;

        }

      }


      // THEATRE ID
      let theatreId =
        getId(booking.theatreId) ||
        getId(booking.theatre);


      if (!theatreId) {

        try {

          const selectedTheatre =
            JSON.parse(
              localStorage.getItem(
                "selectedTheatre"
              ) || "null"
            );


          theatreId =
            getId(selectedTheatre);

        } catch {

          theatreId = null;

        }

      }


      if (
        !movieId ||
        !theatreId
      ) {

        throw new Error(
          "Movie or theatre ID is missing."
        );

      }


      // BOOKING PAYLOAD
      const bookingPayload = {

        user:
          userId,

        movie:
          movieId,

        theatre:
          theatreId,

        date:
          booking.date,

        time:
          booking.time,

        seats:
          selectedSeats,

        regularCount:
          Number(regularCount),

        premiumCount:
          Number(premiumCount),

        vipCount:
          Number(vipCount),

        totalSeats:
          selectedSeats.length ||
          (
            regularCount +
            premiumCount +
            vipCount
          ),

        totalAmount:
          Number(totalAmount),

        paymentMethod:
          "Razorpay",

        paymentProvider:
          "Razorpay",

        paymentStatus:
          "Paid",

        bookingStatus:
          "Confirmed",

        razorpayOrderId:
          paymentResponse
            .razorpay_order_id,

        razorpayPaymentId:
          paymentResponse
            .razorpay_payment_id,

      };


      console.log(
        "FINAL BOOKING PAYLOAD:",
        bookingPayload
      );


      const data =
        await createBooking(
          bookingPayload
        );


      if (!data?.success) {

        throw new Error(
          data?.message ||
          "Booking creation failed."
        );

      }


      return (
        data.booking ||
        data
      );

    };


  // =====================================================
  // RAZORPAY PAYMENT
  // =====================================================

  const handlePayment =
    async (e) => {

      e.preventDefault();


      // BOOKING CHECK
      if (!booking) {

        showPopup(
          "error",
          "Booking Missing",
          "Booking details were not found."
        );

        return;

      }


      // RAZORPAY CHECK
      if (!razorpayLoaded) {

        showPopup(
          "error",
          "Payment Gateway",
          "Razorpay is still loading. Please try again."
        );

        return;

      }


      // AMOUNT CHECK
      if (
        !totalAmount ||
        totalAmount <= 0
      ) {

        showPopup(
          "error",
          "Invalid Amount",
          "Payment amount is invalid."
        );

        return;

      }


      // USER CHECK
      const loggedInUser =
        getLoggedInUser();


      if (!loggedInUser) {

        showPopup(
          "error",
          "Login Required",
          "Please login before making payment."
        );

        return;

      }


      try {

        setProcessing(true);


        // =================================================
        // STEP 1
        // CREATE ORDER
        // =================================================

        const orderData =
          await createRazorpayOrder();


        console.log(
          "RAZORPAY ORDER:",
          orderData
        );


        const order =
          orderData?.order;


        const razorpayKey =
          orderData?.key ||
          process.env.REACT_APP_RAZORPAY_KEY_ID;


        if (!order?.id) {

          throw new Error(
            "Razorpay order ID not received."
          );

        }


        if (!razorpayKey) {

          throw new Error(
            "Razorpay Key ID not received."
          );

        }


        // =================================================
        // STEP 2
        // RAZORPAY OPTIONS
        // =================================================

        const options = {

          key:
            razorpayKey,

          amount:
            order.amount,

          currency:
            order.currency || "INR",

          name:
            "MovieBook",

          description:
            "Movie Ticket Booking",

          order_id:
            order.id,


          // =================================================
          // USER INFORMATION
          // =================================================

          prefill: {

            name:
              loggedInUser.name || "",

            email:
              loggedInUser.email || "",

            contact:
              loggedInUser.phone ||
              loggedInUser.mobile ||
              "",

          },


          // =================================================
          // PAYMENT METHODS
          // =================================================

          method: {

            // UPI ENABLED
            upi: true,

            // CARD ENABLED
            card: true,

            // NETBANKING ENABLED
            netbanking: true,

            // WALLET ENABLED
            wallet: true,

            // EMI DISABLED
            emi: false,

            // PAYLATER DISABLED
            paylater: false,

          },


          // =================================================
          // UPI CONFIGURATION
          // =================================================

          // config: {

          //   display: {

          //     blocks: {

          //       upi: {

          //         name:
          //           "Pay using UPI",

          //         instruments: [

          //           {
          //             method: "upi",
          //           },

          //         ],

          //       },

          //     },


          //     sequence: [

          //       "block.upi",

          //     ],


          //     preferences: {

          //       show_default_blocks:
          //         true,

          //     },

          //   },

          // },


          // =================================================
          // NOTES
          // =================================================

          notes: {

            movie:
              booking.movie?.title ||
              "",

            theatre:
              typeof booking.theatre ===
              "object"
                ? booking.theatre?.name
                : booking.theatre ||
                  "",

            bookingId:
              booking.bookingId ||
              "",

          },


          // =================================================
          // THEME
          // =================================================

          theme: {

            color:
              "#087ff5",

          },


          // =================================================
          // SUCCESS
          // =================================================

          handler:
            async (response) => {

              try {

                console.log(
                  "RAZORPAY SUCCESS:",
                  response
                );


                // VERIFY PAYMENT
                const verification =
                  await verifyRazorpayPayment({

                    razorpay_order_id:
                      response
                        .razorpay_order_id,

                    razorpay_payment_id:
                      response
                        .razorpay_payment_id,

                    razorpay_signature:
                      response
                        .razorpay_signature,

                  });


                if (
                  !verification?.success
                ) {

                  throw new Error(
                    verification?.message ||
                    "Payment verification failed."
                  );

                }


                // SAVE BOOKING
                const paidBooking =
                  await saveBooking(
                    response
                  );


                // SUCCESS DATA
                const successData = {

                  ...paidBooking,

                  paymentStatus:
                    "Paid",

                  bookingStatus:
                    "Confirmed",

                  paymentMethod:
                    "Razorpay",

                  paymentProvider:
                    "Razorpay",

                  razorpayOrderId:
                    response
                      .razorpay_order_id,

                  razorpayPaymentId:
                    response
                      .razorpay_payment_id,

                };


                // SAVE PAYMENT SUCCESS
                localStorage.setItem(
                  "paymentSuccess",
                  JSON.stringify(
                    successData
                  )
                );


                // SAVE LAST BOOKING
                localStorage.setItem(
                  "lastBooking",
                  JSON.stringify(
                    successData
                  )
                );


                // REMOVE CURRENT BOOKING
                localStorage.removeItem(
                  "currentBooking"
                );


                setProcessing(false);


                // SUCCESS POPUP
                showPopup(
                  "success",
                  "Payment Successful",
                  `Booking ID: ${
                    paidBooking?.bookingId ||
                    paidBooking?._id ||
                    "Confirmed"
                  }`
                );


                // BOOKING SUCCESS PAGE
                setTimeout(() => {

                  navigate(
                    "/BookingSuccess"
                  );

                }, 1500);


              } catch (error) {

                console.error(
                  "PAYMENT VERIFICATION ERROR:",
                  error
                );


                setProcessing(false);


                showPopup(
                  "error",
                  error.message?.toLowerCase().includes("seat")
                    ? "Seat Already Booked"
                    : "Payment Verification Failed",
                  error.message ||
                  "Unable to verify payment."
                );

              }

            },


          // =================================================
          // MODAL CLOSED
          // =================================================

          modal: {

            ondismiss: () => {

              console.log(
                "Razorpay popup closed"
              );

              setProcessing(false);

            },

          },

        };


        // =================================================
        // CREATE RAZORPAY INSTANCE
        // =================================================

        const razorpay =
          new window.Razorpay(
            options
          );


        // =================================================
        // PAYMENT FAILED
        // =================================================

        razorpay.on(
          "payment.failed",
          (response) => {

            console.error(
              "RAZORPAY PAYMENT FAILED:",
              response
            );


            setProcessing(false);


            showPopup(
              "error",
              "Payment Failed",
              response?.error
                ?.description ||
              "Payment failed. Please try again."
            );

          }
        );


        // OPEN RAZORPAY
        razorpay.open();


      } catch (error) {

        console.error(
          "RAZORPAY ERROR:",
          error
        );


        setProcessing(false);


        showPopup(
          "error",
          "Payment Failed",
          error.message ||
          "Unable to start payment."
        );

      }

    };


  // =====================================================
  // LOADING
  // =====================================================

  if (!booking) {

    return (

      <div className="payment-loading">

        <h2>
          Loading payment...
        </h2>

        <style>{`

          .payment-loading {

            min-height: 100vh;

            display: flex;

            align-items: center;

            justify-content: center;

            background: #eef5ff;

            font-family: Arial;

          }

        `}</style>

      </div>

    );

  }


  // =====================================================
  // UI
  // =====================================================

  return (

    <>

      <style>{`

        * {
          box-sizing: border-box;
        }

        .payment-page {

          min-height:
            calc(100vh - 70px);

          padding:
            35px 20px;

          background:
            linear-gradient(
              135deg,
              #dcecff,
              #f7fbff
            );

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          color:
            #111827;

        }

        .payment-container {

          max-width:
            1100px;

          margin:
            auto;

        }

        .payment-layout {

          display:
            grid;

          grid-template-columns:
            1fr 1fr;

          gap:
            22px;

          align-items:
            start;

        }

        .payment-box {

          background:
            white;

          border-radius:
            12px;

          padding:
            28px;

          border:
            1px solid #e1e8f0;

          box-shadow:
            0 5px 18px
            rgba(15, 23, 42, .08);

        }

        .payment-box h2 {

          margin:
            0 0 25px;

          font-size:
            26px;

        }

        .movie-summary {

          display:
            flex;

          gap:
            20px;

          align-items:
            flex-start;

          margin-bottom:
            25px;

        }

        .movie-summary img {

          width:
            130px;

          height:
            175px;

          object-fit:
            cover;

          border-radius:
            8px;

        }

        .movie-summary-info {

          flex:
            1;

        }

        .movie-summary-info h3 {

          margin:
            5px 0 10px;

          font-size:
            25px;

        }

        .movie-summary-info p {

          margin:
            7px 0;

          color:
            #64748b;

        }

        .rating {

          color:
            #f59e0b !important;

          font-weight:
            bold;

        }

        .summary-row {

          display:
            flex;

          justify-content:
            space-between;

          align-items:
            flex-start;

          gap:
            20px;

          padding:
            13px 0;

          border-bottom:
            1px solid #e2e8f0;

        }

        .summary-row span:first-child {

          color:
            #64748b;

        }

        .summary-row strong,
        .summary-row span:last-child {

          color:
            #111827;

          text-align:
            right;

        }

        .seat-list {

          max-width:
            70%;

          line-height:
            1.5;

          word-break:
            break-word;

        }

        .grand-total {

          display:
            flex;

          justify-content:
            space-between;

          align-items:
            center;

          padding-top:
            22px;

          margin-top:
            10px;

          border-top:
            2px solid #e2e8f0;

          font-size:
            19px;

          font-weight:
            bold;

        }

        .grand-total strong {

          color:
            #087ff5;

          font-size:
            32px;

        }

        .razorpay-box {

          padding:
            20px;

          border-radius:
            12px;

          background:
            #f5faff;

          border:
            1px solid #cfe3ff;

          margin-bottom:
            20px;

        }

        .razorpay-title {

          font-size:
            18px;

          font-weight:
            bold;

          margin-bottom:
            8px;

        }

        .razorpay-text {

          color:
            #64748b;

          line-height:
            1.5;

        }

        .payment-features {

          display:
            grid;

          gap:
            12px;

          margin-top:
            20px;

        }

        .payment-feature {

          padding:
            14px;

          border:
            1px solid #e2e8f0;

          border-radius:
            9px;

          background:
            #fff;

        }

        .pay-btn {

          width:
            100%;

          margin-top:
            22px;

          padding:
            16px;

          border:
            none;

          border-radius:
            8px;

          background:
            #087ff5;

          color:
            white;

          font-size:
            18px;

          font-weight:
            bold;

          cursor:
            pointer;

        }

        .pay-btn:hover {

          background:
            #006bd6;

        }

        .pay-btn:disabled {

          opacity:
            .6;

          cursor:
            not-allowed;

        }

        .secure-text {

          text-align:
            center;

          margin-top:
            15px;

          color:
            #64748b;

          font-size:
            13px;

        }

        .popup-overlay {

          position:
            fixed;

          inset:
            0;

          background:
            rgba(0,0,0,.55);

          display:
            flex;

          justify-content:
            center;

          align-items:
            center;

          z-index:
            9999;

        }

        .popup {

          width:
            90%;

          max-width:
            430px;

          background:
            white;

          border-radius:
            16px;

          padding:
            32px;

          text-align:
            center;

          box-shadow:
            0 20px 60px
            rgba(0,0,0,.25);

        }

        .popup-icon {

          width:
            70px;

          height:
            70px;

          margin:
            auto;

          border-radius:
            50%;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          color:
            white;

          font-size:
            38px;

          font-weight:
            bold;

        }

        .success-icon {

          background:
            #22c55e;

        }

        .error-icon {

          background:
            #ef4444;

        }

        .popup h2 {

          margin:
            22px 0 10px;

        }

        .popup p {

          color:
            #475569;

          line-height:
            1.5;

        }

        .popup-close {

          margin-top:
            12px;

          padding:
            11px 30px;

          border:
            none;

          border-radius:
            7px;

          background:
            #111827;

          color:
            white;

          cursor:
            pointer;

        }

        @media(max-width:850px) {

          .payment-layout {

            grid-template-columns:
              1fr;

          }

        }

        @media(max-width:500px) {

          .payment-page {

            padding:
              15px 10px;

          }

          .payment-box {

            padding:
              18px;

          }

          .movie-summary img {

            width:
              100px;

            height:
              135px;

          }

          .movie-summary-info h3 {

            font-size:
              20px;

          }

          .grand-total strong {

            font-size:
              27px;

          }

        }

      `}</style>


      <div className="payment-page">

        <div className="payment-container">

          <div className="payment-layout">


            {/* =========================================
                BOOKING SUMMARY
            ========================================= */}

            <div className="payment-box">

              <h2>
                Booking Summary
              </h2>


              <div className="movie-summary">

                <img
                  src={
                    booking.movie?.image
                  }

                  alt={
                    booking.movie?.title ||
                    "Movie"
                  }
                />


                <div className="movie-summary-info">

                  <h3>
                    {
                      booking.movie?.title ||
                      "Movie"
                    }
                  </h3>


                  <p className="rating">

                    ⭐{" "}

                    {
                      booking.movie?.rating ||
                      "N/A"
                    }

                  </p>


                  <p>

                    {
                      booking.movie?.genre ||
                      "Movie"
                    }

                    {" • "}

                    {
                      booking.movie?.duration ||
                      "3h 0m"
                    }

                  </p>

                </div>

              </div>


              <div className="summary-row">

                <span>
                  Theatre
                </span>

                <strong>

                  {
                    typeof booking.theatre ===
                    "object"

                      ? booking.theatre?.name

                      : booking.theatre ||
                        "PVR Cinemas"
                  }

                </strong>

              </div>


              <div className="summary-row">

                <span>
                  Date
                </span>

                <strong>

                  {
                    booking.date ||
                    "-"
                  }

                </strong>

              </div>


              <div className="summary-row">

                <span>
                  Time
                </span>

                <strong>

                  {
                    booking.time ||
                    "-"
                  }

                </strong>

              </div>


              <div className="summary-row">

                <span>
                  Seats
                </span>

                <strong className="seat-list">

                  {
                    selectedSeats.length > 0

                      ? selectedSeats.join(", ")

                      : "No seats selected"
                  }

                </strong>

              </div>


              <div className="summary-row">

                <span>
                  Regular
                </span>

                <span>

                  {regularCount}

                  {" × ₹"}

                  {regularPrice}

                  {" = ₹"}

                  {regularTotal}

                </span>

              </div>


              <div className="summary-row">

                <span>
                  Premium
                </span>

                <span>

                  {premiumCount}

                  {" × ₹"}

                  {premiumPrice}

                  {" = ₹"}

                  {premiumTotal}

                </span>

              </div>


              <div className="summary-row">

                <span>
                  VIP
                </span>

                <span>

                  {vipCount}

                  {" × ₹"}

                  {vipPrice}

                  {" = ₹"}

                  {vipTotal}

                </span>

              </div>


              <div className="grand-total">

                <span>
                  Total
                </span>

                <strong>
                  ₹{totalAmount}
                </strong>

              </div>

            </div>


            {/* =========================================
                RAZORPAY PAYMENT
            ========================================= */}

            <div className="payment-box">

              <h2>
                Payment
              </h2>


              <div className="razorpay-box">

                <div className="razorpay-title">

                  🔒 Secure Razorpay Payment

                </div>


                <div className="razorpay-text">

                  Pay securely using:

                </div>


                <div className="payment-features">

                  <div className="payment-feature">

                    💳{" "}

                    <strong>
                      Credit / Debit Card
                    </strong>

                  </div>


                  <div className="payment-feature">

                    📱{" "}

                    <strong>
                      UPI
                    </strong>

                    {" — Google Pay, PhonePe, Paytm"}

                  </div>


                  <div className="payment-feature">

                    🏦{" "}

                    <strong>
                      Net Banking
                    </strong>

                  </div>

                </div>

              </div>


              <form
                onSubmit={
                  handlePayment
                }
              >

                <button
                  type="submit"
                  className="pay-btn"
                  disabled={
                    processing ||
                    !razorpayLoaded
                  }
                >

                  {
                    processing

                      ? "Processing Payment..."

                      : !razorpayLoaded

                        ? "Loading Razorpay..."

                        : `Pay ₹${totalAmount}`
                  }

                </button>

              </form>


              <div className="secure-text">

                🔐 You will be redirected to
                Razorpay's secure checkout.

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* =========================================
          POPUP
      ========================================= */}

      {popup.show && (

        <div className="popup-overlay">

          <div className="popup">

            <div
              className={
                `popup-icon ${
                  popup.type ===
                  "success"

                    ? "success-icon"

                    : "error-icon"
                }`
              }
            >

              {
                popup.type ===
                "success"

                  ? "✓"

                  : "!"
              }

            </div>


            <h2>
              {popup.title}
            </h2>


            <p>
              {popup.message}
            </p>


            {
              popup.type ===
              "error" && (

                <button
                  className="popup-close"
                  onClick={
                    closePopup
                  }
                >

                  OK

                </button>

              )
            }

          </div>

        </div>

      )}

    </>

  );

};


export default Payment;
