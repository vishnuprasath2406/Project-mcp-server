🚀 PlacePilot — AI-Queryable Placement Management Console

<p align="center">
  <strong>A live placement management system powered by FastAPI, FastMCP and Model Context Protocol (MCP).</strong>
</p>

<p align="center">
  <a href="https://project-mcp-server.onrender.com/">
    <img src="https://img.shields.io/badge/🌐_Live_Project-Open_App-orange?style=for-the-badge" alt="Live Project">
  </a>
</p>

🌐 Live Demo

👉 Open PlacePilot

MCP Endpoint:

https://project-mcp-server.onrender.com/mcp

PlacePilot is deployed online and provides a web-based placement dashboard together with an MCP endpoint that can be connected to compatible AI tools.

📌 About The Project

PlacePilot is a full-stack placement management console designed to provide a centralized platform for managing and querying student placement information.

The system combines a traditional web dashboard with a Model Context Protocol (MCP) server, allowing compatible AI assistants to interact with live placement data using natural language.

Instead of manually searching through student records, users can ask questions such as:

What is the CGPA of CS101?

What is the attendance percentage of CS101?

Does CS101 have any backlogs?

Is CS101 eligible for TCS?

List the upcoming placement drives.

The MCP server processes these requests through custom tools and retrieves the required information from the placement data.

🎯 Problem Statement

Placement coordinators and students often need to work with multiple pieces of information such as:

Student attendance

CGPA

Backlogs

Placement eligibility

Company requirements

Placement drive schedules

When this information is maintained separately, checking eligibility or finding student information can become a manual process.

PlacePilot addresses this by providing a single source of truth for placement information and making that information accessible through both:

A web-based dashboard

AI assistants through MCP

💡 Solution

PlacePilot provides a centralized placement management system where users can:

Manage student records

Manage placement drives

View attendance and CGPA

Track backlogs

Check placement eligibility

Query placement information using AI

Access the database through a web interface

The MCP layer allows AI-compatible applications to interact with the same underlying placement data.

                 User
                   │
                   ▼
          ┌─────────────────┐
          │   Web Dashboard │
          └────────┬────────┘
                   │
                   ▼
          ┌─────────────────┐
          │ Placement Data  │
          │    / Database   │
          └────────┬────────┘
                   ▲
                   │
          ┌────────┴────────┐
          │   MCP Server    │
          │    FastMCP      │
          └────────┬────────┘
                   │
                   ▼
          ┌─────────────────┐
          │  AI Assistant   │
          │ Claude / MCP    │
          │    Clients      │
          └─────────────────┘

✨ Key Features

👨‍🎓 Student Management

The database dashboard provides functionality to manage student information.

Add student records

View student records

Edit student records

Delete student records

View CGPA

View attendance

Track backlogs

Manage placement-related information

🏢 Placement Drive Management

Placement drives can be managed through the web dashboard.

The system can store information such as:

Company name

Placement drive date

Minimum CGPA

Eligibility requirements

Other placement-related information

🤖 MCP Integration

One of the main features of PlacePilot is its integration with the Model Context Protocol (MCP).

MCP allows AI applications to interact with external tools and data sources in a standardized way.

PlacePilot exposes placement-related functionality through an MCP server.

MCP Endpoint

https://project-mcp-server.onrender.com/mcp

This endpoint can be used by compatible MCP clients.

🛠️ Custom MCP Tools

PlacePilot provides custom tools for retrieving and processing placement information.

1. get_attendance

Retrieves attendance information for a student.

Example:

What is the attendance percentage of CS101?

2. get_cgpa

Retrieves the CGPA of a student.

Example:

What is the CGPA of CS101?

3. check_eligibility

Checks whether a student meets the eligibility requirements for a placement drive.

Example:

Is CS101 eligible for TCS?

The system checks the available student information and placement requirements before returning the result.

4. list_placement_drives

Retrieves available or upcoming placement drives.

Example:

What placement drives are coming up?

🔄 How It Works

A typical AI query follows this flow:

User asks a question
        │
        ▼
AI Assistant
        │
        ▼
MCP Protocol
        │
        ▼
PlacePilot MCP Server
        │
        ▼
Custom MCP Tool
        │
        ▼
Placement Data
        │
        ▼
Result
        │
        ▼
AI Assistant
        │
        ▼
Natural Language Response

Example

User:
"Is CS101 eligible for TCS?"

        ↓

AI identifies the required information

        ↓

check_eligibility()

        ↓

Student data + TCS requirements

        ↓

Eligibility calculation

        ↓

Result returned to AI

        ↓

Natural language answer

🖥️ Web Dashboard

PlacePilot also provides a web interface for directly managing the data.

The dashboard includes:

Student statistics

Placement drive statistics

Student records

Placement drive records

Database browser

CRUD operations

Responsive UI

Light/Dark theme

The dashboard and MCP server work with the same placement data.

🌙 Dark Mode

The application supports both:

☀️ Light Mode

🌙 Dark Mode

The selected theme is persisted so that the interface maintains the user's preferred appearance while navigating between pages.

📊 Dashboard

The dashboard provides an overview of the placement database.

It can display information such as:

Students
Placement Drives
Average CGPA
Recent Students
Upcoming Drives

This provides a quick overview of the current placement data.

🗄️ Database Browser

The database browser provides a direct interface for managing placement records.

Users can:

Create
  ↓
Read
  ↓
Update
  ↓
Delete

student and placement-drive records.

Changes made through the dashboard become available to the other parts of the application using the same underlying data source.

🧰 Technology Stack

Backend

Python

FastAPI

FastMCP

Frontend

HTML5

JavaScript

Alpine.js

Tailwind CSS

AI Integration

Model Context Protocol (MCP)

MCP-compatible AI assistants

Deployment

Render

🏗️ Project Architecture

┌──────────────────────────────────────────┐
│              PlacePilot                  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │          Web Application           │  │
│  │                                    │  │
│  │  Dashboard                         │  │
│  │  Database Browser                  │  │
│  │  Student Management                │  │
│  │  Placement Drive Management        │  │
│  └────────────────┬───────────────────┘  │
│                   │                      │
│                   ▼                      │
│  ┌────────────────────────────────────┐  │
│  │          Backend / API             │  │
│  │                                    │  │
│  │             FastAPI                │  │
│  └────────────────┬───────────────────┘  │
│                   │                      │
│                   ▼                      │
│  ┌────────────────────────────────────┐  │
│  │             FastMCP                │  │
│  │                                    │  │
│  │  get_attendance                    │  │
│  │  get_cgpa                          │  │
│  │  check_eligibility                 │  │
│  │  list_placement_drives             │  │
│  └────────────────┬───────────────────┘  │
│                   │                      │
│                   ▼                      │
│  ┌────────────────────────────────────┐  │
│  │        Placement Data              │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘

📂 Project Structure

PlacePilot/
│
├── static/
│   ├── style.css
│   └── app.js
│
├── templates/
│   ├── index.html
│   ├── browser.html
│   └── connect.html
│
├── main.py
├── requirements.txt
├── README.md
└── ...

The exact structure may vary depending on the current version of the repository.

🚀 Getting Started

Prerequisites

Make sure you have installed:

Python 3.10+

Git

pip

1. Clone the Repository

git clone https://github.com/vishnuprasath2406/YOUR-REPOSITORY-NAME.git
cd YOUR-REPOSITORY-NAME

2. Create a Virtual Environment

Windows

python -m venv venv
venv\Scripts\activate

Linux / macOS

python3 -m venv venv
source venv/bin/activate

3. Install Dependencies

pip install -r requirements.txt

4. Run the Application

Depending on the project's entry point:

uvicorn main:app --reload

The application should then be available at:

http://127.0.0.1:8000

🌐 Production Deployment

PlacePilot is deployed using Render.

Live Application

👉 https://project-mcp-server.onrender.com/

MCP Endpoint

👉 https://project-mcp-server.onrender.com/mcp

The live application can be accessed directly through the browser.

🔌 Connecting an AI Assistant

PlacePilot's MCP endpoint can be used by compatible MCP clients.

Use the following endpoint:

https://project-mcp-server.onrender.com/mcp

Once connected, the available MCP tools can be used to query placement information.

🧪 Example Queries

After connecting an MCP-compatible AI assistant, you can ask:

Student Information

What is the CGPA of CS101?

What is the attendance of CS102?

Does CS103 have any backlogs?

Eligibility

Is CS101 eligible for TCS?

Which students are eligible for the upcoming placement drive?

Placement Drives

List all upcoming placement drives.

Which companies have a minimum CGPA requirement below 8?

🎯 Use Cases

Students

Checking personal placement information

Checking eligibility

Viewing attendance and CGPA requirements

Finding upcoming placement opportunities

Placement Coordinators

Managing student records

Managing placement drives

Checking eligibility

Quickly querying placement information

AI Applications

Retrieving placement information

Calling placement-related tools

Generating natural-language responses

Interacting with structured placement data

🔐 Security Note

The current live deployment is configured as a demo application.

The MCP endpoint is publicly accessible for demonstration purposes.

For production deployment, additional security measures should be considered, such as:

Authentication

Authorization

API access control

HTTPS configuration

Rate limiting

Input validation

Secure database credentials

Protected MCP endpoints

🔮 Future Enhancements

Potential future improvements include:

🔐 User authentication

👨‍💼 Admin and placement-coordinator roles

📧 Automated placement notifications

📄 Resume management

🤖 AI-powered placement recommendations

📊 Advanced placement analytics

📈 Placement statistics and visualizations

🔎 Advanced student search

🏢 Company management

🔑 Secure authenticated MCP access

🧠 Additional MCP tools

📱 Improved mobile experience

📈 Project Highlights

Full-Stack Development

Combines a Python backend with a responsive web interface.

MCP Integration

Uses the Model Context Protocol to make placement data accessible to AI-compatible applications.

AI + Database

Instead of creating a separate chatbot with hardcoded responses, the AI interacts with live placement functionality through MCP tools.

Centralized Data

The dashboard and AI tools operate on the same underlying placement data.

Cloud Deployment

The application is deployed online and can be accessed through a public URL.

🧠 What I Learned

Through this project, I gained practical experience in:

Building APIs with FastAPI

Working with FastMCP

Understanding Model Context Protocol

Creating custom MCP tools

Connecting AI applications with external data

Building CRUD-based dashboards

Creating responsive web interfaces

Managing frontend state with Alpine.js

Using Tailwind CSS

Deploying applications using Render

Designing applications around a single source of truth

👨‍💻 Author

Vishnu Prasath S


⭐ Support

If you find PlacePilot useful or interesting, consider giving the repository a ⭐.

<p align="center">
  Built with Python, FastAPI, FastMCP, Alpine.js & MCP.
</p>

<p align="center">
  🚀 PlacePilot — Making placement data accessible through web and AI.
</p>
