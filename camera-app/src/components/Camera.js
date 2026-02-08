import { useEffect, useRef, useState } from "react";

const FullscreenCamera = () => {
  const videoRef = useRef(null);
  const [isStarted, setIsStarted] = useState(false);

  const [coords, setCoords] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
    timestamp: null,
  });

  const [heading, setHeading] = useState(null);
  const [orientationEnabled, setOrientationEnabled] = useState(false);
  const [orientation, setOrientation] = useState({
    alpha: null,
    beta: null,
    gamma: null,
  });

  const [showInfo, setShowInfo] = useState(false);
  const touchStartY = useRef(0);

  const predicted = {
    building_name: "14 Arnall Avenue",
    location: "Toronto, Canada",
    predicted_price_or_rent: {
      type: "rent",
      amount: "3500",
      currency: "CAD",
      confidence: "medium",
      notes:
        "Estimated monthly rent for a typical residential unit in the Scarborough area, reflecting current market conditions for similar properties.",
    },
    future_price_projection: {
      "1_year": "3605",
      "5_year": "4025",
      trend: "up",
      confidence: "medium",
      notes:
        "Projections based on historical performance of Toronto's residential market and anticipated economic stability, with moderate growth expected.",
    },
    nearby_food_grocery: [
      "FreshCo (Sheppard & Markham)",
      "Walmart Supercentre (Sheppard Ave E)",
      "T&T Supermarket (Middlefield Rd)",
    ],
    nearby_schools: [
      "Mary Ward Catholic Secondary School",
      "Silver Springs Public School",
      "Agincourt Junior Public School",
    ],
  };

  // 📸 Start rear camera
  useEffect(() => {
    if (!isStarted) return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { exact: "environment" } },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (error) {
        console.error("Camera error:", error);
      }
    };
    startCamera();
  }, [isStarted]);

  // 📍 Geolocation updates
  useEffect(() => {
    if (!isStarted || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
          accuracy: position.coords.accuracy.toFixed(2),
          timestamp: new Date(position.timestamp).toLocaleTimeString(),
        });
      },
      (err) => console.error("Geolocation error:", err),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isStarted]);

  // 🧭 Device orientation
  const enableOrientation = async () => {
    const handleOrientation = (event) => {
      let compassHeading = null;

      if (typeof event.webkitCompassHeading === "number") {
        compassHeading = event.webkitCompassHeading;
      } else if (typeof event.alpha === "number") {
        compassHeading = event.alpha;
      }

      if (compassHeading !== null) {
        compassHeading = compassHeading % 360;
        if (compassHeading < 0) compassHeading += 360;
        setHeading(Math.round(compassHeading));
      }

      setOrientation({
        alpha: event.alpha?.toFixed(1) ?? null,
        beta: event.beta?.toFixed(1) ?? null,
        gamma: event.gamma?.toFixed(1) ?? null,
      });
    };

    try {
      if (
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function"
      ) {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === "granted") {
          window.addEventListener("deviceorientation", handleOrientation, true);
          setOrientationEnabled(true);
        }
      } else {
        window.addEventListener("deviceorientation", handleOrientation, true);
        setOrientationEnabled(true);
      }
    } catch (error) {
      console.error("Orientation error:", error);
    }
  };

  // 🏠 Show icon if heading is ~north (±10°)
  const isFacingNorth = heading !== null && (heading <= 10 || heading >= 350);

  // Handle swipe down to close popup
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const swipeDistance = touchEndY - touchStartY.current;

    // If swiped down more than 100px, close popup
    if (swipeDistance > 100) {
      setShowInfo(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", backgroundColor: "black" }}>
      {/* Start AR Button */}
      {!isStarted && (
        <button
          onClick={() => setIsStarted(true)}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            padding: "20px 40px",
            fontSize: "20px",
            fontWeight: "bold",
            background: "white",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            zIndex: 1000,
          }}
        >
          Start AR
        </button>
      )}

      {/* All camera and UI elements - only show after start */}
      {isStarted && (
        <>
          {/* 📷 Fullscreen Camera */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              objectFit: "cover",
              backgroundColor: "black",
              zIndex: 0,
            }}
          />

          {/* 🔴 Red Dot Center */}
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "14px",
              height: "14px",
              backgroundColor: "red",
              borderRadius: "50%",
              zIndex: 2,
            }}
          />

          {/* 🏠 House Icon - Bottom Right */}
          {isFacingNorth && (
            <button
              onClick={() => setShowInfo(true)}
              style={{
                position: "fixed",
                bottom: "30px",
                right: "30px",
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.9)",
                border: "none",
                fontSize: "28px",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 100,
              }}
            >
              🏠
            </button>
          )}

          {/* 🪧 Property Info Panel - Slide Up */}
          {showInfo && (
            <div
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              style={{
                position: "fixed",
                bottom: 0,
                left: 0,
                width: "100%",
                height: "75%",
                backgroundColor: "white",
                zIndex: 300,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                borderTopLeftRadius: "20px",
                borderTopRightRadius: "20px",
                animation: "slideUp 0.3s ease-out",
              }}
            >
              {/* Swipe indicator */}
              <div
                style={{
                  width: "100%",
                  padding: "15px 0",
                  display: "flex",
                  justifyContent: "center",
                  background: "#f5f5f5",
                  borderTopLeftRadius: "20px",
                  borderTopRightRadius: "20px",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "5px",
                    background: "#ccc",
                    borderRadius: "3px",
                  }}
                />
              </div>

              <div
                style={{
                  flex: 1,
                  padding: "20px",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  color: "#000",
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "10px" }}>🏠</div>
                <h3 style={{ margin: "0 0 10px 0", fontSize: "24px", fontWeight: "bold" }}>
                  {predicted.building_name}
                </h3>
                <p style={{ color: "#666", margin: "0 0 20px 0" }}>{predicted.location}</p>

                <div
                  style={{
                    background: "#f5f5f5",
                    padding: "15px",
                    borderRadius: "12px",
                    marginBottom: "20px",
                  }}
                >
                  <div style={{ fontSize: "14px", color: "#666", marginBottom: "5px" }}>
                    {predicted.predicted_price_or_rent.type}
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "5px" }}>
                    {predicted.predicted_price_or_rent.currency} ${predicted.predicted_price_or_rent.amount}
                  </div>
                  <div style={{ fontSize: "12px", color: "#999" }}>
                    Confidence: {predicted.predicted_price_or_rent.confidence}
                  </div>
                </div>

                <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>
                  {predicted.predicted_price_or_rent.notes}
                </p>

                <h3 style={{ fontSize: "18px", marginBottom: "10px" }}>📈 Price Projection</h3>
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ marginBottom: "8px" }}>
                    <strong>1 Year:</strong> ${predicted.future_price_projection["1_year"]}
                  </div>
                  <div style={{ marginBottom: "8px" }}>
                    <strong>5 Years:</strong> ${predicted.future_price_projection["5_year"]}
                  </div>
                  <div style={{ marginBottom: "8px" }}>
                    <strong>Trend:</strong> {predicted.future_price_projection.trend} (
                    {predicted.future_price_projection.confidence})
                  </div>
                </div>
                <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px", fontStyle: "italic" }}>
                  {predicted.future_price_projection.notes}
                </p>

                <h3 style={{ fontSize: "18px", marginBottom: "10px" }}>🛒 Nearby Grocery</h3>
                <ul style={{ paddingLeft: "20px", marginBottom: "20px" }}>
                  {predicted.nearby_food_grocery.map((store, i) => (
                    <li key={i} style={{ marginBottom: "5px" }}>
                      {store}
                    </li>
                  ))}
                </ul>

                <h3 style={{ fontSize: "18px", marginBottom: "10px" }}>🏫 Nearby Schools</h3>
                <ul style={{ paddingLeft: "20px", marginBottom: "20px" }}>
                  {predicted.nearby_schools.map((school, i) => (
                    <li key={i} style={{ marginBottom: "5px" }}>
                      {school}
                    </li>
                  ))}
                </ul>

                <div
                  style={{
                    color: "#999",
                    fontSize: "12px",
                    textAlign: "center",
                    marginTop: "30px",
                    paddingTop: "20px",
                    borderTop: "1px solid #eee",
                  }}
                >
                  Swipe down to return to camera
                </div>
              </div>

              {/* CSS Animation */}
              <style>
                {`
                  @keyframes slideUp {
                    from {
                      transform: translateY(100%);
                    }
                    to {
                      transform: translateY(0);
                    }
                  }
                `}
              </style>
            </div>
          )}

          {/* ℹ️ Info HUD */}
          <div
            style={{
              position: "fixed",
              bottom: 40,
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "rgba(0,0,0,0.6)",
              color: "white",
              padding: "12px 16px",
              borderRadius: "10px",
              fontSize: "14px",
              fontFamily: "monospace",
              zIndex: 3,
              textAlign: "center",
              lineHeight: "1.4em",
            }}
          >
            <div>📍 Lat: {coords.latitude ?? "---"}</div>
            <div>📍 Lng: {coords.longitude ?? "---"}</div>
            <div>🎯 Accuracy: ±{coords.accuracy ?? "---"} m</div>
            <div>⏱ Updated: {coords.timestamp ?? "---"}</div>
            <div>🧭 Heading: {heading !== null ? `${heading}°` : "---"}</div>
            <div>📐 Alpha: {orientation.alpha ?? "---"}°</div>
            <div>📐 Beta: {orientation.beta ?? "---"}°</div>
            <div>📐 Gamma: {orientation.gamma ?? "---"}°</div>
          </div>

          {/* 🛡 Motion Permission */}
          {!orientationEnabled && (
            <button
              onClick={enableOrientation}
              style={{
                position: "fixed",
                top: 60,
                left: "50%",
                transform: "translateX(-50%)",
                padding: "12px 20px",
                backgroundColor: "#ff4444",
                color: "white",
                fontWeight: "bold",
                borderRadius: "8px",
                border: "none",
                fontSize: "16px",
                zIndex: 6,
                cursor: "pointer",
              }}
            >
              Enable Orientation
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default FullscreenCamera;