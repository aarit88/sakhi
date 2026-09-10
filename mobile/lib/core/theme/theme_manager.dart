import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

enum CyclePhase {
  menstrual,
  follicular,
  ovulatory,
  luteal,
}

class CycleTheme {
  final Color backgroundColor;
  final Color primaryColor;
  final String phaseName;

  CycleTheme({
    required this.backgroundColor,
    required this.primaryColor,
    required this.phaseName,
  });
}

// Map phases to their respective dynamic themes
final Map<CyclePhase, CycleTheme> _phaseThemes = {
  CyclePhase.menstrual: CycleTheme(
    backgroundColor: Colors.red.shade50,
    primaryColor: Colors.red.shade400,
    phaseName: 'Menstrual',
  ),
  CyclePhase.follicular: CycleTheme(
    backgroundColor: Colors.green.shade50,
    primaryColor: Colors.green.shade400,
    phaseName: 'Follicular',
  ),
  CyclePhase.ovulatory: CycleTheme(
    backgroundColor: Colors.orange.shade50,
    primaryColor: Colors.orange.shade400,
    phaseName: 'Ovulatory',
  ),
  CyclePhase.luteal: CycleTheme(
    backgroundColor: Colors.purple.shade50,
    primaryColor: Colors.purple.shade400,
    phaseName: 'Luteal',
  ),
};

class ThemeNotifier extends Notifier<CyclePhase> {
  @override
  CyclePhase build() {
    // Defaulting to Menstrual phase, but this should be calculated 
    // based on the user's current day in the cycle.
    return CyclePhase.menstrual;
  }

  void updatePhase(CyclePhase newPhase) {
    state = newPhase;
  }

  CycleTheme get currentTheme => _phaseThemes[state]!;
}

final themeProvider = NotifierProvider<ThemeNotifier, CyclePhase>(() {
  return ThemeNotifier();
});
