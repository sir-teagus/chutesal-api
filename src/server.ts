import { PrismaClient } from "@prisma/client";
import express from "express";
import cors from "cors";

const prisma = new PrismaClient();
const port = process.env.PORT || 3333;
const app = express();

app.use(express.json());
app.use(cors());

// LIST SCHOOLS
app.get("/schools", async (request, response) => {
  const schools = await prisma.school.findMany();

  return response.status(200).json(
    schools.map((school) => {
      return {
        ...school,
        venues: school.venues.split(","),
      };
    })
  );
});

// CREATE SCHOOL
app.post("/schools", async (request, response) => {
  const { name, address, venues } = request.body;

  const school = await prisma.school.create({
    data: {
      name,
      address,
      venues: venues.join(","),
    },
  });

  return response.status(201).json(school);
});

// CREATE PROFILE (CUP MANAGER)
app.post("/profiles", async (request, response) => {
  const { name, email, userName, password, schoolId } = request.body;

  const cupManager = await prisma.profile.create({
    data: {
      name,
      email,
      userName,
      password,
      schoolId,
    },
  });

  return response.status(201).json(cupManager);
});

// UPDATE PROFILE PASSWORD (CUP MANAGER)
app.patch("/profiles/:id/password", async (request, response) => {
  const profileId = Number(request.params.id);

  const { password } = request.body;

  const profile = await prisma.profile.update({
    where: { id: profileId },
    data: {
      password,
    },
  });

  return response.status(200).json(profile);
});

// UPDATE SCHOOL ADDRESS
app.patch("/schools/:id/address", async (request, response) => {
  const schoolId = Number(request.params.id);

  const { address } = request.body;

  const school = await prisma.school.update({
    where: { id: schoolId },
    data: {
      address,
    },
  });

  return response.status(200).json(school);
});

// UPDATE SCHOOL VENUES
app.patch("/schools/:id/venues", async (request, response) => {
  const schoolId = Number(request.params.id);

  const { venues } = request.body;

  const school = await prisma.school.update({
    where: { id: schoolId },
    data: {
      venues: venues.join(","),
    },
  });

  return response.status(200).json(school);
});

// CREATE CUP
app.post("/schools/:id/cups", async (request, response) => {
  const schoolId = Number(request.params.id);

  const { name, signUpPeriod, cupGamesPeriod, announcementDate } = request.body;

  const cup = await prisma.cup.create({
    data: {
      name,
      matches: "",
      signUpPeriod: signUpPeriod.join(","),
      cupGamesPeriod: cupGamesPeriod.join(","),
      announcementDate,
      schoolId,
    },
  });

  return response.status(201).json(cup);
});

// UPDATE CUP STATUS
app.patch("/cups/:id/status", async (request, response) => {
  const cupId = Number(request.params.id);

  const { status } = request.body;

  const cup = await prisma.cup.update({
    where: { id: cupId },
    data: {
      status,
    },
  });

  return response.status(200).json({ cup });
});

// UPDATE CUP MATCHES
app.patch("/cups/:id/matches", async (request, response) => {
  const cupId = Number(request.params.id);

  const { matches } = request.body;

  const cup = await prisma.cup.update({
    where: { id: cupId },
    data: {
      matches: JSON.stringify(matches),
    },
  });

  return response.status(200).json({ ...cup, matches });
});

// LIST CUPS BY SCHOOL
app.get("/schools/:id/cups", async (request, response) => {
  const schoolId = Number(request.params.id);

  const cups = await prisma.cup.findMany({
    where: { schoolId },
    select: {
      id: true,
      status: true,
      name: true,
      teams: true,
      matches: true,
      signUpPeriod: true,
      cupGamesPeriod: true,
      announcementDate: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return response.status(200).json(
    cups.map((cup) => {
      return {
        ...cup,
        matches:
          cup.matches == null || cup.matches == ""
            ? ""
            : JSON.parse(cup.matches),
        signUpPeriod: cup.signUpPeriod.split(","),
        cupGamesPeriod: cup.cupGamesPeriod.split(","),
      };
    })
  );
});

// LIST ENROLLMENTS BY CUP
app.get("/cups/:id/enroll", async (request, response) => {
  const cupId = request.params.id;

  const enrollments = await prisma.enrollment.findMany({
    where: { cupId },
    select: {
      fullName: true,
      nickName: true,
      birthDate: true,
      whatsApp: true,
    },
  });

  return response.status(200).json(enrollments);
});

// CREATE ENROLLMENT
app.post("/cups/:id/enroll", async (request, response) => {
  const cupId = request.params.id;

  const { fullName, nickName, birthDate, whatsApp } = request.body;

  const enrollment = await prisma.enrollment.create({
    data: {
      fullName,
      nickName,
      birthDate,
      whatsApp,
      cupId,
    },
  });

  return response.status(201).json(enrollment);
});

// LIST TEAMS BY CUP
app.get("/cups/:id/teams", async (request, response) => {
  const cupId = Number(request.params.id);

  const teams = await prisma.team.findMany({
    where: { cupId },
    select: {
      name: true,
      players: true,
    },
  });

  return response.status(200).json(
    teams.map((team) => {
      return {
        ...team,
        players: team.players.split(","),
      };
    })
  );
});

// CREATE TEAM
app.post("/cups/:id/teams", async (request, response) => {
  const cupId = Number(request.params.id);

  const { name, players } = request.body;

  const team = await prisma.team.create({
    data: {
      name,
      players: players.join(","),
      cupId,
    },
  });

  return response.status(201).json(team);
});

app.listen(port || 3333, () => {
  console.log("🏃 Running Server");
});
