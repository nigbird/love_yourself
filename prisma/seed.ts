
// This is a seed file for Prisma. You'll need to install Prisma,
// set up a schema.prisma file, and a database to use this.
// The current application uses localStorage, so this file is for future extension.

import { PrismaClient, RoutineFrequency } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log(`Start seeding ...`)

  // Create a sample user if they don't exist
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Bloom User',
      rewardPoints: 0,
    },
  })
  console.log(`Upserted user with id: ${user.id}`)

  // Seed Routines
  const routines = [
    {
        name: 'Hair Wash Day',
        frequency: RoutineFrequency.weekly,
        daysOfWeek: [0, 3], // Sunday, Wednesday
        timeOfDay: '20:00',
        rewardPoints: 20,
        remindersEnabled: true,
        userId: user.id,
    },
    {
        name: 'Meal Prep',
        frequency: RoutineFrequency.weekly,
        daysOfWeek: [0], // Sunday
        timeOfDay: '16:00',
        rewardPoints: 50,
        remindersEnabled: true,
        userId: user.id,
    },
    {
        name: 'Daily Gratitude',
        frequency: RoutineFrequency.daily,
        timeOfDay: '08:00',
        rewardPoints: 10,
        remindersEnabled: true,
        userId: user.id,
    }
  ];

  for (const routineData of routines) {
      const existingRoutine = await prisma.routine.findFirst({
        where: {
            name: routineData.name,
            userId: user.id,
        }
      });

      if (!existingRoutine) {
          const routine = await prisma.routine.create({
              data: routineData,
          });
          console.log(`Created routine with id: ${routine.id}`);
      } else {
          console.log(`Routine "${routineData.name}" already exists. Skipping.`);
      }
  }

  // Seed Goals
   const goals = [
    {
      name: "Gain 8kg in 3 months",
      type: "personal_measurable",
      targetValue: 8,
      currentValue: 2,
      unit: "kg",
      rewardPoints: 200,
      userId: user.id,
    },
    {
      name: "Read the Book of John",
      type: "spiritual",
      rewardPoints: 100,
      userId: user.id,
    },
    {
      name: "Meditate 15 mins daily for a month",
      type: "personal_measurable",
      targetValue: 30,
      currentValue: 10,
      unit: "days",
      rewardPoints: 150,
      userId: user.id,
    },
  ];

  for (const goalData of goals) {
      const existingGoal = await prisma.goal.findFirst({
        where: {
            name: goalData.name,
            userId: user.id,
        }
      });

      if(!existingGoal) {
          const goal = await prisma.goal.create({
              data: goalData,
          });
          console.log(`Created goal with id: ${goal.id}`);
      } else {
          console.log(`Goal "${goalData.name}" already exists. Skipping.`);
      }
  }


  // Seed Journal Entries
  const journalEntries = [
    {
        title: "A Day of Small Wins",
        content: "Today was a good day. I managed to finish my big project at work and even had time to go for a walk in the park. The weather was perfect. Feeling grateful for these small moments of peace.",
        imageUrl: "https://placehold.co/600x400.png",
        mood: "😊",
        userId: user.id,
    },
    {
        title: "Reflections on a Book",
        content: "Finished reading 'The Midnight Library' and it left me with a lot to think about. The idea that we can live so many different lives is both daunting and comforting. It makes me want to be more intentional with my choices.",
        mood: "🤔",
        userId: user.id,
    },
  ];

  for (const entryData of journalEntries) {
      const existingEntry = await prisma.journalEntry.findFirst({
        where: {
            title: entryData.title,
            userId: user.id,
        }
      });
      if (!existingEntry) {
        const entry = await prisma.journalEntry.create({
            data: entryData
        });
        console.log(`Created journal entry with id: ${entry.id}`);
      } else {
        console.log(`Journal entry "${entryData.title}" already exists. Skipping.`);
      }
  }


  console.log(`Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
