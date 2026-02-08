import { useEffect, useRef, useState } from "react";

const Orientation = () => {
  const videoRef = useRef(null);

  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const [heading, setHeading] = useState(null);
  const [orientationEnabled, setOrientationEnabled] = useState(false);

  // 📷 Camera
  useEffect(() => {
    const start = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    };
    start();
  }, []);

  // 📍 GPS
  useEffect(() => {
    if (!navigator.geolocation) return;

    const id = navigator.geolocation.watchPosition((pos) => {
      setLat(pos.coords.latitude);
      setLon(pos.coords.longitude);
    });

    return () => navigator.geolocation.clearWatch(id);
  }, []);

  // 🧭 Heading only
  const handleOrientation = (e) => {
    let h = null;

    // iOS
    if (typeof e.webkitCompassHeading === "number") {
      h = e.webkitCompassHeading;
    }
    // Android fallback
    else if (typeof e.alpha === "number") {
      h = e.alpha;
    }

    if (h != null) {
      h = ((h % 360) + 360) % 360;
      setHeading(Math.round(h));
    }
  };

  // 🔐 Enable orientation (needed for iOS)
  const enableOrientation = async () => {
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      const perm = await DeviceOrientationEvent.requestPermission();
      if (perm !== "granted") return;
    }

    window.addEventListener("deviceorientation", handleOrientation, true);
    setOrientationEnabled(true);
  };

  return (
    <div style={{ position: "relative", height: "100vh", background: "black" }}>
      {/* Camera */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />

      {/* Minimal overlay */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          color: "white",
          fontFamily: "monospace",
          background: "rgba(0,0,0,0.5)",
          padding: 8,
          borderRadius: 6,
        }}
      >
        <div>lat: {lat ?? "---"}</div>
        <div>lon: {lon ?? "---"}</div>
        <div>heading: {heading ?? "---"}°</div>
      </div>

      {!orientationEnabled && (
        <button
          onClick={enableOrientation}
          style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            padding: "12px 16px",
          }}
        >
          enable orientation
        </button>
      )}
    </div>
  );
}

export default Orientation;