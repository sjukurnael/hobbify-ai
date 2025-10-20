import cron from 'node-cron';
import { db } from './db.js';
import { classes } from '../shared/schema.js';
import { lt } from 'drizzle-orm';

export function startCleanupJobs() {
  // Run every day at 2:00 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('🧹 Running cleanup job for past classes...');
    
    try {
      const now = new Date();
      
      // Delete classes where end_time is in the past
      const result = await db.delete(classes)
        .where(lt(classes.endTime, now))
        .returning();
      
      console.log(`✅ Deleted ${result.length} past classes`);
      
      if (result.length > 0) {
        console.log('Deleted classes:', result.map(c => ({ 
          id: c.id, 
          title: c.title, 
          endTime: c.endTime 
        })));
      }
    } catch (error) {
      console.error('❌ Cleanup job failed:', error);
    }
  });
  
  console.log('⏰ Cleanup job scheduled (runs daily at 2:00 AM)');
}