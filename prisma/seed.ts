import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up existing data...');
  await prisma.roomTransferHistory.deleteMany();
  await prisma.complaintStatusHistory.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.resident.deleteMany();
  await prisma.bed.deleteMany();
  await prisma.room.deleteMany();
  await prisma.floor.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.admin.deleteMany();

  console.log('Seeding Admin...');
  const passwordHash = await bcrypt.hash('adminpassword123', 10);
  await prisma.admin.create({
    data: {
      username: 'admin',
      passwordHash,
      name: 'Elite Homes Admin',
      role: 'ADMIN',
    },
  });

  console.log('Seeding Floors, Rooms, and Beds...');
  // Ground Floor
  const groundFloor = await prisma.floor.create({
    data: {
      floorNumber: 0,
      code: 'G',
      displayName: 'Ground Floor',
    },
  });

  // G1 and G2: 6-sharing, ₹5,000/person
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

    // 12 rooms per floor:
    // Rooms 1-3: 5-sharing (₹5,500)
    // Rooms 4-6: 4-sharing (₹6,000)
    // Rooms 7-8: 2-sharing (₹7,000)
    // Rooms 9-12: 3-sharing (₹6,500)
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

  console.log('Seeding Sample Residents...');
  // Find specific beds for sample residents
  const roomA7 = await prisma.room.findUniqueOrThrow({ where: { roomNumber: 'A7' }, include: { beds: true } });
  const roomB4 = await prisma.room.findUniqueOrThrow({ where: { roomNumber: 'B4' }, include: { beds: true } });
  const roomG1 = await prisma.room.findUniqueOrThrow({ where: { roomNumber: 'G1' }, include: { beds: true } });
  const roomC3 = await prisma.room.findUniqueOrThrow({ where: { roomNumber: 'C3' }, include: { beds: true } });
  const roomD9 = await prisma.room.findUniqueOrThrow({ where: { roomNumber: 'D9' }, include: { beds: true } });
  const roomA4 = await prisma.room.findUniqueOrThrow({ where: { roomNumber: 'A4' }, include: { beds: true } });
  const roomA1 = await prisma.room.findUniqueOrThrow({ where: { roomNumber: 'A1' }, include: { beds: true } });

  // 1. Rahul Kumar - EH-A07-001 (Room A7, Bed 2, 2-sharing [note: in spec A7 is 4-sharing or 2-sharing, let's look at roomA7 rent & capacity])
  const rahulBed = roomA7.beds.find((b) => b.bedNumber === 2)!;
  const rahul = await prisma.resident.create({
    data: {
      residentId: 'EH-A07-001',
      name: 'Rahul Kumar',
      phone: '9876543210',
      joiningDate: new Date('2026-06-15T00:00:00.000Z'),
      roomId: roomA7.id,
      bedId: rahulBed.id,
      monthlyRent: roomA7.monthlyRent,
      status: 'ACTIVE',
    },
  });
  await prisma.bed.update({ where: { id: rahulBed.id }, data: { status: 'OCCUPIED' } });

  // Rahul Kumar's roommate in A7 Bed 1
  const rahulRoommateBed = roomA7.beds.find((b) => b.bedNumber === 1)!;
  await prisma.resident.create({
    data: {
      residentId: 'EH-A07-002',
      name: 'Rohit Sharma',
      phone: '9876543211',
      joiningDate: new Date('2026-07-01T00:00:00.000Z'),
      roomId: roomA7.id,
      bedId: rahulRoommateBed.id,
      monthlyRent: roomA7.monthlyRent,
      status: 'ACTIVE',
    },
  });
  await prisma.bed.update({ where: { id: rahulRoommateBed.id }, data: { status: 'OCCUPIED' } });
  await prisma.room.update({ where: { id: roomA7.id }, data: { status: 'FULL' } });

  // 2. Aman Singh - EH-B04-003 (Room B4, Bed 1)
  const amanBed = roomB4.beds.find((b) => b.bedNumber === 1)!;
  const aman = await prisma.resident.create({
    data: {
      residentId: 'EH-B04-003',
      name: 'Aman Singh',
      phone: '9812345678',
      joiningDate: new Date('2026-08-11T00:00:00.000Z'), // Due today! (11th Sep)
      roomId: roomB4.id,
      bedId: amanBed.id,
      monthlyRent: roomB4.monthlyRent,
      status: 'ACTIVE',
    },
  });
  await prisma.bed.update({ where: { id: amanBed.id }, data: { status: 'OCCUPIED' } });
  await prisma.room.update({ where: { id: roomB4.id }, data: { status: 'PARTIAL' } });

  // 3. Vikram Patel - EH-G01-004 (Room G1, Bed 3)
  const vikramBed = roomG1.beds.find((b) => b.bedNumber === 3)!;
  await prisma.resident.create({
    data: {
      residentId: 'EH-G01-004',
      name: 'Vikram Patel',
      phone: '9823456789',
      joiningDate: new Date('2026-05-01T00:00:00.000Z'),
      roomId: roomG1.id,
      bedId: vikramBed.id,
      monthlyRent: roomG1.monthlyRent,
      status: 'ACTIVE',
    },
  });
  await prisma.bed.update({ where: { id: vikramBed.id }, data: { status: 'OCCUPIED' } });
  await prisma.room.update({ where: { id: roomG1.id }, data: { status: 'PARTIAL' } });

  // 4. Karthik Nair - EH-C03-005 (Room C3, Bed 2)
  const karthikBed = roomC3.beds.find((b) => b.bedNumber === 2)!;
  await prisma.resident.create({
    data: {
      residentId: 'EH-C03-005',
      name: 'Karthik Nair',
      phone: '9834567890',
      joiningDate: new Date('2026-08-01T00:00:00.000Z'), // Due date passed (1st Sep) -> OVERDUE
      roomId: roomC3.id,
      bedId: karthikBed.id,
      monthlyRent: roomC3.monthlyRent,
      status: 'ACTIVE',
    },
  });
  await prisma.bed.update({ where: { id: karthikBed.id }, data: { status: 'OCCUPIED' } });
  await prisma.room.update({ where: { id: roomC3.id }, data: { status: 'PARTIAL' } });

  // 5. Sneha Reddy - EH-D09-006 (Room D9, Bed 1)
  const snehaBed = roomD9.beds.find((b) => b.bedNumber === 1)!;
  await prisma.resident.create({
    data: {
      residentId: 'EH-D09-006',
      name: 'Sneha Reddy',
      phone: '9845678901',
      joiningDate: new Date('2026-08-14T00:00:00.000Z'), // Due in 3 days -> DUE_SOON
      roomId: roomD9.id,
      bedId: snehaBed.id,
      monthlyRent: roomD9.monthlyRent,
      status: 'ACTIVE',
    },
  });
  await prisma.bed.update({ where: { id: snehaBed.id }, data: { status: 'OCCUPIED' } });
  await prisma.room.update({ where: { id: roomD9.id }, data: { status: 'PARTIAL' } });

  // 6. Aradhya Verma - EH-A04-007 (Room A4, Bed 1)
  const aradhyaBed = roomA4.beds.find((b) => b.bedNumber === 1)!;
  await prisma.resident.create({
    data: {
      residentId: 'EH-A04-007',
      name: 'Aradhya Verma',
      phone: '9856789012',
      joiningDate: new Date('2026-07-20T00:00:00.000Z'),
      roomId: roomA4.id,
      bedId: aradhyaBed.id,
      monthlyRent: roomA4.monthlyRent,
      status: 'ACTIVE',
    },
  });
  await prisma.bed.update({ where: { id: aradhyaBed.id }, data: { status: 'OCCUPIED' } });
  await prisma.room.update({ where: { id: roomA4.id }, data: { status: 'PARTIAL' } });

  // Seed sample payments for Rahul Kumar
  console.log('Seeding Sample Payments...');
  await prisma.payment.create({
    data: {
      paymentId: 'EH-REC-2026-00001',
      residentId: rahul.id,
      amount: rahul.monthlyRent,
      paymentDate: new Date('2026-06-15T10:30:00.000Z'),
      billingStartDate: new Date('2026-06-15T00:00:00.000Z'),
      billingEndDate: new Date('2026-07-14T23:59:59.000Z'),
      paymentMethod: 'UPI',
      transactionRef: 'UPI/216509874123',
      status: 'PAID',
      receiptNotes: 'Initial rent paid upon joining.',
    },
  });

  await prisma.payment.create({
    data: {
      paymentId: 'EH-REC-2026-00002',
      residentId: rahul.id,
      amount: rahul.monthlyRent,
      paymentDate: new Date('2026-07-15T14:15:00.000Z'),
      billingStartDate: new Date('2026-07-15T00:00:00.000Z'),
      billingEndDate: new Date('2026-08-14T23:59:59.000Z'),
      paymentMethod: 'UPI',
      transactionRef: 'UPI/219602341852',
      status: 'PAID',
      receiptNotes: 'Monthly rent for July - August cycle.',
    },
  });

  await prisma.payment.create({
    data: {
      paymentId: 'EH-REC-2026-00003',
      residentId: rahul.id,
      amount: rahul.monthlyRent,
      paymentDate: new Date('2026-08-15T11:00:00.000Z'),
      billingStartDate: new Date('2026-08-15T00:00:00.000Z'),
      billingEndDate: new Date('2026-09-14T23:59:59.000Z'),
      paymentMethod: 'UPI',
      transactionRef: 'UPI/222718903456',
      status: 'PAID',
      receiptNotes: 'Monthly rent for August - September cycle.',
    },
  });

  // Seed sample complaints for Rahul Kumar
  console.log('Seeding Sample Complaints...');
  const complaint1 = await prisma.complaint.create({
    data: {
      ticketId: 'EH-TKT-2026-0001',
      residentId: rahul.id,
      category: 'Wi-Fi',
      subject: 'Wi-Fi not working on Floor A',
      description: 'The router on Floor A has been dropping connection frequently since morning.',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
    },
  });

  await prisma.complaintStatusHistory.createMany({
    data: [
      {
        complaintId: complaint1.id,
        oldStatus: 'NONE',
        newStatus: 'SUBMITTED',
        comment: 'Complaint submitted by resident.',
        changedBy: 'Rahul Kumar',
        createdAt: new Date('2026-09-07T10:32:00.000Z'),
      },
      {
        complaintId: complaint1.id,
        oldStatus: 'SUBMITTED',
        newStatus: 'UNDER_REVIEW',
        comment: 'Admin reviewed and forwarded to IT technician.',
        changedBy: 'Admin',
        createdAt: new Date('2026-09-07T11:10:00.000Z'),
      },
      {
        complaintId: complaint1.id,
        oldStatus: 'UNDER_REVIEW',
        newStatus: 'ASSIGNED',
        comment: 'Technician Suresh assigned.',
        changedBy: 'Admin',
        createdAt: new Date('2026-09-07T12:30:00.000Z'),
      },
      {
        complaintId: complaint1.id,
        oldStatus: 'ASSIGNED',
        newStatus: 'IN_PROGRESS',
        comment: 'Fiber cable inspection underway.',
        changedBy: 'Technician Suresh',
        createdAt: new Date('2026-09-07T14:00:00.000Z'),
      },
    ],
  });

  const complaint2 = await prisma.complaint.create({
    data: {
      ticketId: 'EH-TKT-2026-0002',
      residentId: aman.id,
      category: 'Electrical',
      subject: 'Ceiling fan making squeaking noise in Room B4',
      description: 'The fan rotates with loud noise on speed 3 and 4. Needs lubrication or repair.',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      resolvedAt: new Date('2026-09-09T16:00:00.000Z'),
    },
  });

  await prisma.complaintStatusHistory.createMany({
    data: [
      {
        complaintId: complaint2.id,
        oldStatus: 'NONE',
        newStatus: 'SUBMITTED',
        comment: 'Submitted by Aman Singh.',
        changedBy: 'Aman Singh',
        createdAt: new Date('2026-09-08T09:00:00.000Z'),
      },
      {
        complaintId: complaint2.id,
        oldStatus: 'SUBMITTED',
        newStatus: 'RESOLVED',
        comment: 'Fan motor lubricated and capacitor checked.',
        changedBy: 'Admin',
        createdAt: new Date('2026-09-09T16:00:00.000Z'),
      },
    ],
  });

  // Seed sample notifications
  console.log('Seeding Sample Notifications...');
  await prisma.notification.createMany({
    data: [
      {
        type: 'NEW_COMPLAINT',
        title: 'New Complaint Submitted',
        message: 'Rahul Kumar submitted: "Wi-Fi not working on Floor A" (Room A7).',
        isRead: false,
        link: '/admin/complaints',
        createdAt: new Date('2026-09-07T10:32:00.000Z'),
      },
      {
        type: 'RENT_DUE',
        title: 'Rent Due Today',
        message: "Aman Singh's monthly rent of ₹6,000 is due today (Room B4).",
        isRead: false,
        link: '/admin/payments',
        createdAt: new Date(),
      },
      {
        type: 'RENT_OVERDUE',
        title: 'Rent Overdue Warning',
        message: "Karthik Nair's rent is overdue since 1st Sep (Room C3).",
        isRead: false,
        link: '/admin/payments',
        createdAt: new Date(),
      },
      {
        type: 'ROOM_AVAILABLE',
        title: 'Room Slot Available',
        message: 'Bed 3 in Room C7 is now available for new admission.',
        isRead: true,
        link: '/admin/rooms',
        createdAt: new Date('2026-09-05T12:00:00.000Z'),
      },
    ],
  });

  console.log('✅ Database seeded successfully with 287 total beds across 6 floors!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
