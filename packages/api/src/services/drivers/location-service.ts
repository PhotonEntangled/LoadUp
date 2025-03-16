import { db } from '@loadup/database';
import { drivers } from '@loadup/database/schema';
import { eq } from '@loadup/database';

export interface DriverLocation {
  latitude: number;
  longitude: number;
  timestamp: Date;
}

export class DriverLocationService {
  async updateLocation(driverId: string, location: DriverLocation) {
    await db.update(drivers)
      .set({
        location: JSON.stringify(location),
        updatedAt: new Date(),
      })
      .where(eq(drivers.id as any, driverId));
  }

  async getDriverLocation(driverId: string) {
    const driver = await db.query.drivers.findFirst({
      where: eq(drivers.id as any, driverId),
      columns: {
        location: true,
      },
    });

    return driver?.location ? JSON.parse(driver.location) : null;
  }
} 