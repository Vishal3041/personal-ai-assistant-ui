import { ChatOpenAI } from "@langchain/openai"
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents"
import { pull } from "langchain/hub"
import { LangchainToolSet } from "composio-core"

// Initialize the language model
export const initializeCalendarAgent = async () => {
  try {
    const llm = new ChatOpenAI({
      model: process.env.MODEL || "gpt-4o",
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Define tools for the agents
    const composioToolset = new LangchainToolSet({
      apiKey: process.env.COMPOSIO_API_KEY,
    })

    // Get calendar tools
    const tools = await composioToolset.getTools({
      actions: ["googlecalendar_create_event", "googlecalendar_list_events"],
    })

    // Get the prompt
    const prompt = await pull("hwchase17/openai-functions-agent")

    // Create the agent
    const agent = await createOpenAIFunctionsAgent({
      llm,
      tools,
      prompt,
    })

    // Return the agent executor
    return new AgentExecutor({
      agent,
      tools,
      verbose: true,
    })
  } catch (error) {
    console.error("Error initializing calendar agent:", error)
    throw new Error(`Failed to initialize calendar agent: ${error.message}`)
  }
}

// Helper functions
export const getCurrentDate = () => new Date().toISOString().split("T")[0]

export const getTimezone = () => {
  const timezone = new Date().toLocaleTimeString("en-us", { timeZoneName: "short" }).split(" ")[2]
  // Convert to IANA format
  switch (timezone) {
    case "PDT":
    case "PST":
      return "America/Los_Angeles"
    case "EDT":
    case "EST":
      return "America/New_York"
    case "CDT":
    case "CST":
      return "America/Chicago"
    case "MDT":
    case "MST":
      return "America/Denver"
    default:
      return timezone
  }
}
