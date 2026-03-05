import { getModules, type Module } from "./studiesData";
import { format, addDays } from "date-fns";

// Deterministic Random Number Generator
// Linear Congruential Generator (LCG) parameters
const LCG_A = 1664525;
const LCG_C = 1013904223;
const LCG_M = 4294967296;
let currentSeed = 123456789;

function seededRandom() {
    currentSeed = (LCG_A * currentSeed + LCG_C) % LCG_M;
    return currentSeed / LCG_M;
}

export interface Course {
    id: string;
    moduleId: string;
    title: string;
    building: string;
    room: string;
    startTime: string; // e.g. "9:00 AM"
    endTime: string;   // e.g. "11:00 AM"
    date: string;      // YYYY-MM-DD
    isCancelled?: boolean;
    type: "Commun" | "Spécialisé";
    tagFiliere: string; // "Tronc Commun", "Marketing", "Finance", "Data", "Autres"
    dayIndex?: number;
}

export function generateSemesterSchedule(modules: Module[]): Course[] {
    // Reset the seed every time we generate the schedule so the result is exactly the same
    currentSeed = 123456789;

    const courses: Course[] = [];
    const coursedCounts: Record<string, number> = {};
    modules.forEach(m => coursedCounts[m.id] = 0);

    let currentDate = new Date('2026-01-05'); // First Monday of Jan 2026
    const endDate = new Date('2026-06-30');
    let idCounter = 1;

    const slots = [
        { s: "09h00", e: "11h00" },
        { s: "11h15", e: "13h15" },
        { s: "14h30", e: "16h30" },
        { s: "17h00", e: "19h00" } // Slightly shifted to avoid 4:45 which is less realistic
    ];

    const buildings = [
        { b: "Bat. A", r: "Amphi A" }, { b: "Bat. A", r: "Amphi B" },
        { b: "Bat. B", r: "Amphi C" }, { b: "Bat. B", r: "Salle 10" },
        { b: "Bat. C", r: "Labo 1" }, { b: "Bat. C", r: "Labo 2" }
    ];

    const filieres = ["Marketing", "Finance", "Data", "Supply Chain", "Entrepreneuriat", "Cyber"];

    while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday to Friday
            const dateStr = format(currentDate, 'yyyy-MM-dd');

            slots.forEach((slot, slotIndex) => {
                // 50% chance of Tronc Commun, 50% chance of Spécialité
                const isTC = seededRandom() < 0.50;

                if (isTC) {
                    const tcModules = modules.filter(m => m.type === "Commun" && coursedCounts[m.id] < m.totalCourses);
                    if (tcModules.length > 0) {
                        // Sort by coursedCounts to prioritize modules with fewer courses scheduled
                        tcModules.sort((a, b) => coursedCounts[a.id] - coursedCounts[b.id]);
                        // Pick from the first few to keep it somewhat random but balanced
                        const range = Math.min(3, tcModules.length);
                        const m = tcModules[Math.floor(seededRandom() * range)];

                        const loc = buildings[Math.floor(seededRandom() * buildings.length)];
                        courses.push({
                            id: `c-${idCounter++}`,
                            moduleId: m.id,
                            title: m.name,
                            building: loc.b,
                            room: loc.r,
                            startTime: slot.s,
                            endTime: slot.e,
                            date: dateStr,
                            type: m.type,
                            tagFiliere: m.tagFiliere
                        });
                        coursedCounts[m.id]++;
                    }
                } else {
                    // For Spécialités, we schedule classes for multiple filieres in parallel!
                    filieres.forEach(fil => {
                        const speModules = modules.filter(m => m.tagFiliere === fil && coursedCounts[m.id] < m.totalCourses);
                        if (speModules.length > 0) {
                            // 70% chance to run a class for THIS specific filiere in THIS slot
                            if (seededRandom() < 0.7) {
                                // Balance within the filiere
                                speModules.sort((a, b) => coursedCounts[a.id] - coursedCounts[b.id]);
                                const range = Math.min(2, speModules.length);
                                const m = speModules[Math.floor(seededRandom() * range)];

                                const loc = buildings[Math.floor(seededRandom() * buildings.length)];
                                courses.push({
                                    id: `c-${idCounter++}`,
                                    moduleId: m.id,
                                    title: m.name,
                                    building: loc.b,
                                    room: loc.r,
                                    startTime: slot.s,
                                    endTime: slot.e,
                                    date: dateStr,
                                    type: m.type,
                                    tagFiliere: m.tagFiliere
                                });
                                coursedCounts[m.id]++;
                            }
                        }
                    });
                }
            });
        }
        currentDate = addDays(currentDate, 1);
    }

    return courses;
}

export const getCourses = (): Course[] => {
    const stored = localStorage.getItem("scheduleCourses_v7");
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error("Failed to parse courses from DB", e);
        }
    }
    // Initialize by generating a whole semester schedule
    const modules = getModules();
    const generated = generateSemesterSchedule(modules);
    localStorage.setItem("scheduleCourses_v7", JSON.stringify(generated));
    return generated;
};

export const saveCourses = (courses: Course[]) => {
    localStorage.setItem("scheduleCourses_v7", JSON.stringify(courses));
};
