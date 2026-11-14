import { eq } from 'drizzle-orm';
import { db } from './index.ts';
import { users, userConsents } from './schema.ts';

export async function getOrCreateFirebaseUser(uid: string, email: string, name?: string | null) {
  try {
    const existingByEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existingByEmail[0]) {
      const updated = await db
        .update(users)
        .set({
          uid,
          name: existingByEmail[0].name || name || email.split('@')[0],
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingByEmail[0].id))
        .returning();
      return updated[0];
    }

    const result = await db
      .insert(users)
      .values({
        uid,
        email: email.toLowerCase(),
        name: name || email.split('@')[0],
        role: 'USER',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: email.toLowerCase(),
          name: name || undefined,
          updatedAt: new Date(),
        },
      })
      .returning();

    const created = result[0];
    if (created) {
      await ensureDefaultConsents(created.id);
    }
    return created;
  } catch (error) {
    console.error('Database query failed in getOrCreateFirebaseUser:', error);
    throw new Error('Database operation failed. Please try again later.', { cause: error });
  }
}

export async function ensureDefaultConsents(userId: number) {
  try {
    const existing = await db
      .select()
      .from(userConsents)
      .where(eq(userConsents.userId, userId));

    if (existing.length > 0) return existing;

    const defaults = [
      { userId, consentType: 'health_data_processing', granted: true },
      { userId, consentType: 'ai_insights', granted: true },
      { userId, consentType: 'doctor_sharing', granted: false },
      { userId, consentType: 'anonymous_community', granted: true },
      { userId, consentType: 'geolocation', granted: false },
    ];

    return await db.insert(userConsents).values(defaults).returning();
  } catch (error) {
    console.error('Database query failed in ensureDefaultConsents:', error);
    throw new Error('Failed to initialize consent records.', { cause: error });
  }
}
