Project Brief: Abacus Learning Tool
1. Project Overview
The Abacus Learning Tool is an interactive online platform designed to assist students in mastering the Soroban (Japanese abacus). The primary goal is to provide a practice environment where students can develop their abacus skills by working through randomly generated arithmetic problems. The tool supports various operations including addition/subtraction, multiplication, and division, with a key feature being the ability to restrict questions to specific Soroban formulas. This allows for a focused learning approach, enabling students to practice and master one formula at a time.

2. Main Features
Random Question Generation:

Generates unique arithmetic problems for addition/subtraction, multiplication, and division.

Utilizes a seeded random number generator for reproducibility if needed (seedrandom).

Formula-Specific Practice:

Allows questions to be filtered based on specific Soroban formulas, aiding in targeted learning and practice.

Interactive Abacus Display:

Features a digital Soroban abacus, rendered on an HTML canvas, for students to input answers.

Worksheet Generation:

Physical Worksheets: Generates printable PDF worksheets tailored to selected question types and settings, using jsPDF.

Digital Worksheets: Creates shareable links to digital worksheets with a fixed set of questions for consistent practice among students. Settings for these worksheets are compressed and encoded in the URL.

Customizable Settings:

Users can adjust various parameters for question generation, such as the number of terms, digit counts, and specific formulas via a dedicated settings page.

Settings are persisted in localStorage using a SettingsProvider.

3. Architecture & Technology Stack
Framework: Next.js (App Router)

Language: TypeScript

UI Components: React, Shadcn UI, Lucide Icons

Styling: Tailwind CSS with a custom theme.

State Management: React Context API (SettingsProvider).

Linting & Formatting: ESLint (with Next.js core web vitals and TypeScript configurations).

Code Standards: Project-specific code quality standards and best practices are outlined in .roo/rules/code-standards.md.

Deployment: Intended for Vercel (as per Next.js template).

4. Current Status & Immediate Next Steps
The core features outlined above are mostly implemented. The immediate focus for development includes:

Code Refactoring:

Reduce code duplication across components and utility functions.

Improve separation of concerns and modularity.

Documentation:

Enhance inline code comments and generate more comprehensive documentation for developers.

Bug Fixing and Polishing:

Address any outstanding bugs and refine the user experience.

5. Future Roadmap
The long-term vision for the Abacus Learning Tool includes features to enhance student engagement, progress tracking, and administrative oversight:

User Authentication:

Implement a login system for students and administrators.

Student Progress Tracking:

Allow students to track their performance, completed worksheets, and areas needing improvement.

Personalized Practice Plans:

Enable students or administrators to create and follow specific practice plans tailored to individual learning needs.

Administrator Dashboard:

Provide administrators with tools to review student activity, including:

Questions answered.

Step-by-step playback of abacus manipulations for individual questions.

Lesson Plan Integration:

Develop or integrate generalized lesson plans that students can follow, potentially assigned or managed by administrators.