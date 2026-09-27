"use client";

import dynamic from "next/dynamic";

const DoctorMap = dynamic(
  () => import("../components/DoctorMap"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: "100%",
          height: "350px",
          borderRadius: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f5f5",
        }}
      >
        Loading map...
      </div>
    ),
  }
);

export default function MapTestPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px",
        background: "#ffffff",
      }}
    >
      <h1 style={{ marginBottom: "10px" }}>
        CAREBRIDGE Doctor Map Test
      </h1>

      <p style={{ marginBottom: "25px" }}>
        Bangalore Clinic Location
      </p>

      <DoctorMap
        latitude={12.9716}
        longitude={77.5946}
        doctorName="Test Doctor"
        clinicName="Test Clinic, Bangalore"
        address="Bangalore, Karnataka, India"
      />
    </main>
  );
}