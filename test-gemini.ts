import { askGeminiForScope } from "./lib/gemini";
// No dotenv import needed, environment variables loaded externally

const test = async () => {
  try {
    const scope = await askGeminiForScope({
      title: "Test Project",
      domain: "Development",
      projectDescription: "A simple project",
      projectProblem: "Solving a problem",
      targetUsers: "Everyone",
      userJourney: "They click a button",
      managedEntities: "Users",
      specialRequirements: "None",
      successCriteria: "It works"
    });
    console.log(JSON.stringify(scope, null, 2));
  } catch (err: any) {
    console.error("FAILED:");
    console.error(err.message);
  }
};

test();
