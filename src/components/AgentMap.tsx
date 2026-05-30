import { useEffect, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface AgentPin {
  id: string;
  name: string;
  logo: string;
  rating: number;
  latitude: number;
  longitude: number;
  distance_miles: number;
}

interface AgentMapProps {
  agents: AgentPin[];
  searchLat: number;
  searchLng: number;
  selectedAgentId: string | null;
  onAgentSelect: (id: string) => void;
}

// Fix default leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const houseIcon = new L.DivIcon({
  html: `<div style="background:#00E5CC;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);font-size:18px;">🏠</div>`,
  className: "",
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const agentIcon = (logo: string, selected: boolean) =>
  new L.DivIcon({
    html: `<div style="background:${selected ? "#00E5CC" : "#1a2744"};width:${selected ? 40 : 32}px;height:${selected ? 40 : 32}px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid ${selected ? "white" : "#00E5CC"};box-shadow:0 2px 8px rgba(0,0,0,0.4);font-size:${selected ? 18 : 14}px;transition:all 0.2s;">${logo}</div>`,
    className: "",
    iconSize: [selected ? 40 : 32, selected ? 40 : 32],
    iconAnchor: [selected ? 20 : 16, selected ? 20 : 16],
  });

function FitBounds({ agents, searchLat, searchLng }: { agents: AgentPin[]; searchLat: number; searchLng: number }) {
  const map = useMap();
  useEffect(() => {
    const points: L.LatLngExpression[] = [
      [searchLat, searchLng],
      ...agents.map((a) => [a.latitude, a.longitude] as L.LatLngExpression),
    ];
    if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 14 });
    } else {
      map.setView([searchLat, searchLng], 12);
    }
  }, [agents, searchLat, searchLng, map]);
  return null;
}

function FlyToSelected({ agents, selectedId }: { agents: AgentPin[]; selectedId: string | null }) {
  const map = useMap();
  useEffect(() => {
    if (!selectedId) return;
    const agent = agents.find((a) => a.id === selectedId);
    if (agent) {
      map.flyTo([agent.latitude, agent.longitude], 13, { duration: 0.6 });
    }
  }, [selectedId, agents, map]);
  return null;
}

const AgentMap = ({ agents, searchLat, searchLng, selectedAgentId, onAgentSelect }: AgentMapProps) => {
  const markerRefs = useRef<Record<string, L.Marker>>({}); 

  useEffect(() => {
    if (selectedAgentId && markerRefs.current[selectedAgentId]) {
      markerRefs.current[selectedAgentId].openPopup();
    }
  }, [selectedAgentId]);

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-white/10" style={{ minHeight: 350 }}>
      <MapContainer
        center={[searchLat, searchLng]}
        zoom={12}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ height: "100%", minHeight: 350, background: "#0A1428" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <FitBounds agents={agents} searchLat={searchLat} searchLng={searchLng} />
        <FlyToSelected agents={agents} selectedId={selectedAgentId} />

        {/* User's searched property */}
        <Marker position={[searchLat, searchLng]} icon={houseIcon}>
          <Popup>
            <div className="text-center font-semibold text-sm">Your Property</div>
          </Popup>
        </Marker>

        {/* Agent pins */}
        {agents.map((agent) => (
          <Marker
            key={agent.id}
            position={[agent.latitude, agent.longitude]}
            icon={agentIcon(agent.logo, agent.id === selectedAgentId)}
            ref={(ref) => {
              if (ref) markerRefs.current[agent.id] = ref;
            }}
            eventHandlers={{
              click: () => onAgentSelect(agent.id),
            }}
          >
            <Popup>
              <div className="text-center min-w-[120px]">
                <p className="font-bold text-sm">{agent.name}</p>
                <p className="text-xs text-gray-500">{agent.rating}/10 · {agent.distance_miles.toFixed(1)} mi</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default AgentMap;
