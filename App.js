import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { AuthProvider, useAuth } from './context/AuthContext';
import { WorkoutProvider } from './context/WorkoutContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ActivityScreen from './screens/ActivityScreen';
import FriendsScreen from './screens/FriendsScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import GroupDetailScreen from './screens/GroupDetailScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: theme.card, borderTopColor: theme.border, height: 60, paddingBottom: 8 },
        tabBarActiveTintColor: theme.accentLight,
        tabBarInactiveTintColor: theme.subtext,
      }}
    >
      <Tab.Screen name="Settings" component={SettingsScreen} options={{
        tabBarLabel: 'Settings',
        tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />,
      }} />
      <Tab.Screen name="Activity" component={ActivityScreen} options={{
        tabBarLabel: 'Activity',
        tabBarIcon: ({ color, size }) => <Ionicons name="barbell-outline" size={size} color={color} />,
      }} />
      <Tab.Screen name="Home" component={HomeScreen} options={{
        tabBarLabel: '',
        tabBarIcon: () => (
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: theme.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 20, elevation: 8 }}>
            <Ionicons name="home" size={24} color="#ffffff" />
          </View>
        ),
      }} />
      <Tab.Screen name="Friends" component={FriendsScreen} options={{
        tabBarLabel: 'Friends',
        tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />,
      }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
      }} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={theme.accentLight} size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WorkoutProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </WorkoutProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
