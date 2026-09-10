import 'package:cloud_firestore/cloud_firestore.dart';
import '../../cycle_tracking/models/user_cycle.dart';

class Remedy {
  final String id;
  final String name;
  final List<String> targetSymptoms;
  final String benefits;

  Remedy({
    required this.id,
    required this.name,
    required this.targetSymptoms,
    required this.benefits,
  });

  factory Remedy.fromFirestore(DocumentSnapshot doc) {
    Map data = doc.data() as Map<String, dynamic>;
    return Remedy(
      id: doc.id,
      name: data['name'] ?? '',
      targetSymptoms: List<String>.from(data['targetSymptoms'] ?? []),
      benefits: data['benefits'] ?? '',
    );
  }
}

class RemedyService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  /// Fetches smart suggestions based on currently logged symptoms and 
  /// the user's historical preferences for remedies.
  Future<List<Remedy>> getSmartSuggestions(String userId, List<String> currentSymptoms) async {
    // 1. Fetch user's preferences
    DocumentSnapshot userDoc = await _firestore.collection('users').doc(userId).get();
    UserCycle userCycle = UserCycle.fromFirestore(userDoc);
    Map<String, double> preferences = userCycle.remedyPreferences;

    // 2. Fetch all remedies
    QuerySnapshot remedySnapshot = await _firestore.collection('remedies').get();
    List<Remedy> allRemedies = remedySnapshot.docs.map((doc) => Remedy.fromFirestore(doc)).toList();

    // 3. Filter and weight logic
    List<Map<String, dynamic>> scoredRemedies = [];

    for (var remedy in allRemedies) {
      double score = 0.0;
      
      // Base weight: How many current symptoms does this remedy target?
      int matchingSymptoms = remedy.targetSymptoms.where((s) => currentSymptoms.contains(s)).length;
      if (matchingSymptoms > 0) {
        score += (matchingSymptoms * 2.0); // 2 points per matching symptom

        // Personal weight: Did the user find this helpful before?
        if (preferences.containsKey(remedy.name)) {
          // If rated 5 stars, adds 5 points. If rated 1 star, adds 1 point.
          score += preferences[remedy.name]!;
        }

        scoredRemedies.add({
          'remedy': remedy,
          'score': score,
        });
      }
    }

    // 4. Sort by highest score
    scoredRemedies.sort((a, b) => (b['score'] as double).compareTo(a['score'] as double));

    // 5. Return top ranked remedies
    return scoredRemedies.map((e) => e['remedy'] as Remedy).toList();
  }
}
