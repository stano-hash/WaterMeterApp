import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert} from 'react-native';
import {getMeters, getAlerts, getReadings, getBills, addReading, addNotification} from '../database/Database';
import {LineChart} from 'react-native-chart-kit';
import {Dimensions} from 'react-native';
import ReadingForm from '../components/ReadingForm';

const screenWidth = Dimensions.get('window').width;

const DashboardScreen = ({navigation}) => {
  const [readings, setReadings] = useState([]);
  const [meters, setMeters] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [bills, setBills] = useState([]);

  useEffect(() => {load();}, []);

  const load = async () => {
    const r = await getReadings();
    const m = await getMeters();
    const a = await getAlerts();
    const b = await getBills();
    setReadings(r);
    setMeters(m);
    setAlerts(a);
    setBills(b);
  };

  const handleAdd = async (value, date) => {
    const meter = meters[0];
    if (!meter) return Alert.alert('Info', 'Please add meters first');
    const flow = parseFloat((Math.random() * 5).toFixed(2));
    const consumption = parseFloat((flow * 4 + Math.random()).toFixed(2));
    await addReading(meter.id, value, flow, consumption, date || new Date().toISOString());
    await addNotification('New Reading', `Meter ${meter.meterId} recorded: ${value} m³`, 'dashboard');
    load();
  };

  const totalConsumption = readings.length > 0 ? readings[readings.length - 1].value : 0;
  const waterBilled = bills.reduce((s, b) => s + (parseFloat(b.amount || 0)), 0);
  const waterLoss = Math.max(0, totalConsumption - waterBilled);
  const nrw = totalConsumption > 0 ? ((waterLoss / totalConsumption) * 100) : 0;
  const alertCount = alerts.filter(a => a.status !== 'resolved').length;

  const chartData = {
    labels: readings.slice(-7).map(r => r.timestamp ? new Date(r.timestamp).toLocaleDateString() : (r.date || 'N/A')),
    datasets: [{data: readings.slice(-7).map(r => parseFloat(r.value || 0))}],
  };

  const menuCards = [
    {title: 'Meters', icon: '[M]', color: '#eff6ff', action: () => navigation.navigate('MeterList')},
    {title: 'Live Monitor', icon: '[L]', color: '#fef3c7', action: () => {const m = meters[0]; if (m) navigation.navigate('MeterDetails', {meterId: m.id}); else Alert.alert('Info', 'Add meters first');}},
    {title: 'Alerts', icon: '[!]', color: '#fee2e2', action: () => navigation.navigate('Alerts'), badge: alertCount > 0 ? alertCount : 0},
    {title: 'GIS Map', icon: '[#]', color: '#f3e8ff', action: () => navigation.navigate('Map')},
    {title: 'Consumer Portal', icon: '[C]', color: '#ecfdf5', action: () => navigation.navigate('ConsumerPortal')},
    {title: 'Bills', icon: '[$]', color: '#fff7ed', action: () => navigation.navigate('Bills')},
    {title: 'Reports', icon: '[R]', color: '#f0fdf4', action: () => navigation.navigate('Reports')},
    {title: 'Settings', icon: '[S]', color: '#f9fafb', action: () => navigation.navigate('Settings')},
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <TouchableOpacity onPress={load}><Text style={styles.refresh}>[R]</Text></TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
        <View style={[styles.statCard, {backgroundColor: '#eff6ff'}]}>
          <Text style={styles.statIcon}>[W]</Text>
          <Text style={styles.statNum}>{totalConsumption.toFixed(1)}</Text>
          <Text style={styles.statLbl}>Total m3</Text>
        </View>
        <View style={[styles.statCard, {backgroundColor: '#fef3c7'}]}>
          <Text style={styles.statIcon}>[M]</Text>
          <Text style={styles.statNum}>{meters.length}</Text>
          <Text style={styles.statLbl}>Meters</Text>
        </View>
        <View style={[styles.statCard, alertCount > 0 ? {backgroundColor: '#fee2e2'} : {backgroundColor: '#f3f4f6'}]}>
          <Text style={styles.statIcon}>[A]</Text>
          <Text style={[styles.statNum, alertCount > 0 && {color: '#ef4444'}]}>{alertCount}</Text>
          <Text style={styles.statLbl}>Alerts</Text>
        </View>
        <View style={[styles.statCard, nrw > 30 ? {backgroundColor: '#fee2e2'} : {backgroundColor: '#f0fdf4'}]}>
          <Text style={styles.statIcon}>[N]</Text>
          <Text style={[styles.statNum, nrw > 30 && {color: '#ef4444'}]}>{nrw.toFixed(1)}%</Text>
          <Text style={styles.statLbl}>NRW</Text>
        </View>
        <View style={[styles.statCard, {backgroundColor: '#fef2f2'}]}>
          <Text style={styles.statIcon}>[L]</Text>
          <Text style={styles.statNum}>{waterLoss.toFixed(1)}</Text>
          <Text style={styles.statLbl}>Water Loss</Text>
        </View>
      </ScrollView>

      <View style={styles.card}>
        <View style={styles.cardHeader}><Text style={styles.cardTitle}>Consumption Trend (Last 7)</Text></View>
        {readings.length > 0 ? (
          <LineChart
            data={chartData}
            width={screenWidth - 64}
            height={180}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 1,
              color: () => '#2563eb',
              labelColor: () => '#6b7280',
              propsForDots: {r: '4', strokeWidth: '2', stroke: '#2563eb'},
            }}
            bezier
            style={styles.chart}
          />
        ) : <Text style={styles.emptyText}>No readings yet. Use Reports tab to add data.</Text>}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>New Reading</Text>
        <ReadingForm onSubmit={handleAdd} submitLabel="Add Reading" />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <View style={styles.grid}>
          {menuCards.map((item, idx) => (
            <TouchableOpacity key={idx} style={[styles.gridCard, {backgroundColor: item.color}]} onPress={item.action}>
              <Text style={styles.gridIcon}>{item.icon}</Text>
              <Text style={styles.gridLabel}>{item.title}</Text>
              {item.badge > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{item.badge}</Text></View>}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff'},
  headerTitle: {fontSize: 24, fontWeight: 'bold', color: '#1f2937'},
  refresh: {fontSize: 22},
  statsScroll: {paddingHorizontal: 10, paddingVertical: 8},
  statCard: {minWidth: 100, padding: 14, borderRadius: 12, alignItems: 'center', marginRight: 10},
  statIcon: {fontSize: 20},
  statNum: {fontSize: 22, fontWeight: 'bold', color: '#2563eb'},
  statLbl: {fontSize: 11, color: '#6b7280', marginTop: 2},
  card: {backgroundColor: '#fff', borderRadius: 10, padding: 16, margin: 12, elevation: 2, shadowOpacity: 0.1, shadowRadius: 3},
  cardHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  cardTitle: {fontSize: 16, fontWeight: '600', marginBottom: 10},
  chart: {marginVertical: 4, borderRadius: 12},
  grid: {flexDirection: 'row', flexWrap: 'wrap'},
  gridCard: {width: '46%', padding: 14, borderRadius: 10, marginRight: '4%', marginBottom: 8, alignItems: 'center', position: 'relative'},
  gridIcon: {fontSize: 26, marginBottom: 6},
  gridLabel: {fontWeight: '600'},
  badge: {position: 'absolute', top: 4, right: 4, backgroundColor: '#ef4444', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center'},
  badgeText: {color: '#fff', fontSize: 10, fontWeight: 'bold'},
  emptyText: {textAlign: 'center', color: '#9ca3af', padding: 20, fontStyle: 'italic'},
});

export default DashboardScreen;
