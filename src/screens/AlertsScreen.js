import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity, Alert} from 'react-native';
import {getAlerts, updateAlertStatus} from '../database/Database';

const AlertsScreen = ({navigation}) => {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    const data = await getAlerts();
    setAlerts(data);
  };
  useEffect(() => {load();}, []);

  const resolved = async (id) => {
    await updateAlertStatus(id, 'resolved');
    load();
  };

  const filtered = filter === 'all' ? alerts :
    filter === 'open' ? alerts.filter(a => a.status === 'open') :
    alerts.filter(a => a.type === filter);

  const getSevColor = (s) => s === 'critical' ? '#ef4444' : s === 'high' ? '#f59e0b' : s === 'medium' ? '#3b82f6' : '#6b7280';
  const getSevLabel = (s) => s === 'critical' ? 'Critical' : s === 'high' ? 'High' : s === 'medium' ? 'Medium' : 'Low';
  const getTypeIcon = (t) => t === 'leak_detection' ? '💧 Leak' : t === 'low_flow' ? '📉 Low Flow' : t === 'high_flow' ? '📈 High Flow' : t === 'no_flow' ? '⛔ No Flow' : t === 'offline' ? '📡 Offline' : '⚠️ ' + t;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backBtn}>&lt; Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Alerts</Text>
        <View style={{width: 50}} />
      </View>

      <View style={styles.filterRow}>
        {['all', 'open', 'leak_detection', 'no_flow', 'low_flow', 'offline'].map(f => (
          <TouchableOpacity key={f} style={[styles.filterChip, filter === f ? {backgroundColor: '#2563eb'} : {backgroundColor: '#e5e7eb'}]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterChipText, filter === f ? {color: '#fff'} : {color: '#4b5563'}]}>{f === 'all' ? 'All' : f === 'leak_detection' ? 'Leak' : f === 'no_flow' ? 'No Flow' : f === 'low_flow' ? 'Low Flow' : f === 'offline' ? 'Offline' : 'Open'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id + ''}
        renderItem={({item}) => {
          const isOpen = item.status === 'open';
          return (
            <View style={[styles.card, !isOpen && {opacity: 0.7}]}>
              <View style={[styles.sevBadge, {backgroundColor: getSevColor(item.severity) + '20', borderLeftColor: getSevColor(item.severity)}]}>
                <Text style={[styles.sevText, {color: getSevColor(item.severity)}]}>{getSevLabel(item.severity).toUpperCase()}</Text>
              </View>
              <Text style={styles.cardTitle}>{getTypeIcon(item.type)}</Text>
              <Text style={styles.cardBody}>{item.message}</Text>
              <Text style={styles.cardMeta}>Meter: {item.meterId} • {new Date(item.timestamp).toLocaleString()}</Text>
              <View style={[styles.statusRow, {backgroundColor: isOpen ? '#fef2f2' : '#f0fdf4'}]}>
                <Text style={[styles.statusLabel, {color: isOpen ? '#ef4444' : '#22c55e'}]}>{isOpen ? '● Open' : '● Resolved'}</Text>
                {isOpen && <TouchableOpacity style={styles.resolveBtn} onPress={() => resolved(item.id)}><Text style={styles.resolveBtnText}>Resolve</Text></TouchableOpacity>}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>No alerts found.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  header: {flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb'},
  backBtn: {color: '#2563eb', fontSize: 16},
  headerTitle: {flex: 1, fontSize: 18, fontWeight: 'bold', textAlign: 'center'},
  filterRow: {flexDirection: 'row', flexWrap: 'wrap', padding: 10, gap: 6},
  filterChip: {paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16},
  filterChipText: {fontSize: 12, fontWeight: '600'},
  card: {backgroundColor: '#fff', marginHorizontal: 16, marginVertical: 4, borderRadius: 8, padding: 14, elevation: 1},
  sevBadge: {alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginBottom: 6, borderLeftWidth: 3},
  sevText: {fontSize: 10, fontWeight: 'bold'},
  cardTitle: {fontSize: 15, fontWeight: '600', color: '#1f2937'},
  cardBody: {fontSize: 14, color: '#374151', marginTop: 4},
  cardMeta: {fontSize: 12, color: '#6b7280', marginTop: 6},
  statusRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, padding: 6, borderRadius: 4},
  statusLabel: {fontSize: 12, fontWeight: '600'},
  resolveBtn: {backgroundColor: '#22c55e', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4},
  resolveBtnText: {color: '#fff', fontSize: 12, fontWeight: '600'},
  emptyText: {textAlign: 'center', color: '#9ca3af', marginTop: 40, fontStyle: 'italic'},
});

export default AlertsScreen;
