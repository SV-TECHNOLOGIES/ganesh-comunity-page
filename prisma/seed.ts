import { PrismaClient } from '@prisma/client';
import { SPONSORS_DATA } from '../src/data/sponsors';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting MITRA & Slough Mahotsav database seeding...');

  // 1. Seed Events
  await prisma.event.deleteMany({});
  await prisma.event.createMany({
    data: [
      {
        id: 'evt-ganesh-chaturthi',
        title: 'Maha Ganapathi — London Ganesh Mahotsav 2026',
        category: 'Mahotsav & Darshan',
        date: '2026-09-14',
        time: 'Monday – Friday: 6:00 PM – 9:00 PM | Saturday: 11:00 AM – 3:00 PM',
        venue: 'E Block, SLOUGH & LANGLEY COLLEGE',
        address: 'Langley Road, SL3 8GW',
        description: 'London’s largest Maha Ganapathi Mahotsav featuring the historic 6ft eco-friendly murti, Sthapana puja, Kuchipudi cultural showcase, grand evening Aarti, and daily Mahaprasadam.',
        bannerUrl: '/assets/organizers-poster.jpg',
        status: 'Upcoming',
        capacity: 5000,
        rsvpCount: 1420,
        ticketPrice: 0,
        featured: true,
      }
    ],
  });
  console.log('✅ Events seeded');

  // 2. Seed Sponsors
  await prisma.sponsor.deleteMany({});
  await prisma.sponsor.createMany({
    data: SPONSORS_DATA.map((sp) => ({
      id: sp.id,
      name: sp.name,
      tier: sp.tier,
      logoUrl: sp.logoUrl,
      websiteUrl: sp.websiteUrl || '#',
      order: sp.order,
      active: sp.active ?? true,
    })),
  });
  console.log('✅ Sponsors seeded');

  // 3. Seed Members
  await prisma.member.deleteMany({});
  await prisma.member.createMany({
    data: [
      {
        id: 'MITRA-MEM-5001',
        fullName: 'Mahesh Babu G',
        email: 'member@mitra.org.uk',
        phone: '+44 7890 123456',
        tier: 'Life Member',
        role: 'Executive',
        status: 'Active',
        profession: 'Senior Software Architect',
        address: 'Chiswick, London W4 2AB',
        passwordHash: 'pass123',
        startDate: '2024-01-15',
        expiryDate: 'Lifetime',
      },
      {
        id: 'MITRA-MEM-5002',
        fullName: 'Priyanka Reddy',
        email: 'priyanka.reddy@example.co.uk',
        phone: '+44 7890 654321',
        tier: 'Annual Member',
        role: 'Member',
        status: 'Active',
        profession: 'NHS Consultant Physician',
        address: 'Birmingham B1 1AA',
        passwordHash: 'pass123',
        startDate: '2026-02-10',
        expiryDate: '2027-02-10',
      },
      {
        id: 'MITRA-MEM-5003',
        fullName: 'Venkatesh Naidu',
        email: 'v.naidu@example.co.uk',
        phone: '+44 7890 987654',
        tier: 'Volunteer',
        role: 'Volunteer',
        status: 'Active',
        profession: 'Postgraduate Student',
        address: 'Manchester M1 2WD',
        passwordHash: 'pass123',
        startDate: '2026-08-22',
        expiryDate: '2027-08-22',
      },
    ],
  });
  console.log('✅ Members seeded');

  // 4. Seed Charity Cases
  await prisma.charityCase.deleteMany({});
  await prisma.charityCase.createMany({
    data: [
      {
        id: 'MITRA-HELP-1092',
        applicantName: 'Srinivas Rao',
        contactEmail: 'srinivas.r@gmail.com',
        contactPhone: '+44 7700 900123',
        category: 'Student Care',
        description: 'Urgent assistance requested for university accommodation guidance and part-time work compliance in London.',
        status: 'Under Review',
        urgency: 'Medium',
      },
      {
        id: 'MITRA-HELP-1093',
        applicantName: 'Confidential Beneficiary',
        contactEmail: 'help.welfare@mitra.org.uk',
        contactPhone: '+44 7700 900456',
        category: 'Women Helpline',
        description: 'Domestic support request and legal advisory referral.',
        status: 'Open',
        urgency: 'High',
      },
      {
        id: 'MITRA-HELP-1091',
        applicantName: 'Family of Late K. Sharma',
        contactEmail: 'sharma.family@outlook.com',
        contactPhone: '+44 7700 900789',
        category: 'Repatriation Support',
        description: 'Consular documentation assistance and emergency flights logistics to Hyderabad.',
        status: 'Resolved',
        urgency: 'High',
      },
    ],
  });
  console.log('✅ Charity Cases seeded');

  // 5. Seed Media Items
  await prisma.mediaItem.deleteMany({});
  await prisma.mediaItem.createMany({
    data: [
      {
        id: 'med-1',
        title: 'Maha Ganapathi Official Teaser Video Reel',
        category: 'Video',
        coverImage: '/assets/poster.jpg',
        url: '/assets/teaser-reel.mp4',
        description: 'Official teaser video reel featuring Slough Langley sanctum diyas and swaying ghanta bells.',
      },
      {
        id: 'med-2',
        title: 'Guinness World Record Kuchipudi Highlights',
        category: 'Video',
        coverImage: '/assets/poster.jpg',
        url: 'https://youtube.com',
        description: 'Official recording of the historic Kuchipudi performance in London.',
      },
      {
        id: 'med-3',
        title: 'MITRA Patrika — Mahotsav Special Edition 2026',
        category: 'Patrika',
        coverImage: '/assets/organizers-poster.jpg',
        url: '#',
        description: 'Features community news, Telugu poetry, student accomplishments, and event photo spreads.',
      },
    ],
  });
  console.log('✅ Media Items seeded');

  // 6. Seed Blog / News
  await prisma.blogPost.deleteMany({});
  await prisma.blogPost.createMany({
    data: [
      {
        id: 'news-1',
        slug: 'maha-ganapathi-slough-mahotsav-2026',
        title: 'MITRA UK Announce London’s Largest Maha Ganapathi Mahotsav 2026',
        excerpt: 'Step inside the sanctum on 14th September 2026 in Langley, Slough as we unveil the 6ft eco-friendly Maha Ganapathi idol.',
        content: `MITRA UK in association with ELE Entertainments and presented by Biryanis and more! is proud to announce the biggest Maha Ganapathi Mahotsav in the United Kingdom, taking place on 14th September 2026 in Langley, Slough.`,
        category: 'Mahotsav News',
        author: 'MITRA Media Cell',
        date: '2026-08-25',
        coverImage: '/assets/poster.jpg',
        tags: ['Ganesh Chaturthi', 'Slough', 'Mahotsav', 'MITRA UK'],
      },
      {
        id: 'news-2',
        slug: 'guinness-world-record-recognition',
        title: 'MITRA Recognized by Parliament for Guinness World Record Cultural Achievement',
        excerpt: 'Members of the UK Parliament praise MITRA for fostering cultural integration and promoting South Asian classical arts.',
        content: `In a historic parliamentary motion, the Mana Indian Telugu Roots Abroad was commended for organizing the largest synchronized Kuchipudi ensemble outside India, bringing together over 500 performers from across Europe.`,
        category: 'Achievements',
        author: 'MITRA PR Officer',
        date: '2025-11-05',
        coverImage: '/assets/poster.jpg',
        tags: ['Guinness World Record', 'Parliament', 'Achievement'],
      },
    ],
  });
  console.log('✅ Blog Posts seeded');

  // 7. Seed Admin User
  await prisma.adminUser.deleteMany({});
  await prisma.adminUser.create({
    data: {
      username: 'admin',
      email: 'admin@mitra.org.uk',
      passwordHash: 'admin123',
      role: 'SuperAdmin',
    },
  });
  // 8. Seed Payments linked to Members
  await prisma.payment.deleteMany({});
  await prisma.payment.createMany({
    data: [
      {
        id: 'pay-201',
        amount: 51.0,
        currency: 'GBP',
        status: 'Completed',
        customerName: 'Mahesh Babu G',
        customerEmail: 'member@mitra.org.uk',
        customerPhone: '+44 7890 123456',
        description: 'Donation — Ganesh Mahotsav 2026 Seva Fund',
        paymentMethod: 'Stripe Card',
        stripePaymentIntentId: 'pi_3Mxt5k2eZvKYlo2C01a2b3c4',
      },
      {
        id: 'pay-202',
        amount: 25.0,
        currency: 'GBP',
        status: 'Completed',
        customerName: 'Mahesh Babu G',
        customerEmail: 'member@mitra.org.uk',
        customerPhone: '+44 7890 123456',
        description: 'Pooja Booking — Ganesh Chaturthi Morning Slot',
        paymentMethod: 'Stripe ApplePay',
        stripePaymentIntentId: 'pi_3Mxt9x2eZvKYlo2C05d6e7f8',
      },
      {
        id: 'pay-103',
        amount: 100.0,
        currency: 'GBP',
        status: 'Completed',
        customerName: 'Priyanka Reddy',
        customerEmail: 'priyanka.reddy@example.co.uk',
        customerPhone: '+44 7700 987654',
        description: 'Life Membership Plan Registration',
        paymentMethod: 'Stripe Card',
        stripePaymentIntentId: 'pi_3Myu122eZvKYlo2C09g0h1i2',
      },
      {
        id: 'pay-101',
        amount: 250.0,
        currency: 'GBP',
        status: 'Completed',
        customerName: 'Srinivas & Lakshmi Prasad',
        customerEmail: 'sl.prasad@example.co.uk',
        customerPhone: '+44 7890 123456',
        description: 'Slough Mahotsav Patron Sponsorship & Diya Seva',
        paymentMethod: 'Stripe Card',
        stripePaymentIntentId: 'pi_3Mxt5k2eZvKYlo2C01a2b3c9',
      },
    ],
  });
  console.log('✅ Payments seeded with Member links');

  console.log('🚀 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
