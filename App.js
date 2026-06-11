import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {isAuthenticated} from './src/services/AuthService';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AddReadingScreen from './src/screens/AddReadingScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import MeterListScreen from './src/screens/MeterListScreen';
import MeterDetailsScreen from './src/screens/MeterDetailsScreen';
import AlertsScreen from './src/screens/AlertsScreen';
import MapScreen from './src/screens/MapScreen';
import ConsumerPortalScreen from './src/screens/ConsumerPortalScreen';
import BillsScreen from './src/screens/BillsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SeedDataScreen from './src/screens/SeedDataScreen';

const Stack = createStackNavigator();

const App = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAuth, setIsAuth] = React.useState(false);

  React.useEffect(() => {
    isAuthenticated().then(auth => {
      setIsAuth(auth);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isAuth ? 'Dashboard' : 'Login'}>
        <Stack.Screen name="Login" component={LoginScreen} options={{headerShown: false}} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="AddReading" component={AddReadingScreen} />
        <Stack.Screen name="Reports" component={ReportsScreen} />
        <Stack.Screen name="MeterList" component={MeterListScreen} />
        <Stack.Screen name="MeterDetails" component={MeterDetailsScreen} />
        <Stack.Screen name="Alerts" component={AlertsScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="ConsumerPortal" component={ConsumerPortalScreen} />
        <Stack.Screen name="Bills" component={BillsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="SeedData" component={SeedDataScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
