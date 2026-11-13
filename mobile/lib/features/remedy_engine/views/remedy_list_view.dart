import 'package:flutter/material.dart';
import '../services/remedy_service.dart';

class RemedyListView extends StatefulWidget {
  final String userId;
  final List<String> currentSymptoms;
  
  const RemedyListView({
    super.key, 
    required this.userId, 
    required this.currentSymptoms
  });

  @override
  RemedyListViewState createState() => RemedyListViewState();
}

class RemedyListViewState extends State<RemedyListView> {
  final RemedyService _remedyService = RemedyService();
  late Future<List<Remedy>> _remediesFuture;

  @override
  void initState() {
    super.initState();
    _remediesFuture = _remedyService.getSmartSuggestions(widget.userId, widget.currentSymptoms);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
          child: Text(
            'Recommended for Your Current Phase',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
        ),
        SizedBox(
          height: 150,
          child: FutureBuilder<List<Remedy>>(
            future: _remediesFuture,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              } else if (snapshot.hasError) {
                return const Center(child: Text('Failed to load recommendations'));
              } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                return const Center(child: Text('No recommendations found for current symptoms.'));
              }

              final remedies = snapshot.data!;
              
              return ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: remedies.length,
                itemBuilder: (context, index) {
                  final remedy = remedies[index];
                  final isLast = index == remedies.length - 1;
                  return Container(
                    width: 200,
                    margin: EdgeInsets.only(left: 16, right: isLast ? 16 : 0),
                    child: Card(
                      elevation: 4,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      child: Padding(
                        padding: const EdgeInsets.all(12.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              remedy.name,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              remedy.benefits,
                              style: TextStyle(color: Colors.grey.shade700, fontSize: 12),
                              maxLines: 3,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              );
            },
          ),
        ),
      ],
    );
  }
}
