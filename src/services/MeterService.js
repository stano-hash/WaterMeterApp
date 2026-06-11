import {getMeters, updateMeterStatus, addAlert, getReadingsByMeterId} from '../database/Database';

export const checkMeterHealth = async (meterId) => {
  const meterReadings = await getReadingsByMeterId(meterId);
  if (meterReadings.length === 0) return 'no_readings';
  const readings = meterReadings.slice(-10);
  const values = readings.map(r => parseFloat(r.value));
  let sum = 0;
  for (const v of values) sum += v;
  const avg = sum / values.length;
  const recentValues = values.slice(-3);
  const recentSum = recentValues.reduce((a, b) => a + b, 0);
  if (recentSum === avg * 3 && Math.abs(values[values.length - 1] - values[values.length - 2]) < 0.001) {
    return 'no_flow';
  }
  const ratios = [];
  for (let i = 1; i < values.length; i++) {
    if (values[i - 1] !== 0) ratios.push(Math.abs(values[i] - values[i - 1]) / values[i - 1]);
  }
  if (ratios.length > 0) {
    const maxRatio = Math.max(...ratios);
    if (maxRatio > 5) return 'leak';
  }
  return 'normal';
};

export const monitorAllMeters = async () => {
  const meters = await getMeters();
  const results = [];
  for (const meter of meters) {
    const health = await checkMeterHealth(meter.id);
    const newStatus = health === 'normal' ? 'normal' : health === 'no_flow' ? 'warning' : 'alert';
    if (newStatus !== meter.status) {
      await updateMeterStatus(meter.id, newStatus);
    }
    if (health === 'leak') {
      await addAlert(meter.id, 'leak_detection', 'critical', `Leak detected at ${meter.location} (${meter.meterId})`);
    } else if (health === 'no_flow') {
      await addAlert(meter.id, 'no_flow', 'high', `No flow detected at ${meter.location} (${meter.meterId})`);
    }
    const updated = await getMeters();
    results.push({...meter, status: updated.find(m => m.id === meter.id)?.status || meter.status});
  }
  return results;
};
