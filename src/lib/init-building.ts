import { PrismaClient } from '@prisma/client';

export async function ensureBuildingStructure(prisma: PrismaClient) {
  const floorCount = await prisma.floor.count();
  if (floorCount > 0) {
    return; // Already initialized
  }

  console.log('Initializing building structure (Floors, Rooms, Beds)...');

  // Ground Floor
  const groundFloor = await prisma.floor.create({
    data: {
      floorNumber: 0,
      code: 'G',
      displayName: 'Ground Floor',
    },
  });

  for (let r = 1; r <= 2; r++) {
    const roomNumber = `G${r}`;
    const room = await prisma.room.create({
      data: {
        roomNumber,
        floorId: groundFloor.id,
        sharingCapacity: 6,
        monthlyRent: 5000,
        status: 'AVAILABLE',
      },
    });

    for (let b = 1; b <= 6; b++) {
      await prisma.bed.create({
        data: {
          roomId: room.id,
          bedNumber: b,
          status: 'AVAILABLE',
        },
      });
    }
  }

  // Floors A to E
  const upperFloors = [
    { code: 'A', name: '1st Floor (A)', num: 1 },
    { code: 'B', name: '2nd Floor (B)', num: 2 },
    { code: 'C', name: '3rd Floor (C)', num: 3 },
    { code: 'D', name: '4th Floor (D)', num: 4 },
    { code: 'E', name: '5th Floor (E)', num: 5 },
  ];

  for (const f of upperFloors) {
    const floor = await prisma.floor.create({
      data: {
        floorNumber: f.num,
        code: f.code,
        displayName: f.name,
      },
    });

    for (let r = 1; r <= 12; r++) {
      const roomNumber = `${f.code}${r}`;
      let capacity = 3;
      let rent = 6500;

      if (r >= 1 && r <= 3) {
        capacity = 5;
        rent = 5500;
      } else if (r >= 4 && r <= 6) {
        capacity = 4;
        rent = 6000;
      } else if (r >= 7 && r <= 8) {
        capacity = 2;
        rent = 7000;
      } else if (r >= 9 && r <= 12) {
        capacity = 3;
        rent = 6500;
      }

      const room = await prisma.room.create({
        data: {
          roomNumber,
          floorId: floor.id,
          sharingCapacity: capacity,
          monthlyRent: rent,
          status: 'AVAILABLE',
        },
      });

      for (let b = 1; b <= capacity; b++) {
        await prisma.bed.create({
          data: {
            roomId: room.id,
            bedNumber: b,
            status: 'AVAILABLE',
          },
        });
      }
    }
  }

  console.log('Building structure initialized successfully.');
}
