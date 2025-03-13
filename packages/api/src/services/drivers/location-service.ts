import { db } from '@loadup/database';
import { driversTable } from '@loadup/database/schema';
import { eq } from 'drizzle-orm';

export interface DriverLocation {
  latitude: number;
  longitude: number;
  timestamp: Date;
}

export class DriverLocationService {
  async updateLocation(driverId: string, location: DriverLocation) {
    await db.update(driversTable)
      .set({
        currentLocation: location,
        updatedAt: new Date(),
      })
      .where(eq(driversTable.id, driverId));
  }

  async getDriverLocation(driverId: string) {
    const driver = await db.query.driversTable.findFirst({
      where: eq(driversTable.id, driverId),
      columns: {
        currentLocation: true,
      },
    });

    return driver?.currentLocation;
  }
} 