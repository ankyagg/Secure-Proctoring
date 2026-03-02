Design a modern, clean, web-based DSA Online Coding Contest Platform UI similar to HackerRank / CodeChef but simpler and student-friendly.

Style & Theme

Professional exam environment

Light theme with subtle dark accents

Clean typography, minimal distractions

Use card-based layout, rounded corners

Highlight timers, warnings, and verdicts clearly

User Roles

Student (Contest Participant)

Admin (Contest & Question Manager)

STUDENT SCREENS

1. Contest Lobby Page

Contest name, description

Start time / End time

Rules section (fullscreen required, tab switching monitored, webcam on)

“Enter Contest” button

2. Contest Problem List Page

List of problems (A, B, C…)

Difficulty tags (Easy / Medium / Hard)

Status indicator (Unattempted / Attempted / Solved)

Contest timer fixed at top

3. Coding Workspace (Main Exam Screen)

Top bar with:

Platform logo

Contest name

Countdown timer

Warning indicator (anti-cheat)

Left panel:

Problem statement

Input / Output format

Constraints

Right panel:

Code editor area (Monaco-style)

Language selector (C++, Java, Python)

Run and Submit buttons

Bottom panel:

Output / verdict console

Small webcam preview fixed at bottom-right corner

4. Submission Result Modal

Verdict badge (Accepted, Wrong Answer, TLE, MLE)

Test cases passed

Execution time

Memory used

5. Leaderboard Page

Rank table with:

Rank

Username

Problems solved

Total score

Penalty time

Live updating indicator

Highlight current user

ADMIN DASHBOARD SCREENS

6. Admin Overview Dashboard

Total contests

Active contests

Total participants

Submissions count

System health status

7. Contest Management Page

Create / Edit / Delete contests

Set start time, end time, duration

Enable / disable anti-cheat features

8. Question Management Page

Add new question

Fields:

Title

Problem statement

Constraints

Time limit

Memory limit

Upload test cases

Add boilerplate code per language

9. Submissions Monitoring Page

Live submissions table

User name

Problem

Verdict

Execution time

Language

10. Anti-Cheat Monitoring Page

Real-time violation logs

Events:

Tab switch

Fullscreen exit

Camera off

Multiple faces detected

Suspicion score per user

Manual override / warning buttons

UX Notes

Clear visual hierarchy

Sticky timer and warnings

Minimal animations

Designed for long exam usage (low eye strain)

Deliverables

Desktop web UI

Consistent component system

Reusable cards, tables, modals, buttons