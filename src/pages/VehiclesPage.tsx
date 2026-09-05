import { useEffect, useState } from 'react';
import { CarFront, Fuel, Heart, Gauge, ChevronRight } from 'lucide-react';
import { supabase, type Vehicle, type Character } from '../lib/supabase';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<(Vehicle & { owner_name: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: vData, error: vError }, { data: cData }] = await Promise.all([
        supabase.from('vehicles').select('*').order('created_at', { ascending: false }),
        supabase.from('characters').select('id, name'),
      ]);
      if (vError) { setError(vError.message); setLoading(false); return; }
      const ownerMap = new Map<number, string>();
      (cData as Character[] | null)?.forEach((c) => ownerMap.set(c.id, c.name.replace('_', ' ')));
      const merged = (vData as Vehicle[] | null)?.map((v) => ({
        ...v, owner_name: ownerMap.get(v.character_id) ?? 'Unknown',
      })) ?? [];
      setVehicles(merged);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="page-status">Loading garage…</div>;
  if (error) return <div className="page-status error">Unable to load vehicles: {error}</div>;
  if (vehicles.length === 0) return <div className="page-status">No vehicles in the garage yet.</div>;

  return (
    <div className="page-enter">
      <div className="page-header-row">
        <div>
          <p className="eyebrow"><span className="pulse-dot" /> CITY GARAGE</p>
          <h1>Vehicles</h1>
          <p className="page-sub">Every ride registered to a SEA TRIBE character.</p>
        </div>
      </div>

      <div className="card-grid">
        {vehicles.map((vehicle) => (
          <article key={vehicle.id} className="vehicle-card">
            <div className="vehicle-banner">
              <CarFront size={42} />
              <span className={`spawn-pill ${vehicle.is_spawned ? 'spawned' : 'stored'}`}>
                {vehicle.is_spawned ? 'SPAWNED' : 'STORED'}
              </span>
            </div>
            <div className="vehicle-body">
              <h3>{vehicle.name}</h3>
              <p className="vehicle-owner">Owner · {vehicle.owner_name}</p>
              <div className="vehicle-plate">{vehicle.plate}</div>
              <div className="vehicle-stats">
                <span><Fuel size={13} /> {vehicle.fuel}%</span>
                <span><Heart size={13} /> {vehicle.health}%</span>
                <span><Gauge size={13} /> Model {vehicle.model_id}</span>
              </div>
              <div className="vehicle-color-bar">
                <span>{vehicle.color}</span>
                <span className="color-swatch" style={{ background: vehicle.color.toLowerCase().includes('pink') ? '#e84cb9' : vehicle.color.toLowerCase().includes('black') ? '#1a1a22' : '#f0f0f0' }} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
