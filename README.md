#  AI Productivity App

# ROLE

You are an expert **AI product designer, full-stack web developer, UX/UI designer, and prompt engineer**.

Your responsibility is to design and build a modern, professional, responsive **AI-powered workplace productivity application** using Lovable AI and AI technologies such as ChatGPT/OpenAI.

You must approach the project as a real-world software product rather than a collection of unrelated AI tools.

You should:

* Design a professional SaaS-style user interface.

* Build a functional and responsive web application.

* Implement practical AI-powered workplace automation.

* Apply strong prompt engineering principles.

* Design intuitive user workflows.

* Follow responsible AI practices.

* Ensure all AI features work together inside one integrated platform.

* Prioritise usability, reliability, accessibility and professional presentation.

---

# CONTEXT

The project is an academic and practical demonstration of how Artificial Intelligence can be used to improve workplace productivity and automate repetitive workplace tasks.

The application must demonstrate the following key areas:

### 1. Practical AI Implementation

The application must use AI to solve realistic workplace problems rather than simply displaying a chatbot.

Examples include:

* Automatically generating professional emails.

* Summarising lengthy meeting notes.

* Extracting action items and deadlines.

* Helping users prioritise tasks.

* Creating daily or weekly schedules.

### 2. Prompt Engineering

The application must demonstrate that carefully structured prompts can improve AI output.

AI prompts should provide appropriate:

* Role

* Task

* Context

* Requirements

* Constraints

* Expected output format

AI responses should be structured, useful and relevant to the user's request.

### 3. Real-World Problem Solving

The application should address common workplace problems such as:

* Employees spending too much time writing emails.

* Long meeting notes being difficult to process.

* Important action items being forgotten.

* Employees struggling to prioritise tasks.

* Poor time management and scheduling.

### 4. Responsible AI

The application must clearly communicate that AI is an assistant and that users remain responsible for reviewing AI-generated information.

The application should include a responsible AI disclaimer addressing:

* Accuracy

* Human oversight

* Privacy

* Bias

* Appropriate use of AI-generated content

### 5. Modern UI/UX

The application should look and behave like a modern professional productivity SaaS platform.

It should have:

* Clean navigation

* Consistent design

* Responsive layouts

* Clear input/output areas

* Professional typography

* Appropriate icons

* Good spacing

* Clear buttons and calls to action

* Loading states

* Error states

* Success notifications

---

# OBJECTIVE

Build **ONE integrated AI-powered productivity application** that helps employees automate common workplace tasks using AI.

The application must function as a single platform/dashboard.

It must NOT be designed as three separate applications.

Instead, create one unified application containing multiple AI-powered productivity features that share the same:

* Dashboard

* Sidebar navigation

* User experience

* Authentication

* AI system

* Task information

* AI history

* Settings

* Visual design

The primary objective is to demonstrate how AI can be integrated into a realistic workplace productivity workflow.

The application must include **at least THREE AI-powered features** from the following list.

---

# REQUIRED AI FEATURES

## 1. Smart Email Generator

Create an AI-powered email generator.

The user should provide information such as:

* Email purpose

* Recipient

* Key information

* Desired length

* Tone

Support different tones:

* Formal

* Friendly

* Persuasive

* Professional

* Concise

The AI should generate:

* Email subject

* Professional email body

The user should be able to:

* Generate an email

* Regenerate the response

* Copy the email

* Edit the generated content

* Save the email

The generated email must be clearly identified as AI-generated.

---

# 2. Meeting Notes Summarizer

Create an AI-powered meeting notes summarization feature.

The user should be able to paste long meeting notes into an input section.

The AI should produce a structured output containing:

### Summary

A concise summary of the meeting.

### Key Points

The most important information discussed.

### Decisions

Important decisions made during the meeting.

### Action Items

Tasks that need to be completed.

### Deadlines

Dates or deadlines identified in the meeting notes.

### Responsible People

Where possible, identify who is responsible for each action item.

The interface should allow the user to review the extracted information before saving it.

The application should provide an option to convert identified action items into tasks.

---

# 3. AI Task Planner / Scheduler

Create an AI-powered task planning feature.

The user should be able to enter:

* Tasks

* Deadlines

* Priority

* Available working hours

* Optional estimated task duration

The AI should analyse the information and generate an organised daily or weekly schedule.

The AI should:

* Prioritise urgent tasks.

* Consider deadlines.

* Group related tasks.

* Suggest an efficient task order.

* Identify possible scheduling conflicts.

* Recommend realistic time allocations.

Display the result as a clear schedule.

For example:

**09:00 – 10:00**

Complete monthly report

**10:00 – 10:30**

Respond to client emails

**10:30 – 10:45**

Break

**10:45 – 12:00**

Prepare presentation

Allow the user to review and modify the AI-generated schedule.

---

# APPLICATION STRUCTURE

Create ONE unified application with the following structure:

## Dashboard

Display:

* Welcome message

* Today's tasks

* Upcoming deadlines

* AI productivity suggestions

* Recent AI activity

* Quick access to AI tools

Provide clear buttons for the main AI features.

---

## Sidebar Navigation

Create a responsive sidebar containing:

* Dashboard

* AI Assistant

* Email Generator

* Meeting Summarizer

* Task Planner

* AI History

* Settings

The sidebar should remain consistent throughout the application.

On mobile devices, convert it into an appropriate mobile navigation system.

---

# RESPONSIVE DESIGN

The application must work correctly on:

* Desktop

* Laptop

* Tablet

* Mobile phone

Layouts should automatically adapt to different screen sizes.

Do not simply shrink the desktop layout.

Design appropriate mobile layouts and navigation.

---

# INPUT AND OUTPUT SECTIONS

Each AI feature should have a clear input/output structure.

For example:

### Input

User enters information.

↓

### AI Processing

The application sends the structured request to the AI.

↓

### Output

The AI-generated result is displayed.

↓

### User Review

The user reviews and edits the result.

↓

### Save / Copy / Apply

The user chooses what to do with the result.

Users must always remain in control of AI-generated content.

---

# AI RESPONSE DESIGN

AI-generated responses should be displayed using professional cards or structured sections.

Include appropriate:

* Loading indicators

* Error messages

* Empty states

* Regenerate buttons

* Copy buttons

* Save buttons

Clearly label AI-generated content.

Use:

**"AI-generated content — review before use."**

near AI responses.

---

# PROMPT ENGINEERING

Implement structured prompts for each AI feature.

Do not use vague prompts such as:

"Write an email."

Instead, structure prompts using:

### ROLE

Define what the AI should act as.

Example:

"You are a professional workplace communication assistant."

### OBJECTIVE

Explain what the AI needs to accomplish.

### CONTEXT

Provide relevant information from the user.

### REQUIREMENTS

Specify the desired characteristics of the response.

### CONSTRAINTS

Specify limitations such as length, tone or format.

### OUTPUT FORMAT

Clearly specify how the AI should structure the response.

The application should use different structured prompts for:

* Email generation

* Meeting summarisation

* Task scheduling

---

# RESPONSIBLE AI

Include a visible Responsible AI disclaimer within the application.

The disclaimer should communicate:

### Human Oversight

AI-generated content must be reviewed by a human before being used for important workplace decisions.

### Accuracy

AI may generate incorrect or incomplete information.

Users should verify important information.

### Privacy

Users should avoid entering confidential, sensitive or unnecessary personal information.

### Bias

AI-generated recommendations may contain biases and should be reviewed critically.

### Transparency

AI-generated content should be clearly identified.

The application must not imply that AI decisions are automatically correct.

---

# DATA AND USER CONTROL

Users should be able to:

* Review AI-generated content.

* Edit AI-generated content.

* Regenerate responses.

* Copy responses.

* Save useful responses.

* Delete saved information.

Important actions should require user confirmation.

AI should recommend actions rather than silently performing consequential actions.

---

# UI/UX DESIGN

Create a professional modern SaaS interface.

Use:

* Clean dashboard cards

* Consistent spacing

* Modern typography

* Rounded components

* Professional icons

* Subtle animations

* Clear hierarchy

* Accessible colour contrast

* Responsive layouts

The application should look like a commercial AI productivity platform.

Avoid making it look like a basic school project.

---

# FUNCTIONALITY

The application should have working:

* Navigation

* Forms

* Buttons

* AI interactions

* Input validation

* Loading states

* Error handling

* Save functionality

* Copy functionality

* Regeneration functionality

* Responsive navigation

Do not create buttons that appear functional but do nothing.

If an AI API is required, structure the application so API keys are not exposed in frontend code.

---

# INNOVATION

Add small innovative features where appropriate, such as:

* AI productivity suggestions

* One-click conversion of meeting action items into tasks

* AI-generated priority recommendations

* Quick prompt suggestions

* AI history

* Smart follow-up suggestions

* Productivity insights

These features should enhance the required functionality rather than turn the project into multiple separate applications.

---

# FINAL SUCCESS CRITERIA

The final application should demonstrate:

1. **Problem Relevance**

   * Solves realistic workplace productivity problems.

2. **Prompt Engineering Quality**

   * Uses structured, context-aware AI prompts.

3. **Functionality**

   * AI features actually perform useful tasks.

4. **Innovation**

   * Goes beyond a basic chatbot and integrates AI into workplace workflows.

5. **Responsible AI**

   * Includes human oversight, privacy, accuracy and transparency principles.

6. **Presentation Quality**

   * Provides a polished, modern, professional and responsive UI.

Most importantly, the final result must clearly be **ONE integrated AI-powered productivity application**, not multiple unrelated projects.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://workflow-whisper-50.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f5fff95f-fa56-4d31-a9e6-88b72530fdf3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
