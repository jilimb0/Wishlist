const fs = require("node:fs")
const path = require("node:path")

const screens = [
  "LoginScreen",
  "RegisterScreen",
  "ForgotPasswordScreen",
  "ResetPasswordScreen",
  "DashboardScreen",
  "WishlistDetailScreen",
  "ProfileScreen",
  "DiscoverScreen",
  "FollowingScreen",
  "PublicProfileScreen",
]

const template = (name) => `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ${name}() {
  return (
    <View style={styles.container}>
      <Text>${name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
});
`

for (const screen of screens) {
  const filePath = path.join(__dirname, "mobile/src/screens", `${screen}.tsx`)
  fs.writeFileSync(filePath, template(screen))
  console.log(`Created ${screen}.tsx`)
}
