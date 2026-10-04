import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Share,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { eventInviteUrl } from '../../config/links';

interface QRCodeDisplayProps {
  inviteCode: string;
  inviteLink?: string;
}

export function QRCodeDisplay({ inviteCode, inviteLink }: QRCodeDisplayProps) {
  const link = inviteLink ?? eventInviteUrl(inviteCode);

  const handleShare = () => {
    Haptics.selectionAsync().catch(() => {});
    Share.share({ url: link, message: link }).catch(() => {
      Alert.alert('Invite link', link);
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.qrCard}>
        <QRCode
          value={link}
          size={200}
          color="#18122B"
          backgroundColor="white"
          ecl="M"
          quietZone={8}
        />
      </View>

      <View style={styles.codeRow}>
        <Text style={styles.codeLabel}>Invite code</Text>
        <Text style={styles.codeValue}>{inviteCode}</Text>
      </View>

      <View style={styles.linkRow}>
        <Text style={styles.link} numberOfLines={1}>
          {link}
        </Text>
      </View>

      <Pressable style={styles.shareButton} onPress={handleShare}>
        <Ionicons name="share-social-outline" size={18} color="white" />
        <Text style={styles.shareText}>Share link</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 14,
  },
  qrCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 12,
    shadowColor: '#5B2CFF',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codeLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#746B8C',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  codeValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#18122B',
    letterSpacing: 3,
  },
  linkRow: {
    backgroundColor: '#F7F4FF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    width: '100%',
  },
  link: {
    fontSize: 12,
    color: '#746B8C',
    fontWeight: '600',
    textAlign: 'center',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#5B2CFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  shareText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '900',
  },
});
