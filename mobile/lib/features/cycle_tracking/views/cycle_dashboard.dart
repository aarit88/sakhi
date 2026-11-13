import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/theme_manager.dart';

class CycleDashboard extends ConsumerWidget {
  const CycleDashboard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeNotifier = ref.read(themeProvider.notifier);
    final themeInfo = themeNotifier.currentTheme;

    // Mock data for the circular progress (e.g. Day 14 of 28)
    int currentDay = 14;
    int totalDays = 28;
    double progress = currentDay / totalDays;

    return Scaffold(
      backgroundColor: themeInfo.backgroundColor,
      appBar: AppBar(
        title: const Text('Shakti-Prana Dashboard'),
        backgroundColor: themeInfo.primaryColor,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Phase: ${themeInfo.phaseName}',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: themeInfo.primaryColor,
              ),
            ),
            const SizedBox(height: 40),
            
            // Circular Progress Indicator for Cycle
            Stack(
              alignment: Alignment.center,
              children: [
                SizedBox(
                  width: 200,
                  height: 200,
                  child: CircularProgressIndicator(
                    value: progress,
                    strokeWidth: 12,
                    backgroundColor: Colors.grey.shade300,
                    valueColor: AlwaysStoppedAnimation<Color>(themeInfo.primaryColor),
                  ),
                ),
                Column(
                  children: [
                    Text(
                      'Day $currentDay',
                      style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
                    ),
                    const Text('of 28'),
                  ],
                ),
              ],
            ),
            
            const SizedBox(height: 60),
            
            // Log Today Button
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: themeInfo.primaryColor,
                padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 15),
              ),
              onPressed: () => _showLogTodayBottomSheet(context, themeInfo.primaryColor),
              child: const Text('Log Today', style: TextStyle(fontSize: 18, color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }

  void _showLogTodayBottomSheet(BuildContext context, Color primaryColor) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(25.0)),
      ),
      builder: (context) {
        return _LogTodaySheet(primaryColor: primaryColor);
      },
    );
  }
}

class _LogTodaySheet extends StatefulWidget {
  final Color primaryColor;
  const _LogTodaySheet({required this.primaryColor});

  @override
  _LogTodaySheetState createState() => _LogTodaySheetState();
}

class _LogTodaySheetState extends State<_LogTodaySheet> {
  double _flowIntensity = 1;
  final List<String> _availableSymptoms = [
    'Sharp Cramps', 'Bloating', 'Headache', 'Nausea', 'Fatigue', 'Acne'
  ];
  final Set<String> _selectedSymptoms = {};

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
        left: 20, right: 20, top: 20
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Log Today', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 20),
          
          const Text('Flow Intensity', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
          Slider(
            value: _flowIntensity,
            min: 1,
            max: 5,
            divisions: 4,
            label: _flowIntensity.round().toString(),
            activeColor: widget.primaryColor,
            onChanged: (val) {
              setState(() {
                _flowIntensity = val;
              });
            },
          ),
          
          const SizedBox(height: 20),
          const Text('Symptoms', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
          const SizedBox(height: 10),
          
          Wrap(
            spacing: 8.0,
            children: _availableSymptoms.map((symptom) {
              final isSelected = _selectedSymptoms.contains(symptom);
              return FilterChip(
                label: Text(symptom),
                selected: isSelected,
                selectedColor: widget.primaryColor.withValues(alpha: 0.3),
                onSelected: (selected) {
                  setState(() {
                    if (selected) {
                      _selectedSymptoms.add(symptom);
                    } else {
                      _selectedSymptoms.remove(symptom);
                    }
                  });
                },
              );
            }).toList(),
          ),
          
          const SizedBox(height: 30),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: widget.primaryColor,
                padding: const EdgeInsets.symmetric(vertical: 15),
              ),
              onPressed: () {
                // TODO: Save log to Firestore
                Navigator.pop(context);
              },
              child: const Text('Save Log', style: TextStyle(color: Colors.white)),
            ),
          ),
          const SizedBox(height: 30),
        ],
      ),
    );
  }
}
