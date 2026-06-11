import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, FlatList} from 'react-native';
import {initDB, getMeters, addMeter, getReadings, addReading, addAlert, addBill, getNotifications} from '../database/Database';
import {monitorAllMeters} from '../services/MeterService';

const SeedDataScreen = ({navigation}) => {
  const [status, setStatus] = useState('');
  const [logs, setLogs] = useState([]);

  const addLog = (msg) => setLogs(prev => [...prev, msg]);

  useEffect(() => {seed();}, []);

  const seed = async () => {
    try {
      setStatus('Seeding database...');
      initDB();

      const existingMeters = await getMeters();
      if (existingMeters.length > 0) {
        addLog('Database already has data. Skipping.');
        setStatus('Already initialized');
        return;
      }

      addLog('Adding users...');
      await addMeter('WMU-1001', 'SN-88201', '123 Main St, District A', 1, 40.7128, -74.0060);
      await addMeter('WMU-1002', 'SN-88202', '456 Oak Ave, District A', 2, 40.7138, -74.0160);
      await addMeter('WMU-1003', 'SN-88203', '789 Pine Rd, District B', 3, 40.7228, -74.0260);
      await addMeter('WMU-1004', 'SN-88204', '101 Cedar Ln, District B', 1, 40.7328, -74.0360);
      await addMeter('WMU-1005', 'SN-88205', '202 Birch Blvd, District C', 2, 40.7428, -74.0460);

      addLog('Adding sample readings...');
      const meters = await getMeters();
      const now = Date.now();
      for (const meter of meters) {
        const base = 100 + Math.random() * 200;
        for (let d = 7; d >= 0; d--) {
          const ts = new Date(now - d * 86400000);
          const v = parseFloat((base + Math.random() * 20).toFixed(2));
          const flow = parseFloat((Math.random() * 5).toFixed(2));
          const consumption = parseFloat((flow * 4).toFixed(2));
          await addReading(meter.id, v, flow, consumption, ts.toISOString());
        }
      }

      addLog('Adding bills...');
      const bil = await getBills();
      for (const bill of bil.slice(0, 4)) {
        await addBill(bill.customerId, bill.meterId, parseFloat((50 + Math.random() * 100).toFixed(2)), parseFloat((20 + Math.random() * 30).toFixed(2)), new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
      }

      addLog('Adding sample alerts...');
      await addAlert(1, 'leak_detection', 'critical', 'Leak detected at 123 Main St, District A (WMU-1001)');
      await addAlert(3, 'no_flow', 'high', 'No flow detected at 789 Pine Rd, District B (WMU-1003)');

      addLog('Adding notifications...');
      await addNotification('System Initialized', 'All meters connected and monitoring active', 'dashboard');
      await addNotification('New Alert', 'Leak detected at WMU-1001', 'alerts');

      addLog('Running health check...');
      const checked = await monitorAllMeters();
      addLog('Health check complete. ' + checked.filter(m => m.status !== 'normal').length + ' meter(s) flagged.');

      setStatus('Seeding complete!');
      addLog('Done. ' + meters.length + ' meters, ' + (await getNotifications()).length + ' notifications.');
    } catch (e) {
      addLog('Error: ' + e.message);
      setStatus('Error during seed');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backBtn}>&lt; Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Initialize Data</Text>
        <View style={{width: 50}} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Status</Text>
        <Text style={styles.status}>{status}</Text>
      </View>

      <View style={[styles.card, {maxHeight: 300}]}>
        <Text style={styles.cardTitle}>Logs</Text>
        <FlatList
          data={logs}
          keyExtractor={(item, i) => i + ''}
          renderItem={({item}) => <Text style={styles.log}>{item}</Text>}
          ListEmptyComponent={<Text style={styles.log}>No logs yet</Text>}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  header: {flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb'},
  backBtn: {color: '#2563eb', fontSize: 16},
  headerTitle: {flex: 1, fontSize: 18, fontWeight: 'bold', textAlign: 'center'},
  card: {backgroundColor: '#fff', borderRadius: 8, padding: 16, margin: 16, marginTop: 12, elevation: 2},
  cardTitle: {fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#1f2937'},
  status: {fontSize: 16, fontWeight: '600'},
  log: {fontSize: 12, fontFamily: 'monospace', paddingVertical: 1, color: '#1f2937'},
});

export default SeedDataScreen;
