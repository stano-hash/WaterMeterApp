import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView} from 'react-native';
import {getMeterById, getReadingsByMeterId, updateMeterStatus, addAlert} from '../database/Database';
import {checkMeterHealth} from '../services/MeterService';

const MeterDetailsScreen = ({navigation, route}) => {
  const [meter, setMeter] = useState(null);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {load();}, []);

  const load = async () => {
    const m = await getMeterById(route.params.meterId);
    const r = await getReadingsByMeterId(route.params.meterId);
    setMeter(m);
    setReadings(r);
    setLoading(false);
  };

  const handleCheckHealth = async () => {
    if (!meter) return;
    const health = await checkMeterHealth(meter.id);
    const newStatus = health === 'normal' ? 'normal' : health === 'no_flow' ? 'warning' : 'alert';
    await updateMeterStatus(meter.id, newStatus);
    if (health === 'leak') Alert.alert('Alert', 'Leak detected!');
    else if (health === 'no_flow') Alert.alert('Alert', 'No flow detected!');
    else Alert.alert('OK', 'Meter health: Normal');
    load();
  };

  const getStatusColor = (s) => s === 'normal' ? '#22c55e' : s === 'warning' ? '#f59e0b' : s === 'alert' ? '#ef4444' : '#6b7280';
  const getStatusLabel = (s) => s === 'normal' ? 'Normal' : s === 'warning' ? 'Warning' : s === 'alert' ? 'Alert' : 'Offline';

  if (loading) return <View style={styles.container}><Text>Loading...</Text></View>;

  const totalCons = readings.length > 0 ? parseFloat(readings[readings.length - 1].value || 0) : 0;
  const avgFlow = readings.length > 0 ? (readings.reduce((s, r) => s + (parseFloat(r.flowRate) || 0), 0) / readings.length).toFixed(2) : '0';
  const lastUpdate = readings.length > 0 ? readings[readings.length - 1].timestamp : 'No data';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backBtn}>&lt; Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Meter Details</Text>
        <View style={{width: 50}} />
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <View style={[styles.statusDot, {backgroundColor: getStatusColor(meter.status)}]} />
          <View>
            <Text style={styles.meterId}>{meter.meterId}</Text>
            <Text style={[styles.statusLabel, {color: getStatusColor(meter.status)}]}>{getStatusLabel(meter.status)}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Location</Text><Text style={styles.infoVal}>{meter.location}</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Serial No.</Text><Text style={styles.infoVal}>{meter.serialNumber || 'N/A'}</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Customer</Text><Text style={styles.infoVal}>{meter.customerName || 'N/A'}</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Status</Text><Text style={[styles.infoVal, {color: getStatusColor(meter.status)}]}>{getStatusLabel(meter.status)}</Text></View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Live Status</Text>
        <View style={styles.statGrid}>
          <View style={styles.statBox}><Text style={styles.statNum}>{totalCons.toFixed(2)}</Text><Text style={styles.statLbl}>m³ total</Text></View>
          <View style={styles.statBox}><Text style={styles.statNum}>{avgFlow}</Text><Text style={styles.statLbl}>m³/hr avg flow</Text></View>
          <View style={styles.statBox}><Text style={styles.statNum}>{readings.length}</Text><Text style={styles.statLbl}>readings</Text></View>
          <View style={styles.statBox}><Text style={{fontSize: 10}}>{new Date(lastUpdate).toLocaleString()}</Text><Text style={styles.statLbl}>last update</Text></View>
        </View>
        <TouchableOpacity style={styles.healthBtn} onPress={handleCheckHealth}><Text style={styles.healthBtnText}>Run Health Check</Text></TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Readings</Text>
        {readings.length === 0 ? <Text style={styles.emptyText}>No readings</Text> : readings.slice(-10).reverse().map((r, i) => (
          <View key={i} style={[styles.rdgItem, i % 2 === 0 ? {backgroundColor: '#f9fafb'} : {}]}>
            <Text style={styles.rdgDate}>{r.timestamp ? new Date(r.timestamp).toLocaleString() : r.date || 'N/A'}</Text>
            <Text style={styles.rdgVal}>{parseFloat(r.value).toFixed(2)} m³</Text>
            <Text style={styles.rdgFlow}>Flow: {(parseFloat(r.flowRate) || 0).toFixed(2)} m³/hr</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  header: {flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb'},
  backBtn: {color: '#2563eb', fontSize: 16},
  headerTitle: {flex: 1, fontSize: 18, fontWeight: 'bold', textAlign: 'center'},
  card: {backgroundColor: '#fff', borderRadius: 8, padding: 16, margin: 16, marginTop: 12, elevation: 2, shadowOpacity: 0.1, shadowRadius: 2},
  cardTitle: {fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#1f2937'},
  row: {flexDirection: 'row', alignItems: 'center'},
  statusDot: {width: 14, height: 14, borderRadius: 7, marginRight: 12},
  meterId: {fontSize: 20, fontWeight: 'bold'},
  statusLabel: {fontSize: 14, fontWeight: '600', marginTop: 2},
  divider: {height: 1, backgroundColor: '#e5e7eb', marginVertical: 12},
  infoRow: {flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4},
  infoLabel: {color: '#6b7280', fontSize: 14},
  infoVal: {color: '#1f2937', fontWeight: '500'},
  statGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  statBox: {flex: 1, minWidth: 80, backgroundColor: '#f0f9ff', padding: 12, borderRadius: 8, alignItems: 'center'},
  statNum: {fontSize: 18, fontWeight: 'bold', color: '#2563eb'},
  statLbl: {fontSize: 11, color: '#6b7280'},
  healthBtn: {marginTop: 12, backgroundColor: '#2563eb', padding: 12, borderRadius: 8, alignItems: 'center'},
  healthBtnText: {color: '#fff', fontWeight: '600'},
  rdgItem: {flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderRadius: 4, marginBottom: 4, alignItems: 'center'},
  rdgDate: {fontSize: 12, color: '#6b7280'},
  rdgVal: {fontSize: 14, fontWeight: '600'},
  rdgFlow: {fontSize: 12, color: '#6b7280'},
  emptyText: {textAlign: 'center', color: '#9ca3af', padding: 8, fontStyle: 'italic'},
});

export default MeterDetailsScreen;
