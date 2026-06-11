import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView} from 'react-native';
import {getNotifications, markNotificationRead} from '../database/Database';
import {getCurrentUser} from '../services/AuthService';

const ConsumerPortalScreen = ({navigation}) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    getCurrentUser().then(u => setUser(u));
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backBtn}>&lt; Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Consumer Portal</Text>
        <View style={{width: 50}} />
      </View>

      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeText}>Welcome{user ? ', ' + user.username : ''}!</Text>
        <Text style={styles.welcomeSub}>Access your water usage, bills and more</Text>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity style={[styles.gridCard, {backgroundColor: '#eff6ff'}]} onPress={() => navigation.navigate('Reports')}>
          <Text style={[styles.gridEmoji]}>📊</Text>
          <Text style={styles.gridLabel}>Consumption</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.gridCard, {backgroundColor: '#fefce8'}]} onPress={() => navigation.navigate('Bills')}>
          <Text style={styles.gridEmoji}>💰</Text>
          <Text style={styles.gridLabel}>Pay Bills</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.gridCard, {backgroundColor: '#fee2e2'}]} onPress={() => navigation.navigate('Alerts')}>
          <Text style={styles.gridEmoji}>🔔</Text>
          <Text style={styles.gridLabel}>Alerts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.gridCard, {backgroundColor: '#f3e8ff'}]} onPress={() => navigation.navigate('Map')}>
          <Text style={styles.gridEmoji}>🗺️</Text>
          <Text style={styles.gridLabel}>Map View</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  header: {flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb'},
  backBtn: {color: '#2563eb', fontSize: 16},
  headerTitle: {flex: 1, fontSize: 18, fontWeight: 'bold', textAlign: 'center'},
  welcomeCard: {backgroundColor: '#2563eb', margin: 16, padding: 20, borderRadius: 12},
  welcomeText: {color: '#fff', fontSize: 22, fontWeight: 'bold'},
  welcomeSub: {color: '#bfdbfe', fontSize: 14, marginTop: 4},
  grid: {flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 18, paddingBottom: 20},
  gridCard: {width: '45%', borderRadius: 12, padding: 20, marginRight: '5%', marginBottom: 12, alignItems: 'center'},
  gridEmoji: {fontSize: 30, marginBottom: 8},
  gridLabel: {fontWeight: '600', color: '#1f2937'},
});

export default ConsumerPortalScreen;
