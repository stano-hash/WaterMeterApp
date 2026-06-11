import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {getCurrentUser, logoutUser} from '../services/AuthService';

const SettingsScreen = ({navigation}) => {
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    getCurrentUser().then(u => setUser(u));
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logoutUser();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backBtn}>&lt; Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{width: 50}} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Username</Text>
          <Text style={styles.value}>{user?.username || 'N/A'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Role</Text>
          <Text style={styles.value}>{user?.role?.toUpperCase() || 'USER'}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>App Info</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Version</Text>
          <Text style={styles.value}>1.0.0</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Build</Text>
          <Text style={styles.value}>2025.06.01</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Platform</Text>
          <Text style={styles.value}>Android / iOS</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Device</Text>
        <View style={styles.row}>
          <Text style={styles.label}>IoT Protocol</Text>
          <Text style={styles.value}>MQTT / LoRaWAN / NB-IoT</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Comm</Text>
          <Text style={styles.value}>4G / GSM / LoRa</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  header: {flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb'},
  backBtn: {color: '#2563eb', fontSize: 16},
  headerTitle: {flex: 1, fontSize: 18, fontWeight: 'bold', textAlign: 'center'},
  card: {backgroundColor: '#fff', borderRadius: 8, padding: 16, margin: 16, marginTop: 12, elevation: 2},
  cardTitle: {fontSize: 16, fontWeight: '600', marginBottom: 10, color: '#1f2937'},
  row: {flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f3f4f6'},
  label: {color: '#6b7280', fontSize: 14},
  value: {color: '#1f2937', fontWeight: '500'},
  logoutBtn: {backgroundColor: '#ef4444', marginHorizontal: 16, marginVertical: 20, paddingVertical: 14, borderRadius: 8, alignItems: 'center'},
  logoutText: {color: '#fff', fontSize: 16, fontWeight: '600'},
});

export default SettingsScreen;
