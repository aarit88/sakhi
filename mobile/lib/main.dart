import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'features/cycle_tracking/views/cycle_dashboard.dart';
import 'core/theme/theme_manager.dart';

void main() async {
  // Ensure Flutter binding is initialized before Firebase
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Firebase using the generated options
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  // Wrap the entire app in ProviderScope for Riverpod
  runApp(const ProviderScope(child: ShaktiPranaApp()));
}

class ShaktiPranaApp extends ConsumerWidget {
  const ShaktiPranaApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // We can listen to the theme here if we want to change global app theme
    final themeInfo = ref.watch(themeProvider.notifier).currentTheme;

    return MaterialApp(
      title: 'Shakti-Prana',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: themeInfo.primaryColor,
          surface: themeInfo.backgroundColor,
        ),
      ),
      home: const CycleDashboard(),
    );
  }
}
