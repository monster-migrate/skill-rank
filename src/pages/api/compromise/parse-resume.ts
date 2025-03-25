import nlp from "compromise";
import nlpDates from "compromise-dates";
import { NextApiRequest, NextApiResponse } from "next";
import skillsList from "@/lib/datasets/skills.json";
import degreesList from "@/lib/datasets/degrees.json";

nlp.extend(nlpDates);
export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    let text = String(req.body.text || "").trim();
    if (!text) {
        return res.status(400).json({ error: "No text provided" });
    }
    text = text.replace(/[.,;●]/g, " ");
    const doc = nlp(text);

    const name: string = doc.nouns().out("array")[0];
    const emails: string[] = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    const phoneNumbers: string[] = text.match(/(?:\+91[-\s]?)?[6789]\d{9}/g) || [];
    const textTokens = new Set(doc.terms().out("array").map((word: string) => word.toLowerCase()));
    const skills: string[] = skillsList.filter((skill) => textTokens.has(skill.toLowerCase()));

    const degreeLookup = new Set(
        degreesList.flatMap(({ degree, abbreviation }) => [degree.toLowerCase(), abbreviation.toLowerCase()])
    );
    const extractedDegrees = [...textTokens].filter(token => degreeLookup.has(token));

    const institutionPattern = /\b[A-Z][a-zA-Z&. ]+\s(?:University|College|Institute|School)\b/g;
    const institutions: string[] = text.match(institutionPattern) || [];

    const education: { degree: string; institution: string | null }[] = extractedDegrees.map((degree) => {
        let closestInstitution: string | null = null;
        let minDistance = Infinity;
        institutions.forEach((institution) => {
            const degreePos = text.indexOf(degree);
            const instPos = text.indexOf(institution);
            const distance = Math.abs(degreePos - instPos);
            if (distance < minDistance) {
                minDistance = distance;
                closestInstitution = institution;
            }
        });
        return { degree, institution: closestInstitution };
    });

    const experience: { company: string; title: string | null; duration: string | null; responsibilities: string[] }[] = [];
    let currentCompany: string | null = null;
    let currentTitle: string | null = null;
    let currentDuration: string | null = null;
    let currentResponsibilities: string[] = [];

    const lines = text.split("\n");
    lines.forEach((line) => {
        line = line.trim();
        if (line.split(" ").length < 5) {
            if (currentCompany) {
                experience.push({
                    company: currentCompany,
                    title: currentTitle,
                    duration: currentDuration,
                    responsibilities: currentResponsibilities
                });
            }
            currentCompany = line;
            currentTitle = null;
            currentDuration = null;
            currentResponsibilities = [];
        } else if (/\b(UI\/UX|Software|Frontend|Backend|Machine Learning|Data|Engineer|Developer|Analyst|Manager|Intern|Volunteer|Researcher|Scientist)\b/i.test(line)) {
            currentTitle = line;
        } else if (/\b\d{4}\s*[-–]\s*(?:\d{4}|ongoing)\b/.test(line)) {
            currentDuration = line.match(/\b\d{4}\s*[-–]\s*(?:\d{4}|ongoing)\b/)?.[0] || null;
        } else {
            currentResponsibilities.push(line);
        }
    });

    if (currentCompany) {
        experience.push({
            company: currentCompany,
            title: currentTitle,
            duration: currentDuration,
            responsibilities: currentResponsibilities
        });
    }

    res.status(200).json({
        name: name,
        emails: emails,
        phoneNumbers: phoneNumbers,
        skills: skills,
        education: education,
        experience: experience
    });
}
