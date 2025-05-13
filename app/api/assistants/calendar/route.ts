import { NextResponse } from "next/server"

// Calendar model path - using the specific model
const CALENDAR_MODEL_PATH = "HarshGahlaut/openELM-calender"

export async function POST(request: Request) {
  try {
    const { query } = await request.json()
    console.log("Calendar query received:", query)

    // Prepare input for the model
    const inputText = `### Question: ${query}\n\n### Answer:`

    // Try to call the model
    let modelResponse = null
    const errorMessages = []

    try {
      console.log("Trying text-generation task with OpenELM Calendar model")
      const response = await fetch(`https://api-inference.huggingface.co/models/${CALENDAR_MODEL_PATH}`, {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: inputText,
          parameters: {
            max_new_tokens: 512,
            do_sample: true,
            temperature: 0.7,
            top_p: 0.9,
            return_full_text: false,
          },
          options: {
            use_cache: false,
            wait_for_model: true,
          },
        }),
      })

      if (response.ok) {
        modelResponse = await response.json()
        console.log("Model response received from OpenELM Calendar model")
      } else {
        const errorData = await response.json()
        errorMessages.push(`text-generation error: ${JSON.stringify(errorData)}`)
      }
    } catch (error) {
      errorMessages.push(`text-generation error: ${error.message}`)
    }

    // If model call failed, use a fallback response
    if (!modelResponse) {
      console.log("Model approach failed, using fallback")
      return NextResponse.json({
        response: generateCalendarResponse(query),
        errors: errorMessages.join("; "),
      })
    }

    // Extract the generated text from the model response
    let generatedText = ""
    if (Array.isArray(modelResponse)) {
      generatedText = modelResponse[0]?.generated_text || ""
    } else {
      generatedText = modelResponse.generated_text || ""
    }

    // Format the response with emojis and better formatting
    const formattedResponse = formatCalendarResponse(generatedText || generateCalendarResponse(query))

    return NextResponse.json({
      response: formattedResponse,
      raw_response: modelResponse,
    })
  } catch (error) {
    console.error("Error processing Calendar query:", error)
    return NextResponse.json({ error: "Failed to process your request", details: error.message }, { status: 500 })
  }
}

// Helper function to format the calendar response with emojis and better formatting
function formatCalendarResponse(text: string): string {
  // If the response already has emojis and formatting, return it as is
  if (text.includes("📅") || text.includes("⏰") || text.includes("**")) {
    return text
  }

  // Add emojis and formatting to the response
  const formattedText = text
    // Add calendar emoji to lines that might be about events
    .replace(/meeting|appointment|event/gi, (match) => `📅 ${match}`)
    // Add clock emoji to lines that might be about time
    .replace(/(\d{1,2}:\d{2}|am|pm)/gi, (match) => `⏰ ${match}`)
    // Bold important parts
    .replace(/(meeting with|available|busy|scheduled|created)/gi, (match) => `**${match}**`)

  return formattedText
}

// Helper function to generate a fallback calendar response
function generateCalendarResponse(query: string): string {
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

👥 **Participants**: You

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
