import { NextResponse } from "next/server";
import { z } from "zod";

const chatSchema = z.object({
    message: z.string().min(1),
});

const RESPONSES = {
    ASSIGNMENT: [
        "For assignments, ensure you:\n1. Read requirements carefully.\n2. Start early.\n3. Check the due date on LMS.\n4. Do not copy-paste; plagiarism is strictly prohibited.\n\nNeed help with a specific subject assignment?",
        "When working on assignments, always double-check the marking scheme. It helps you focus on what's important. Do you have a specific question?",
        "Pro tip: submitting assignments a few hours before the deadline avoids last-minute technical glitches. How can I help you with your current assignment?",
        "Make sure to reference your sources correctly to avoid plagiarism. Is there a specific concept you're stuck on?"
    ],
    EXAM: [
        "Exam Tips:\n- Focus on handouts/PPTs.\n- Practice MCQs from past papers.\n- Manage your time during the exam.\n- Ensure your date sheet is created on time via the VULMS link.\n\nGood luck!",
        "Preparation is key! Try to explain concepts to yourself out loud; it helps retention. Which subject are you preparing for?",
        "Don't forget to take breaks while studying. The Pomodoro technique (25min work, 5min break) works wonders. Need help with a specific topic?",
        "Reviewing your quizzes and assignments is a great way to prepare for exams. They often cover similar concepts."
    ],
    GDB: [
        "GDB tips:\n- Keep your answer concise and to the point.\n- Avoid irrelevant details.\n- Post before the deadline.\n- Check for grammatical errors.",
        "For a good GDB score, make sure your argument is logical and well-supported. Don't just copy from the internet.",
        "Read others' posts if visible to understand the discussion flow, but ensure your contribution is unique. What's the topic?",
        "GDBs are about quality, not quantity. A short, well-reasoned answer is better than a long, vague one."
    ],
    GREETING: [
        "Hello! I'm your VU AI assistant. What would you like to explore today?",
        "Hi there! Ready to study? Ask me anything about your courses or VU policies.",
        "Greetings! How can I assist you with your academic journey today?",
        "Welcome back! What's on your mind? Assignments, exams, or just general advice?"
    ],
    DEFAULT: [
        "I can help with assignments, exams, GDBs, and general academic queries. Please ask a specific question regarding your studies at VU.",
        "I'm here to support your learning. Could you please provide more details so I can give you the best advice?",
        "That's interesting. Could you clarify how this relates to your course or VU policies? I want to make sure I give you the right information.",
        "I'm not sure I fully understand. Are you asking about an administrative issue or an academic concept?"
    ]
};

const getRandomResponse = (category: keyof typeof RESPONSES) => {
    const responses = RESPONSES[category];
    return responses[Math.floor(Math.random() * responses.length)];
};

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { message } = chatSchema.parse(body);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Logic (moved from client)
        const lowerMessage = message.toLowerCase();
        let responseText = "";

        if (lowerMessage.includes('assignment') || lowerMessage.includes('homework')) {
            responseText = getRandomResponse('ASSIGNMENT');
        } else if (lowerMessage.includes('exam') || lowerMessage.includes('papers') || lowerMessage.includes('test')) {
            responseText = getRandomResponse('EXAM');
        } else if (lowerMessage.includes('gdb') || lowerMessage.includes('discussion')) {
            responseText = getRandomResponse('GDB');
        } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            responseText = getRandomResponse('GREETING');
        } else {
            responseText = getRandomResponse('DEFAULT');
        }

        return NextResponse.json({ message: responseText });

    } catch (error) {
        return new NextResponse(JSON.stringify({ message: "Failed to process message" }), { status: 500 });
    }
}
