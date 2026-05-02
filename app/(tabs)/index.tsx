import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#FF9933', dark: '#800000' }}
      headerImage={
        <ThemedView style={styles.headerImageContainer}>
          <ThemedText style={styles.headerEmoji}>🛕</ThemedText>
        </ThemedView>
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Temple Alerts</ThemedText>
        <HelloWave />
      </ThemedView>
      
      <ThemedView style={styles.alertCard}>
        <ThemedText type="subtitle" style={{ color: '#800000' }}>Active Alert: Mahasivaratri</ThemedText>
        <ThemedText>Special Darshan timings are now active. Expected wait time: 45 mins.</ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Upcoming Events</ThemedText>
        <ThemedView style={styles.eventItem}>
          <ThemedText type="defaultSemiBold">Pradosha Pooja</ThemedText>
          <ThemedText>Tomorrow, 5:30 PM - 7:00 PM</ThemedText>
        </ThemedView>
        <ThemedView style={styles.eventItem}>
          <ThemedText type="defaultSemiBold">Annadhanam</ThemedText>
          <ThemedText>Sunday, 12:30 PM</ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Temple Timings</ThemedText>
        <ThemedText>Morning: 6:00 AM - 12:30 PM</ThemedText>
        <ThemedText>Evening: 4:30 PM - 9:00 PM</ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 24,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerImageContainer: {
    height: 200,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF9933',
  },
  headerEmoji: {
    fontSize: 80,
  },
  alertCard: {
    backgroundColor: '#FFF0E0',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 5,
    borderLeftColor: '#800000',
    marginBottom: 24,
  },
  eventItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
