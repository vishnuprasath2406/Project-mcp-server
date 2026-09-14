import json
import os
import threading

from mcp.server.fastmcp import FastMCP
from starlette.requests import Request
from starlette.responses import FileResponse, JSONResponse

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(SCRIPT_DIR, "data.json")
STATIC_DIR = os.path.join(SCRIPT_DIR, "static")

_lock = threading.Lock()

mcp = FastMCP("project-mcp-server")


# ---------- data helpers ----------

def load_data():
    with _lock:
        with open(DATA_PATH, "r") as f:
            return json.load(f)


def save_data(data):
    with _lock:
        with open(DATA_PATH, "w") as f:
            json.dump(data, f, indent=2)


def find_student(data, student_id):
    for student in data["students"]:
        if student["student_id"].lower() == student_id.lower():
            return student
    return None


def find_drive(data, company):
    for drive in data["placement_drives"]:
        if drive["company"].lower() == company.lower():
            return drive
    return None


# ---------- MCP tools (what AI assistants can call) ----------

@mcp.tool()
def get_attendance(student_id: str) -> str:
    """Get the subject-wise attendance percentage for a given student ID."""
    data = load_data()
    student = find_student(data, student_id)
    if not student:
        return f"No student found with ID {student_id}."
    lines = [f"Attendance for {student['name']} ({student_id}):"]
    for subject, percent in student["attendance"].items():
        lines.append(f"- {subject}: {percent}%")
    return "\n".join(lines)


@mcp.tool()
def get_cgpa(student_id: str) -> str:
    """Get the CGPA and backlog count for a given student ID."""
    data = load_data()
    student = find_student(data, student_id)
    if not student:
        return f"No student found with ID {student_id}."
    return f"{student['name']} ({student_id}) — CGPA: {student['cgpa']}, Backlogs: {student['backlogs']}"


@mcp.tool()
def check_eligibility(student_id: str, company: str) -> str:
    """Check if a student is eligible for a specific company's placement drive."""
    data = load_data()
    student = find_student(data, student_id)
    if not student:
        return f"No student found with ID {student_id}."
    drive = find_drive(data, company)
    if not drive:
        return f"No placement drive found for {company}."

    cgpa_ok = student["cgpa"] >= drive["min_cgpa"]
    backlog_ok = student["backlogs"] <= drive["max_backlogs"]

    if cgpa_ok and backlog_ok:
        return (f"{student['name']} IS eligible for {company} "
                f"(CGPA {student['cgpa']} >= {drive['min_cgpa']}, "
                f"backlogs {student['backlogs']} <= {drive['max_backlogs']}).")
    reasons = []
    if not cgpa_ok:
        reasons.append(f"CGPA too low ({student['cgpa']} < {drive['min_cgpa']})")
    if not backlog_ok:
        reasons.append(f"too many backlogs ({student['backlogs']} > {drive['max_backlogs']})")
    return f"{student['name']} is NOT eligible for {company}: {', '.join(reasons)}."


@mcp.tool()
def list_placement_drives() -> str:
    """List all upcoming placement drives with their eligibility criteria."""
    data = load_data()
    lines = ["Upcoming placement drives:"]
    for d in data["placement_drives"]:
        lines.append(f"- {d['company']} on {d['date']} (min CGPA: {d['min_cgpa']}, max backlogs: {d['max_backlogs']})")
    return "\n".join(lines)


# ---------- website pages ----------

@mcp.custom_route("/", methods=["GET"])
async def homepage(request: Request):
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))


@mcp.custom_route("/browser", methods=["GET"])
async def browser_page(request: Request):
    return FileResponse(os.path.join(STATIC_DIR, "browser.html"))


@mcp.custom_route("/connect", methods=["GET"])
async def connect_page(request: Request):
    return FileResponse(os.path.join(STATIC_DIR, "connect.html"))


@mcp.custom_route("/static/{filename}", methods=["GET"])
async def static_files(request: Request):
    filename = request.path_params["filename"]
    path = os.path.join(STATIC_DIR, filename)
    if not os.path.abspath(path).startswith(STATIC_DIR):
        return JSONResponse({"error": "not found"}, status_code=404)
    if not os.path.isfile(path):
        return JSONResponse({"error": "not found"}, status_code=404)
    return FileResponse(path)


# ---------- REST API used by the website ----------

@mcp.custom_route("/api/stats", methods=["GET"])
async def api_stats(request: Request):
    data = load_data()
    students = data["students"]
    avg_cgpa = round(sum(s["cgpa"] for s in students) / len(students), 2) if students else 0
    total_backlogs = sum(s["backlogs"] for s in students)
    return JSONResponse({
        "student_count": len(students),
        "drive_count": len(data["placement_drives"]),
        "avg_cgpa": avg_cgpa,
        "total_backlogs": total_backlogs,
    })


@mcp.custom_route("/api/students", methods=["GET"])
async def api_list_students(request: Request):
    return JSONResponse(load_data()["students"])


@mcp.custom_route("/api/students", methods=["POST"])
async def api_add_student(request: Request):
    payload = await request.json()
    data = load_data()
    if find_student(data, payload["student_id"]):
        return JSONResponse({"error": "Student ID already exists"}, status_code=400)
    payload.setdefault("results", {})
    data["students"].append(payload)
    save_data(data)
    return JSONResponse(payload, status_code=201)


@mcp.custom_route("/api/students/{student_id}", methods=["PUT"])
async def api_update_student(request: Request):
    student_id = request.path_params["student_id"]
    payload = await request.json()
    data = load_data()
    student = find_student(data, student_id)
    if not student:
        return JSONResponse({"error": "Student not found"}, status_code=404)
    student.update(payload)
    save_data(data)
    return JSONResponse(student)


@mcp.custom_route("/api/students/{student_id}", methods=["DELETE"])
async def api_delete_student(request: Request):
    student_id = request.path_params["student_id"]
    data = load_data()
    student = find_student(data, student_id)
    if not student:
        return JSONResponse({"error": "Student not found"}, status_code=404)
    data["students"].remove(student)
    save_data(data)
    return JSONResponse({"deleted": student_id})


@mcp.custom_route("/api/drives", methods=["GET"])
async def api_list_drives(request: Request):
    return JSONResponse(load_data()["placement_drives"])


@mcp.custom_route("/api/drives", methods=["POST"])
async def api_add_drive(request: Request):
    payload = await request.json()
    data = load_data()
    if find_drive(data, payload["company"]):
        return JSONResponse({"error": "Drive already exists"}, status_code=400)
    data["placement_drives"].append(payload)
    save_data(data)
    return JSONResponse(payload, status_code=201)


@mcp.custom_route("/api/drives/{company}", methods=["PUT"])
async def api_update_drive(request: Request):
    company = request.path_params["company"]
    payload = await request.json()
    data = load_data()
    drive = find_drive(data, company)
    if not drive:
        return JSONResponse({"error": "Drive not found"}, status_code=404)
    drive.update(payload)
    save_data(data)
    return JSONResponse(drive)


@mcp.custom_route("/api/drives/{company}", methods=["DELETE"])
async def api_delete_drive(request: Request):
    company = request.path_params["company"]
    data = load_data()
    drive = find_drive(data, company)
    if not drive:
        return JSONResponse({"error": "Drive not found"}, status_code=404)
    data["placement_drives"].remove(drive)
    save_data(data)
    return JSONResponse({"deleted": company})


# ---------- entrypoint ----------

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    mcp.settings.host = "0.0.0.0"
    mcp.settings.port = port
    mcp.run(transport="streamable-http")