import 'package:cloud_firestore/cloud_firestore.dart';

class DailyLog {
  final DateTime date;
  final int flowIntensity; // 1 to 5
  final List<String> symptoms;
  final List<Map<String, dynamic>> remediesUsed;

  DailyLog({
    required this.date,
    required this.flowIntensity,
    required this.symptoms,
    this.remediesUsed = const [],
  });

  factory DailyLog.fromMap(Map<String, dynamic> map) {
    return DailyLog(
      date: (map['date'] as Timestamp).toDate(),
      flowIntensity: map['flowIntensity'] ?? 1,
      symptoms: List<String>.from(map['symptoms'] ?? []),
      remediesUsed: List<Map<String, dynamic>>.from(map['remediesUsed'] ?? []),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'date': Timestamp.fromDate(date),
      'flowIntensity': flowIntensity,
      'symptoms': symptoms,
      'remediesUsed': remediesUsed,
    };
  }
}

class UserCycle {
  final String uid;
  final DateTime lastPeriodDate;
  final int avgCycleLength;
  final List<DailyLog> symptomsLog;
  final Map<String, double> remedyPreferences; // e.g. "Ginger Tea": 4.5

  UserCycle({
    required this.uid,
    required this.lastPeriodDate,
    required this.avgCycleLength,
    this.symptomsLog = const [],
    this.remedyPreferences = const {},
  });

  factory UserCycle.fromFirestore(DocumentSnapshot doc) {
    Map data = doc.data() as Map<String, dynamic>;
    
    var logsData = data['symptomsLog'] as List<dynamic>? ?? [];
    List<DailyLog> parsedLogs = logsData.map((log) => DailyLog.fromMap(log)).toList();

    return UserCycle(
      uid: doc.id,
      lastPeriodDate: (data['lastPeriodDate'] as Timestamp).toDate(),
      avgCycleLength: data['avgCycleLength'] ?? 28,
      symptomsLog: parsedLogs,
      remedyPreferences: Map<String, double>.from(data['remedyPreferences'] ?? {}),
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'lastPeriodDate': Timestamp.fromDate(lastPeriodDate),
      'avgCycleLength': avgCycleLength,
      'symptomsLog': symptomsLog.map((log) => log.toMap()).toList(),
      'remedyPreferences': remedyPreferences,
    };
  }
}
