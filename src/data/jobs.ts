import { JobDictionary } from "../core/jobs";
import jobsJson from "./jobs.json";

export const jobs: JobDictionary = jobsJson.reduce((acc, job) => {
    acc[job.id] = job as JobDictionary[keyof JobDictionary];
    return acc;
}, {} as JobDictionary);
