import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { Collapsible } from '@/components/ui/collapsible';
import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="map.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Temple Info</ThemedText>
      </ThemedView>
      <ThemedText>Find details about our temples and services.</ThemedText>
      
      <Collapsible title="Location & Directions">
        <ThemedText>
          Main Temple: 123 Temple Road, Spiritual City, 560001.
        </ThemedText>
        <ExternalLink href="https://maps.google.com">
          <ThemedText type="link">Open in Maps</ThemedText>
        </ExternalLink>
      </Collapsible>

      <Collapsible title="Daily Sevas">
        <ThemedText>• Suprabhatam: 6:00 AM</ThemedText>
        <ThemedText>• Abhishekam: 7:30 AM</ThemedText>
        <ThemedText>• Archana: All day</ThemedText>
        <ThemedText>• Sayana Pooja: 8:30 PM</ThemedText>
      </Collapsible>

      <Collapsible title="Special Services">
        <ThemedText>
          We offer special poojas for birthdays, anniversaries, and other occasions. Please contact the temple office for bookings.
        </ThemedText>
      </Collapsible>

      <Collapsible title="Contact Us">
        <ThemedText>Email: info@templealert.com</ThemedText>
        <ThemedText>Phone: +91 98765 43210</ThemedText>
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
