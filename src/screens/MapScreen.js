import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert} from 'react-native';
import {getMeters} from '../database/Database';

const MapScreen = ({navigation}) => {
  const [meters, setMeters] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {load();}, []);

  const load = async () => {
    const data = await getMeters();
    setMeters(data);
  };

  const filtered = meters.filter(m => {
    const matchSearch = !search || m.meterId.toLowerCase().includes(search.toLowerCase()) || (m.location || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || m.status === filter;
    return matchSearch && matchFilter;
  });

  const getMapColor = (s) => s === 'normal' ? {bg: '#dcfce7', text: '#15803d', dot: '#22c55e', label: 'Normal'} : s === 'warning' ? {bg: '#fef3c7', text: '#92400e', dot: '#f59e0b', label: 'Warning'} : s === 'alert' ? {bg: '#fee2e2', text: '#991b1b', dot: '#ef4444', label: 'Alert'} : {bg: '#f3f4f6', text: '#374151', dot: '#6b7280', label: 'Offline'};

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backBtn}>&lt; Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>GIS Map</Text>
        <View style={{width: 50}} />
      </View>

      <TextInput style={styles.search} placeholder="Search meters..." value={search} onChangeText={setSearch} />

      <View style={styles.filterRow}>
        {['all', 'normal', 'warning', 'alert', 'offline'].map(f => (
          <TouchableOpacity key={f} style={[styles.chip, filter === f ? {backgroundColor: '#2563eb'} : {backgroundColor: '#e5e7eb'}]} onPress={() => setFilter(f)}>
            <View style={[styles.chipDot, {backgroundColor: f === 'all' ? '#fff' : f === 'normal' ? '#22c55e' : f === 'warning' ? '#f59e0b' : f === 'alert' ? '#ef4444' : '#6b7280'}]} />
            <Text style={[styles.chipText, filter === f ? {color: '#fff'} : {color: '#374151'}]}>{f === 'all' ? 'All' : f === 'normal' ? 'Normal' : f === 'warning' ? 'Warning' : f === 'alert' ? 'Alert' : 'Offline'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id + ''}
        renderItem={({item}) => {
          const c = getMapColor(item.status);
          return (
            <TouchableOpacity style={[styles.mapCard, {borderLeftColor: c.dot}]} onPress={() => navigation.navigate('MeterDetails', {meterId: item.id})}>
              <View style={styles.mapCardContent}>
                <View style={[styles.mapCardDot, {backgroundColor: c.dot}]} />
                <View style={{flex: 1}}>
                  <Text style={styles.mapCardId}>{item.meterId}</Text>
                  <Text style={styles.mapCardLoc}>{item.location} {item.customerName ? '• ' + item.customerName : ''}</Text>
                </View>
                <View style={[styles.mapBadge, {backgroundColor: c.bg}]}>
                  <Text style={[styles.mapBadgeText, {color: c.text}]}>{c.label}</Text>
                </View>
              </View>
              <View style={styles.coords}>
                <Text style={styles.coordsText}>📍 {parseFloat(item.lat).toFixed(4)}, {parseFloat(item.lng).toFixed(4)}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>No meters match the filter.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  header: {flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb'},
  backBtn: {color: '#2563eb', fontSize: 16},
  headerTitle: {flex: 1, fontSize: 18, fontWeight: 'bold', textAlign: 'center'},
  search: {backgroundColor: '#fff', marginHorizontal: 16, marginVertical: 8, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db'},
  filterRow: {flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8, gap: 6, flexWrap: 'wrap'},
  chip: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, gap: 4},
  chipDot: {width: 8, height: 8, borderRadius: 4},
  chipText: {fontSize: 12, fontWeight: '600'},
  mapCard: {backgroundColor: '#fff', marginHorizontal: 16, marginVertical: 4, borderRadius: 8, borderLeftWidth: 4, padding: 12, elevation: 1},
  mapCardContent: {flexDirection: 'row', alignItems: 'center'},
  mapCardDot: {width: 12, height: 12, borderRadius: 6, marginRight: 10},
  mapCardId: {fontSize: 15, fontWeight: '600', color: '#1f2937'},
  mapCardLoc: {fontSize: 12, color: '#6b7280', marginTop: 1},
  mapBadge: {paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10},
  mapBadgeText: {fontSize: 11, fontWeight: '600'},
  coords: {marginTop: 8},
  coordsText: {fontSize: 11, color: '#6b7280'},
  emptyText: {textAlign: 'center', color: '#9ca3af', marginTop: 40},
});

export default MapScreen;
