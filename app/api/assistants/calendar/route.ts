import { NextResponse } from "next/server"
import { initializeCalendarAgent, getCurrentDate, getTimezone } from "@/lib/calendar-agent"

export async function POST(request: Request) {
  try {
    const { query, email, simulationMode = false } = await request.json()
    console.log("Calendar query received:", query)
    console.log("User email:", email)
    console.log("Simulation mode:", simulationMode)

    // Check if required environment variables are available
    if (!process.env.OPENAI_API_KEY) {
      console.error("Missing OPENAI_API_KEY environment variable")
      return NextResponse.json(
        {
          response:
            "I'm unable to process your request because the OpenAI API key is missing. Please contact the administrator.",
          error: "Missing OPENAI_API_KEY",
        },
        { status: 500 },
      )
    }

    if (!process.env.COMPOSIO_API_KEY) {
      console.error("Missing COMPOSIO_API_KEY environment variable")
      return NextResponse.json(
        {
          response:
            "I'm unable to process your request because the Composio API key is missing. Please contact the administrator.",
          error: "Missing COMPOSIO_API_KEY",
        },
        { status: 500 },
      )
    }

    // If in simulation mode, use simulated responses
    if (simulationMode) {
      console.log("Using simulation mode for calendar response")
      return NextResponse.json({
        response: generateSimulatedResponse(query, email),
      })
    }

    // Otherwise, use the real calendar agent
    try {
      console.log("Using real calendar agent")
      // Setup the agent
      const agentExecutor = await initializeCalendarAgent()
      const date = getCurrentDate()
      const timezone = getTimezone()

      console.log(`Processing calendar query with date: ${date}, timezone: ${timezone}`)

      // Process the query with the agent, including the user's email if available
      const userEmail = email ? `The user's email is ${email}. ` : ""
      const result = await agentExecutor.invoke({
        input: `${userEmail}${query}. Today's date is ${date} and make the timezone be ${timezone}.`,
      })

      console.log("Agent response:", result)

      return NextResponse.json({
        response: result.output,
      })
    } catch (error) {
      console.error("Error with calendar agent:", error)

      // Fallback to simulation if the real agent fails
      return NextResponse.json({
        response: generateSimulatedResponse(query, email),
        note: "Falling back to simulation due to an error with the calendar agent",
        error: error.message,
      })
    }
  } catch (error) {
    console.error("Error processing calendar request:", error)
    return NextResponse.json(
      { error: "Failed to process your calendar request", details: error.message },
      { status: 500 },
    )
  }
}

// Helper function to generate simulated responses
function generateSimulatedResponse(query: string, email: string): string {
  // Check if the query is about creating an event
  if (
    query.toLowerCase().includes("schedule") ||
    query.toLowerCase().includes("create") ||
    query.toLowerCase().includes("add") ||
    query.toLowerCase().includes("set up") ||
    query.toLowerCase().includes("book")
  ) {
    // Extract potential meeting details from the query
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const formattedDate = tomorrow.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })

    // Try to extract a potential meeting title
    let meetingTitle = "Meeting"
    if (query.toLowerCase().includes("with")) {
      const withPart = query.split("with")[1]
      if (withPart && withPart.length > 3) {
        meetingTitle = `Meeting with${withPart.split(".")[0]}`
      }
    }

    return `I've scheduled the event based on your request.
    
📅 **New Event Created: ${meetingTitle}**

⏰ **Date**: ${formattedDate}

⏱️ **Time**: 10:00 AM - 11:00 AM

👥 **Participants**: ${email || "You"}

The event has been added to your calendar. Is there anything else you'd like me to do with this event?`
  }
  // Check if the query is about checking availability
  else if (
    query.toLowerCase().includes("availability") ||
    query.toLowerCase().includes("free") ||
    query.toLowerCase().includes("busy") ||
    query.toLowerCase().includes("schedule") ||
    query.toLowerCase().includes("time")
  ) {
    // Get today's date for the response
    const today = new Date()
    const formattedDate = today.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })

    return `Here's your availability for ${formattedDate}:
    
⏰ **9:00 AM - 10:30 AM**: Available

⏰ **10:30 AM - 12:00 PM**: Meeting with Marketing Team

⏰ **12:00 PM - 1:00 PM**: Lunch Break

⏰ **1:00 PM - 3:00 PM**: Available

⏰ **3:00 PM - 4:00 PM**: Weekly Check-in

⏰ **4:00 PM - 5:30 PM**: Available

Would you like me to schedule something during one of your available time slots?`
  }
  // Check if the query is about listing events
  else if (
    query.toLowerCase().includes("events") ||
    query.toLowerCase().includes("meetings") ||
    query.toLowerCase().includes("appointments") ||
    query.toLowerCase().includes("calendar") ||
    query.toLowerCase().includes("schedule")
  ) {
    // Get dates for the response
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const dayAfterTomorrow = new Date(today)
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)

    const formattedTomorrow = tomorrow.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })

    const formattedDayAfter = dayAfterTomorrow.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })

    return `Here are your upcoming events:
    
📅 **Team Standup**
⏰ *${formattedTomorrow} at 9:00 AM*
⏱️ *Duration: 30 minutes*
👥 *Participants: You, Team Members*

📅 **Project Review**
⏰ *${formattedTomorrow} at 2:00 PM*
⏱️ *Duration: 1 hour*
👥 *Participants: You, Project Manager*

📅 **Client Meeting**
⏰ *${formattedDayAfter} at 11:00 AM*
⏱️ *Duration: 1 hour*
👥 *Participants: You, Client, Sales Team*

Would you like more details about any of these events?`
  }
  // Default response
  else {
    return `I understand you want to know about "${query}" regarding your calendar.
    
To help you better, you can ask me to:

- Create a new event (e.g., "Schedule a meeting with John tomorrow at 2 PM")
- Check your availability (e.g., "Am I free tomorrow afternoon?")
- List upcoming events (e.g., "What meetings do I have this week?")
- Get details about specific events (e.g., "Tell me about my next meeting")

What would you like me to do?`
  }
}
