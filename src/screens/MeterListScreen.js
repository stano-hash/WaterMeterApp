import React, {useState} from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput} from 'react-native';
import {getMeters, addMeter} from '../database/Database';

const MeterListScreen = ({navigation}) => {
  const [meters, setMeters] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({meterId: '', serialNumber: '', location: '', customerId: '', lat: '', lng: ''});

  const loadMeters = async () => {
    const data = await getMeters();
    setMeters(data);
  };

  React.useEffect(() => {loadMeters();}, []);

  const handleAdd = async () => {
    if (!form.meterId || !form.location) return Alert.alert('Error', 'Meter ID and Location required');
    await addMeter(form.meterId, form.serialNumber, form.location, form.customerId || 1, parseFloat(form.lat) || 0, parseFloat(form.lng) || 0);
    setModalVisible(false);
    setForm({meterId: '', serialNumber: '', location: '', customerId: '', lat: '', lng: ''});
    loadMeters();
  };

  const getStatusColor = (s) => s === 'normal' ? '#22c55e' : s === 'warning' ? '#f59e0b' : s === 'alert' ? '#ef4444' : '#6b7280';
  const getStatusLabel = (s) => s === 'normal' ? 'Normal' : s === 'warning' ? 'Warning' : s === 'alert' ? 'Alert' : 'Offline';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backBtn}>&lt; Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Meters</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}><Text style={styles.addBtn}>+ Add</Text></TouchableOpacity>
      </View>

      <FlatList
        data={meters}
        keyExtractor={item => item.id + ''}
        renderItem={({item}) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('MeterDetails', {meterId: item.id})}>
            <View style={[styles.statusDot, {backgroundColor: getStatusColor(item.status)}]} />
            <View style={{flex: 1}}>
              <Text style={styles.meterId}>{item.meterId}</Text>
              <Text style={styles.meterLoc}>{item.location} {item.customerName ? '• ' + item.customerName : ''}</Text>
            </View>
            <View style={[styles.badge, {backgroundColor: getStatusColor(item.status) + '20'}]}>
              <Text style={[styles.badgeText, {color: getStatusColor(item.status)}]}>{getStatusLabel(item.status)}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No meters found.</Text>}
      />

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Meter</Text>
            <TextInput style={styles.input} placeholder="Meter ID *" value={form.meterId} onChangeText={t => setForm({...form, meterId: t})} />
            <TextInput style={styles.input} placeholder="Serial Number" value={form.serialNumber} onChangeText={t => setForm({...form, serialNumber: t})} />
            <TextInput style={styles.input} placeholder="Location *" value={form.location} onChangeText={t => setForm({...form, location: t})} />
            <TextInput style={styles.input} placeholder="Customer ID" value={form.customerId} onChangeText={t => setForm({...form, customerId: t})} />
            <TextInput style={styles.input} placeholder="Latitude" value={form.lat} onChangeText={t => setForm({...form, lat: t})} keyboardType="numeric"/>
            <TextInput style={styles.input} placeholder="Longitude" value={form.lng} onChangeText={t => setForm({...form, lng: t})} keyboardType="numeric"/>
            <View style={{flexDirection: 'row', gap: 10}}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setModalVisible(false)}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={handleAdd}><Text style={styles.saveBtnText}>Save</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb'},
  backBtn: {color: '#2563eb', fontSize: 16},
  headerTitle: {fontSize: 18, fontWeight: 'bold'},
  addBtn: {color: '#2563eb', fontSize: 16, fontWeight: '600'},
  card: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, marginHorizontal: 16, marginVertical: 6, borderRadius: 8, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2},
  statusDot: {width: 12, height: 12, borderRadius: 6, marginRight: 12},
  meterId: {fontSize: 16, fontWeight: '600', color: '#1f2937'},
  meterLoc: {fontSize: 13, color: '#6b7280', marginTop: 2},
  badge: {paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12},
  badgeText: {fontSize: 12, fontWeight: '600'},
  emptyText: {textAlign: 'center', color: '#9ca3af', marginTop: 40, fontStyle: 'italic'},
  modalBg: {flex: 1, backgroundColor: '#00000099', justifyContent: 'center', padding: 20},
  modal: {backgroundColor: '#fff', borderRadius: 12, padding: 20},
  modalTitle: {fontSize: 18, fontWeight: 'bold', marginBottom: 16},
  input: {borderWidth: 1, borderColor: '#d1d5db', padding: 10, borderRadius: 6, marginBottom: 10, fontSize: 14},
  modalBtn: {flex: 1, paddingVertical: 12, borderRadius: 6, alignItems: 'center'},
  cancelBtn: {backgroundColor: '#f3f4f6'},
  saveBtn: {backgroundColor: '#2563eb'},
  cancelBtnText: {color: '#6b7280', fontWeight: '600'},
  saveBtnText: {color: '#fff', fontWeight: '600'},
});

export default MeterListScreen;
