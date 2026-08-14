import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import socket from "../socket";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function ChangeMapView({ center }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, 16);
  }, [center, map]);

  return null;
}

function LiveMap() {
  const [position, setPosition] = useState([18.5204, 73.8567]);

  useEffect(() => {
    socket.on("receiveLocation", (data) => {
      setPosition([data.latitude, data.longitude]);
    });

    return () => {
      socket.off("receiveLocation");
    };
  }, []);

  return (
    <MapContainer
      center={position}
      zoom={16}
      style={{ height: "100vh", width: "100%" }}
    >
      <ChangeMapView center={position} />

      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />

      <Marker position={position} icon={icon}>
        <Popup>Live User Location</Popup>
      </Marker>
    </MapContainer>
  );
}

export default LiveMap;