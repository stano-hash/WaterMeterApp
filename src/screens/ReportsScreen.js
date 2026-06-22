import React, {useState, useEffect} from 'react';
import {View, Text, Button, Alert} from 'react-native';
import {LineChart} from 'react-native-chart-kit';
import {Dimensions} from 'react-native';
import ReadingForm from '../components/ReadingForm';
import {getReadings, addReading, updateReading, deleteReading, getMeters} from '../database/Database';

const screenWidth = Dimensions.get('window').width;

const ReportsScreen = ({navigation}) => {
  const [readings, setReadings] = useState([]);
  const [editingReading, setEditingReading] = useState(null);
  const [meters, setMeters] = useState([]);

  const loadReadings = async () => {
    const data = await getReadings();
    setReadings(data);
  };

  const loadMeters = async () => {
    const data = await getMeters();
    setMeters(data);
  };

  useEffect(() => {
    loadReadings();
    loadMeters();
  }, []);

  const handleAdd = async (value, date) => {
    const meter = meters[0];
    if (!meter) return Alert.alert('Info', 'Please add a meter first');
    const flow = parseFloat((Math.random() * 5).toFixed(2));
    const consumption = parseFloat((flow * 4).toFixed(2));
    await addReading(meter.id, value, flow, consumption, date || new Date().toISOString());
    loadReadings();
    setEditingReading(null);
  };

  const handleUpdate = async (id, value, date) => {
    await updateReading(id, value, date);
    loadReadings();
    setEditingReading(null);
  };

  const handleDelete = async (id) => {
    Alert.alert('Delete', 'Delete this reading?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteReading(id);
          loadReadings();
        },
      },
    ]);
  };

  const chartData = {
    labels: readings.slice(-7).map(r => r.date),
    datasets: [
      {
        data: readings.slice(-7).map(r => r.value),
      },
    ],
  };

  const totalConsumption = readings.length > 1 ? readings[readings.length - 1].value - readings[0].value : 0;
  const averageConsumption = readings.length > 0 ? totalConsumption / readings.length : 0;
  const predictedNext = averageConsumption * 1.1;
  const chartWidth = screenWidth - 40;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button title="Back" onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Consumption Reports</Text>
        <View style={{width: 40}} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Add / Edit Reading</Text>
        <ReadingForm
          onSubmit={editingReading ? (value, date) => handleUpdate(editingReading.id, value, date) : handleAdd}
          initialValue={editingReading?.value || ''}
          initialDate={editingReading?.date || ''}
          submitLabel={editingReading ? 'Update Reading' : 'Add Reading'}
          onCancel={editingReading ? () => setEditingReading(null) : null}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Summary Statistics</Text>
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total</Text>
            <Text style={styles.statValue}>{totalConsumption.toFixed(2)} m³</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Average</Text>
            <Text style={styles.statValue}>{averageConsumption.toFixed(2)} m³</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Predicted</Text>
            <Text style={styles.statValue}>{predictedNext.toFixed(2)} m³</Text>
          </View>
        </View>
      </View>

      {readings.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Consumption Trend</Text>
          <LineChart
            data={chartData}
            width={chartWidth}
            height={220}
            chartConfig={{
              backgroundColor: '#e26a00',
              backgroundGradientFrom: '#fb8c00',
              backgroundGradientTo: '#ffa726',
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {borderRadius: 16},
              propsForDots: {r: '6', strokeWidth: '2', stroke: '#ffa726'},
            }}
            bezier
            style={styles.chart}
          />
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>All Readings</Text>
        {readings.length === 0 && <Text style={styles.emptyText}>No readings yet.</Text>}
        {[...readings].reverse().map((item) => (
          <View key={item.id} style={styles.item}>
            <View>
              <Text style={styles.dateText}>{item.date}</Text>
              <Text style={styles.valueText}>{item.value} m³</Text>
            </View>
            <View style={styles.actionButtons}>
              <Button title="Edit" onPress={() => setEditingReading(item)} />
              <Button title="Delete" color="red" onPress={() => handleDelete(item.id)} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  valueText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    padding: 20,
    fontStyle: 'italic',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: 100,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8eaed',
  },
  statLabel: {
    fontSize: 12,
    color: '#5f6368',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a73e8',
    marginTop: 4,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default ReportsScreen;

