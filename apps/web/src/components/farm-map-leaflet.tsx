"use client";

import { MapContainer, TileLayer, Polygon, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "#1b4332",
  FALLOW: "#94a3b8",
  UNDER_PREPARATION: "#b08968",
  ISSUE: "#b91c1c",
  INACTIVE: "#cbd5e1",
};

function toLatLngs(boundary: any): [number, number][] | null {
  if (!boundary?.coordinates?.[0]) return null;
  return boundary.coordinates[0].map(([lng, lat]: [number, number]) => [lat, lng]);
}

export function FarmMapLeaflet({ areas, plots }: { areas: any[]; plots: any[] }) {
  const center: [number, number] = areas[0]?.centerLat ? [areas[0].centerLat, areas[0].centerLng] : [10.5276, 76.2144];

  return (
    <MapContainer center={center} zoom={17} style={{ height: "600px", width: "100%", borderRadius: "0.6rem" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {areas.map((a) => {
        const latlngs = toLatLngs(a.boundary);
        if (!latlngs) return null;
        return (
          <Polygon key={a.id} positions={latlngs} pathOptions={{ color: STATUS_COLOR[a.status] ?? "#888", fillOpacity: 0.35 }}>
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{a.name}</div>
                <div>{a.type.replace(/_/g, " ")}</div>
                <div>Status: {a.status.replace(/_/g, " ")}</div>
              </div>
            </Popup>
          </Polygon>
        );
      })}
      {plots.map((p) => {
        const latlngs = toLatLngs(p.boundary);
        if (!latlngs) return null;
        return (
          <Polygon key={p.id} positions={latlngs} pathOptions={{ color: STATUS_COLOR[p.status] ?? "#888", fillOpacity: 0.2, dashArray: "4" }}>
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">Plot {p.code}</div>
                <div>{p.subPlots?.length ?? 0} sub-plot(s)</div>
              </div>
            </Popup>
          </Polygon>
        );
      })}
    </MapContainer>
  );
}
