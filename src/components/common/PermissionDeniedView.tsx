/**
 * Permission denial UI. (#793)
 *
 * The QR scanner caught camera permission errors in a bare catch and rendered
 * a blank screen, so a denied permission looked identical to a broken screen
 * and offered no way forward. This states what is blocked and routes the user
 * into system settings.
 */
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface PermissionDeniedViewProps {
  /** Permission the screen needs, e.g. "Camera". */
  permission: string;
  /** Overrides the jump into system settings; used by tests. */
  onOpenSettings?: () => void;
}

export function PermissionDeniedView({ permission, onOpenSettings }: PermissionDeniedViewProps) {
  const handlePress = onOpenSettings ?? (() => void Linking.openSettings());

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{permission} access is off</Text>
      <Text style={styles.body}>
        Turn on {permission.toLowerCase()} access in Settings to use this screen.
      </Text>
      <TouchableOpacity accessibilityRole="button" onPress={handlePress} style={styles.button}>
        <Text style={styles.buttonLabel}>Go to Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 14, opacity: 0.75, textAlign: 'center' },
  button: { backgroundColor: '#2563eb', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 12 },
  buttonLabel: { color: '#ffffff', fontWeight: '600' },
  container: { alignItems: 'center', flex: 1, gap: 12, justifyContent: 'center', padding: 24 },
  title: { fontSize: 18, fontWeight: '600' },
});

export default PermissionDeniedView;
