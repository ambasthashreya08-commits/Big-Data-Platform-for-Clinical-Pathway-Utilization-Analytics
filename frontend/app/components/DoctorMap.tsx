"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type DoctorMapProps = {
  latitude?: number | null;
  longitude?: number | null;
  doctorName: string;
  clinicName: string;
  address: string;
};

type Location = {
  latitude: number;
  longitude: number;
};

const doctorIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const userIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function RecenterMap({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView([latitude, longitude], 15);
  }, [map, latitude, longitude]);

  return null;
}

export default function DoctorMap({
  latitude,
  longitude,
  doctorName,
  clinicName,
  address,
}: DoctorMapProps) {
  const hasCoordinates =
    latitude != null &&
    longitude != null &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude);

  const [clinicLocation, setClinicLocation] = useState<Location | null>(
    hasCoordinates
      ? {
          latitude: latitude as number,
          longitude: longitude as number,
        }
      : null
  );

  const [locationSource, setLocationSource] = useState<
    "directory" | "osm" | "approximate" | null
  >(hasCoordinates ? "directory" : null);

  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [mapLoading, setMapLoading] = useState(!hasCoordinates);

  // ----------------------------------------------------------
  // FIND CLINIC LOCATION
  // ----------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    async function findClinic() {
      if (hasCoordinates) {
        setClinicLocation({
          latitude: latitude as number,
          longitude: longitude as number,
        });
        setLocationSource("directory");
        setMapLoading(false);
        return;
      }

      setMapLoading(true);
      setClinicLocation(null);
      setLocationSource(null);

      // Try clinic name first. Exact house-number searches can fail in
      // Nominatim even when the physical address is valid.
      const searchQueries = [
        `${clinicName}, Yelahanka, Bengaluru, India`,
        `${clinicName}, Bengaluru, India`,
        `${address}, Bengaluru, India`,
      ];

      for (const query of searchQueries) {
        if (cancelled) return;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(
              query
            )}`,
            {
              headers: {
                Accept: "application/json",
              },
            }
          );

          if (!response.ok) continue;

          const data = await response.json();

          if (Array.isArray(data) && data.length > 0) {
            const lat = Number(data[0].lat);
            const lon = Number(data[0].lon);

            if (Number.isFinite(lat) && Number.isFinite(lon)) {
              if (!cancelled) {
                setClinicLocation({
                  latitude: lat,
                  longitude: lon,
                });
                setLocationSource("osm");
                setMapLoading(false);
              }
              return;
            }
          }
        } catch {
          // Try the next query.
        }
      }

      if (cancelled) return;

      // Safe demo fallback for the Samiksha clinic when OSM has no
      // searchable POI for the exact address. This is a locality-level
      // position, NOT an exact house-number coordinate.
      if (clinicName.toLowerCase().includes("samiksha")) {
        setClinicLocation({
          latitude: 13.1007,
          longitude: 77.5963,
        });
        setLocationSource("approximate");
        setMapLoading(false);
        return;
      }

      // Generic Bangalore fallback if no geocoding result exists.
      setClinicLocation({
        latitude: 12.9716,
        longitude: 77.5946,
      });
      setLocationSource("approximate");
      setMapLoading(false);
    }

    void findClinic();

    return () => {
      cancelled = true;
    };
  }, [latitude, longitude, clinicName, address, hasCoordinates]);

  // ----------------------------------------------------------
  // GET USER LOCATION + OSM DIRECTIONS
  // ----------------------------------------------------------
  function getDirections() {
    if (!clinicLocation) return;

    setLocationLoading(true);

    const openDestinationOnly = () => {
      const url =
        `https://www.openstreetmap.org/directions?` +
        `engine=fossgis_osrm_car&route=;` +
        `${clinicLocation.latitude},${clinicLocation.longitude}`;

      window.open(url, "_blank", "noopener,noreferrer");
    };

    if (!navigator.geolocation) {
      openDestinationOnly();
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setUserLocation(currentLocation);

        const url =
          `https://www.openstreetmap.org/directions?` +
          `engine=fossgis_osrm_car&route=` +
          `${currentLocation.latitude},${currentLocation.longitude};` +
          `${clinicLocation.latitude},${clinicLocation.longitude}`;

        window.open(url, "_blank", "noopener,noreferrer");
        setLocationLoading(false);
      },
      () => {
        openDestinationOnly();
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }

  // ----------------------------------------------------------
  // LOADING
  // ----------------------------------------------------------
  if (mapLoading) {
    return (
      <div
        className="doctorMapLoading"
        style={{
          height: "350px",
          display: "grid",
          placeItems: "center",
          background: "#f5f8fc",
          color: "#64748b",
          fontSize: "13px",
        }}
      >
        Finding clinic location...
      </div>
    );
  }

  if (!clinicLocation) {
    return (
      <div
        style={{
          height: "350px",
          display: "grid",
          placeItems: "center",
          background: "#f5f8fc",
          color: "#64748b",
          fontSize: "13px",
        }}
      >
        Clinic location could not be loaded.
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "350px",
        position: "relative",
      }}
    >
      <MapContainer
        center={[clinicLocation.latitude, clinicLocation.longitude]}
        zoom={15}
        scrollWheelZoom={true}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap
          latitude={clinicLocation.latitude}
          longitude={clinicLocation.longitude}
        />

        <Marker
          position={[clinicLocation.latitude, clinicLocation.longitude]}
          icon={doctorIcon}
        >
          <Popup>
            <div style={{ minWidth: "220px" }}>
              <strong>{doctorName}</strong>

              <div
                style={{
                  marginTop: "5px",
                  fontSize: "13px",
                }}
              >
                {clinicName}
              </div>

              <div
                style={{
                  marginTop: "5px",
                  fontSize: "12px",
                  color: "#64748b",
                }}
              >
                {address}
              </div>

              {locationSource === "approximate" && (
                <div
                  style={{
                    marginTop: "8px",
                    padding: "7px 8px",
                    borderRadius: "7px",
                    background: "#fff4d5",
                    color: "#7a5100",
                    fontSize: "11px",
                  }}
                >
                  Map marker is approximate because the exact clinic
                  coordinates are not stored in the local directory.
                </div>
              )}

              <button
                onClick={getDirections}
                style={{
                  marginTop: "12px",
                  width: "100%",
                  padding: "9px 12px",
                  border: "none",
                  borderRadius: "8px",
                  background: "linear-gradient(90deg,#1769ff,#00a8d6)",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {locationLoading
                  ? "Finding your location..."
                  : "📍 Get Directions"}
              </button>
            </div>
          </Popup>
        </Marker>

        {userLocation && (
          <Marker
            position={[
              userLocation.latitude,
              userLocation.longitude,
            ]}
            icon={userIcon}
          >
            <Popup>
              <strong>Your location</strong>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
