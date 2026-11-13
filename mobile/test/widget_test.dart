// This is a basic Flutter widget test.

import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:shakti_prana/main.dart';

void main() {
  testWidgets('ShaktiPranaApp loads correctly', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const ProviderScope(child: ShaktiPranaApp()));

    // Verify that the app title is displayed
    expect(find.text('Shakti-Prana Dashboard'), findsOneWidget);

    // Verify that the Log Today button is present
    expect(find.text('Log Today'), findsOneWidget);
  });
}