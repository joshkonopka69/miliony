import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { firestoreService } from '../services/firestore';

interface PlaceAnalyticsProps {
  placeId: string;
  placeName: string;
}

interface AnalyticsData {
  totalEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  averageParticipants: number;
  mostPopularActivity: string;
  eventFrequency: { [key: string]: number };
  participantTrend: { [key: string]: number };
}

export default function PlaceAnalytics({ placeId, placeName }: PlaceAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [placeId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Get events for this place
      const events = await firestoreService.getEventsByPlace(placeId);
      
      const now = new Date();
      const upcomingEvents = events.filter(event => new Date(event.time) > now);
      const pastEvents = events.filter(event => new Date(event.time) <= now);
      
      // Calculate analytics
      const totalParticipants = events.reduce((sum, event) => sum + event.participants.length, 0);
      const averageParticipants = events.length > 0 ? totalParticipants / events.length : 0;
      
      // Most popular activity
      const activityCounts: { [key: string]: number } = {};
      events.forEach(event => {
        activityCounts[event.activity] = (activityCounts[event.activity] || 0) + 1;
      });
      const mostPopularActivity = Object.keys(activityCounts).reduce((a, b) => 
        activityCounts[a] > activityCounts[b] ? a : b, 'Unknown'
      );
      
      // Event frequency by day of week
      const eventFrequency: { [key: string]: number } = {};
      events.forEach(event => {
        const day = new Date(event.time).toLocaleDateString('en-US', { weekday: 'long' });
        eventFrequency[day] = (eventFrequency[day] || 0) + 1;
      });
      
      // Participant trend (last 7 days)
      const participantTrend: { [key: string]: number } = {};
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      });
      
      last7Days.forEach(date => {
        const dayEvents = events.filter(event => 
          event.time.startsWith(date)
        );
        participantTrend[date] = dayEvents.reduce((sum, event) => sum + event.participants.length, 0);
      });
      
      setAnalytics({
        totalEvents: events.length,
        upcomingEvents: upcomingEvents.length,
        pastEvents: pastEvents.length,
        averageParticipants: Math.round(averageParticipants),
        mostPopularActivity,
        eventFrequency,
        participantTrend,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStatCard = (title: string, value: string | number, icon: string) => (
    <View key={title} style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const renderFrequencyChart = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const maxFrequency = Math.max(...Object.values(analytics?.eventFrequency || {}));
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Event Frequency by Day</Text>
        <View style={styles.chart}>
          {days.map(day => {
            const frequency = analytics?.eventFrequency[day] || 0;
            const height = maxFrequency > 0 ? (frequency / maxFrequency) * 100 : 0;
            
            return (
              <View key={day} style={styles.chartBar}>
                <View 
                  style={[
                    styles.chartBarFill, 
                    { height: `${height}%` }
                  ]} 
                />
                <Text style={styles.chartBarLabel}>{day.slice(0, 3)}</Text>
                <Text style={styles.chartBarValue}>{frequency}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  if (!analytics) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No analytics data available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Analytics for {placeName}</Text>
      
      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {renderStatCard('Total Events', analytics.totalEvents, '📅')}
        {renderStatCard('Upcoming', analytics.upcomingEvents, '⏰')}
        {renderStatCard('Past Events', analytics.pastEvents, '✅')}
        {renderStatCard('Avg Participants', analytics.averageParticipants, '👥')}
      </View>
      
      {/* Most Popular Activity */}
      <View style={styles.activityCard}>
        <Text style={styles.activityTitle}>Most Popular Activity</Text>
        <Text style={styles.activityValue}>{analytics.mostPopularActivity}</Text>
      </View>
      
      {/* Event Frequency Chart */}
      {renderFrequencyChart()}
      
      {/* Recent Activity */}
      <View style={styles.recentActivity}>
        <Text style={styles.recentActivityTitle}>Recent Activity</Text>
        <Text style={styles.recentActivityText}>
          {analytics.totalEvents > 0 
            ? `${analytics.totalEvents} events have been created at this location`
            : 'No events have been created at this location yet'
          }
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  activityValue: {
    fontSize: 18,
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  chartBarFill: {
    width: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
    marginBottom: 8,
  },
  chartBarLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 2,
  },
  chartBarValue: {
    fontSize: 10,
    color: '#111827',
    fontWeight: '600',
  },
  recentActivity: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recentActivityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  recentActivityText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});


