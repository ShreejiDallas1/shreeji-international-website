'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiShield, 
  FiAlertTriangle, 
  FiUser, 
  FiLock, 
  FiActivity,
  FiEye,
  FiRefreshCw
} from 'react-icons/fi';
import { collection, query, orderBy, limit, getDocs, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Button from './Button';

interface SecurityEvent {
  id: string;
  eventType: string;
  email?: string;
  timestamp: Date;
  ip?: string;
  error?: string;
  uid?: string;
}

interface SecurityStats {
  totalLogins: number;
  failedLogins: number;
  passwordResets: number;
  registrations: number;
  suspiciousActivity: number;
}

export default function SecurityDashboard() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [stats, setStats] = useState<SecurityStats>({
    totalLogins: 0,
    failedLogins: 0,
    passwordResets: 0,
    registrations: 0,
    suspiciousActivity: 0
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    loadSecurityData();
  }, [timeRange]);

  const loadSecurityData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const timeRanges = {
        '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
        '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      };

      const startTime = timeRanges[timeRange];

      // Load recent security events
      const eventsQuery = query(
        collection(db, 'security_logs'),
        where('timestamp', '>=', startTime),
        orderBy('timestamp', 'desc'),
        limit(50)
      );

      const eventsSnapshot = await getDocs(eventsQuery);
      const eventsData = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      })) as SecurityEvent[];

      setEvents(eventsData);

      // Calculate stats
      const newStats: SecurityStats = {
        totalLogins: eventsData.filter(e => e.eventType === 'login_success').length,
        failedLogins: eventsData.filter(e => e.eventType === 'login_failed').length,
        passwordResets: eventsData.filter(e => e.eventType.includes('password_reset')).length,
        registrations: eventsData.filter(e => e.eventType === 'registration_success').length,
        suspiciousActivity: eventsData.filter(e => 
          e.eventType === 'login_failed' || 
          e.eventType.includes('suspicious')
        ).length
      };

      setStats(newStats);
    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType: string) => {
    if (eventType.includes('login')) return <FiUser className="w-4 h-4" />;
    if (eventType.includes('password')) return <FiLock className="w-4 h-4" />;
    if (eventType.includes('registration')) return <FiUser className="w-4 h-4" />;
    return <FiActivity className="w-4 h-4" />;
  };

  const getEventColor = (eventType: string) => {
    if (eventType.includes('failed') || eventType.includes('suspicious')) return 'text-red-400';
    if (eventType.includes('success')) return 'text-green-400';
    return 'text-blue-400';
  };

  const formatEventType = (eventType: string) => {
    return eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FiShield className="w-8 h-8 text-lime-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Security Dashboard</h1>
            <p className="text-gray-400">Monitor authentication and security events</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '24h' | '7d' | '30d')}
            className="bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          
          <Button
            onClick={loadSecurityData}
            variant="outline"
            size="sm"
            leftIcon={<FiRefreshCw />}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 border border-gray-700 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Logins</p>
              <p className="text-2xl font-bold text-green-400">{stats.totalLogins}</p>
            </div>
            <FiUser className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 border border-gray-700 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Failed Logins</p>
              <p className="text-2xl font-bold text-red-400">{stats.failedLogins}</p>
            </div>
            <FiAlertTriangle className="w-8 h-8 text-red-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 border border-gray-700 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Password Resets</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.passwordResets}</p>
            </div>
            <FiLock className="w-8 h-8 text-yellow-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 border border-gray-700 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">New Registrations</p>
              <p className="text-2xl font-bold text-blue-400">{stats.registrations}</p>
            </div>
            <FiUser className="w-8 h-8 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 border border-gray-700 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Suspicious Activity</p>
              <p className="text-2xl font-bold text-orange-400">{stats.suspiciousActivity}</p>
            </div>
            <FiEye className="w-8 h-8 text-orange-400" />
          </div>
        </motion.div>
      </div>

      {/* Recent Events */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-800 border border-gray-700 rounded-lg"
      >
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Recent Security Events</h2>
          <p className="text-gray-400 mt-1">Latest authentication and security activities</p>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-400"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8">
              <FiActivity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No security events found for the selected time range.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full bg-gray-600 ${getEventColor(event.eventType)}`}>
                      {getEventIcon(event.eventType)}
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {formatEventType(event.eventType)}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        {event.email && <span>Email: {event.email}</span>}
                        {event.ip && <span>IP: {event.ip}</span>}
                        {event.error && <span className="text-red-400">Error: {event.error}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">
                      {event.timestamp.toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-400">
                      {event.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Security Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gray-800 border border-gray-700 rounded-lg p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Security Recommendations</h2>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <FiShield className="w-5 h-5 text-lime-400 mt-0.5" />
            <div>
              <p className="text-white font-medium">Monitor Failed Login Attempts</p>
              <p className="text-gray-400 text-sm">
                Keep an eye on repeated failed login attempts from the same IP or email.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <FiLock className="w-5 h-5 text-lime-400 mt-0.5" />
            <div>
              <p className="text-white font-medium">Encourage Strong Passwords</p>
              <p className="text-gray-400 text-sm">
                The system enforces strong password requirements for all new accounts.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <FiAlertTriangle className="w-5 h-5 text-lime-400 mt-0.5" />
            <div>
              <p className="text-white font-medium">Review Suspicious Activity</p>
              <p className="text-gray-400 text-sm">
                Investigate any unusual patterns in login attempts or password resets.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}