import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity, Alert} from 'react-native';
import {getBills, getUnpaidBills, payBill} from '../database/Database';
import {getReadingsByMeterId} from '../database/Database';

const BillsScreen = ({navigation}) => {
  const [bills, setBills] = useState([]);
  const [tab, setTab] = useState('all');

  const load = async () => setBills(await getBills());
  useEffect(() => {load();}, []);

  const handlePay = async (id) => {
    await payBill(id);
    Alert.alert('Success', 'Bill paid successfully');
    load();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backBtn}>&lt; Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Bills</Text>
        <View style={{width: 50}} />
      </View>

      <View style={styles.tabRow}>
        {['all', 'unpaid', 'paid'].map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t ? {backgroundColor: '#2563eb'} : {backgroundColor: '#e5e7eb'}]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t ? {color: '#fff'} : {color: '#374151'}]}>{t === 'all' ? 'All' : t === 'unpaid' ? 'Unpaid' : 'Paid'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={tab === 'all' ? bills : tab === 'unpaid' ? bills.filter(b => b.paid === 0) : bills.filter(b => b.paid === 1)}
        keyExtractor={item => item.id + ''}
        renderItem={({item}) => {
          const dueDate = new Date(item.dueDate);
          const isOverdue = !item.paid && dueDate < new Date();
          return (
            <View style={[styles.card, isOverdue && {borderLeftColor: '#ef4444', borderLeftWidth: 4}]}>
              <View style={styles.cardRow}>
                <View>
                  <Text style={styles.cardId}>#{item.id}</Text>
                  <Text style={styles.cardCust}>{item.customerName || 'Customer'} • {item.meterId}</Text>
                  <Text style={styles.cardDue}>Due: {dueDate.toLocaleDateString()} {isOverdue && <Text style={{color: '#ef4444'}}>• OVERDUE</Text>}</Text>
                </View>
                <View style={{alignItems: 'flex-end'}}>
                  <Text style={styles.amount}>${parseFloat(item.amount).toFixed(2)}</Text>
                  <Text style={[styles.paidBadge, {backgroundColor: item.paid ? '#dcfce7' : '#fef3c7'}, {color: item.paid ? '#15803d' : '#92400e'}]}>{item.paid ? 'Paid' : 'Unpaid'}</Text>
                </View>
              </View>
              {!item.paid && <TouchableOpacity style={styles.payBtn} onPress={() => handlePay(item.id)}><Text style={styles.payBtnText}>Pay Now</Text></TouchableOpacity>}
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>No bills found.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  header: {flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb'},
  backBtn: {color: '#2563eb', fontSize: 16},
  headerTitle: {flex: 1, fontSize: 18, fontWeight: 'bold', textAlign: 'center'},
  tabRow: {flexDirection: 'row', padding: 10, gap: 8},
  tab: {flex: 1, paddingVertical: 8, borderRadius: 6, alignItems: 'center'},
  tabText: {fontWeight: '600', fontSize: 13},
  card: {backgroundColor: '#fff', marginHorizontal: 16, marginVertical: 4, borderRadius: 8, padding: 14, elevation: 1},
  cardRow: {flexDirection: 'row', justifyContent: 'space-between'},
  cardId: {fontSize: 14, fontWeight: '600', color: '#2563eb'},
  cardCust: {fontSize: 13, color: '#6b7280', marginTop: 1},
  cardDue: {fontSize: 12, color: '#6b7280', marginTop: 4},
  amount: {fontSize: 18, fontWeight: 'bold'},
  paidBadge: {paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginTop: 4, fontSize: 11, fontWeight: '600'},
  payBtn: {marginTop: 10, backgroundColor: '#2563eb', paddingVertical: 8, borderRadius: 6, alignItems: 'center'},
  payBtnText: {color: '#fff', fontWeight: '600'},
  emptyText: {textAlign: 'center', color: '#9ca3af', marginTop: 40, fontStyle: 'italic'},
});

export default BillsScreen;
