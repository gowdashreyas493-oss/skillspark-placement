import os, json, pathlib, random, time, requests
from datetime import datetime
from functools import wraps

from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, current_user, login_required
from werkzeug.security import generate_password_hash, check_password_hash

BASE_DIR = pathlib.Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "app_data.db"
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

app = Flask(__name__, static_folder=str(BASE_DIR), static_url_path="/")
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DB_PATH}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = "chandana-secret"

db = SQLAlchemy(app)
login_manager = LoginManager(app)

OPENAI_API_KEY = "YOUR_API_KEY_HERE"

# ===================== MODELS =====================

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True)
    full_name = db.Column(db.String(120))
    password_hash = db.Column(db.String(256))
    email = db.Column(db.String(120))
    role = db.Column(db.String(20), default="employee")

    def set_password(self, pw): self.password_hash = generate_password_hash(pw)
    def check_password(self, pw): return check_password_hash(self.password_hash, pw)
    @property
    def is_admin(self): return self.role == "admin"


class Employee(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)
    name = db.Column(db.String(120))
    reg_no = db.Column(db.String(50), unique=True)
    department = db.Column(db.String(120))
    position = db.Column(db.String(120))
    joined_on = db.Column(db.DateTime, default=datetime.utcnow)
    documents = db.relationship("Document", backref="employee", cascade="all, delete-orphan")
    salary = db.relationship("Salary", backref="employee", uselist=False, cascade="all, delete-orphan")
    leaves = db.relationship("LeaveRequest", backref="employee", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "reg_no": self.reg_no,
            "department": self.department,
            "position": self.position,
            "joined_on": self.joined_on.isoformat() if self.joined_on else None,
            "doc_count": len(self.documents)
        }


class Document(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(200))
    employee_id = db.Column(db.Integer, db.ForeignKey("employee.id"))
    uploaded_on = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": self.id,
            "filename": self.filename,
            "uploaded_on": self.uploaded_on.isoformat(),
            "employee_id": self.employee_id
        }


class Salary(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey("employee.id"))
    base = db.Column(db.Float, default=0)
    bonus = db.Column(db.Float, default=0)
    deductions = db.Column(db.Float, default=0)

    def net(self): return self.base + self.bonus - self.deductions


class LeaveRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey("employee.id"))
    start_date = db.Column(db.String(50))
    end_date = db.Column(db.String(50))
    reason = db.Column(db.String(200))
    status = db.Column(db.String(20), default="Pending")
    applied_on = db.Column(db.DateTime, default=datetime.utcnow)


class Training(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200))
    department = db.Column(db.String(120))
    position = db.Column(db.String(120))
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# ===================== INIT DB =====================

with app.app_context():
    db.create_all()
    if not User.query.filter_by(username="admin").first():
        u = User(username="admin", full_name="Administrator", email="admin@sys.com", role="admin")
        u.set_password("admin123")
        db.session.add(u)
        db.session.commit()

@login_manager.user_loader
def load_user(uid): return User.query.get(int(uid))

# ===================== STATIC =====================

@app.route("/")
def home():
    return send_from_directory(str(BASE_DIR), "index.html")

@app.route("/uploads/<path:fn>")
def serve_upload(fn):
    return send_from_directory(str(UPLOAD_DIR), fn)

# ===================== AUTH =====================

@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"error": "Username already exists"}), 400

    user = User(
        username=data["username"],
        full_name=data.get("full_name") or data["username"],
        email=data["email"],
        role=data.get("role", "employee")
    )
    user.set_password(data["password"])
    db.session.add(user)
    db.session.flush()

    if user.role == "employee":
        emp = Employee(
            user_id=user.id,
            name=user.full_name,
            reg_no=f"EMP{random.randint(1000,9999)}",
            department="New Joiner",
            position="Employee"
        )
        db.session.add(emp)
        db.session.flush()
        db.session.add(Salary(employee_id=emp.id))

    db.session.commit()
    return jsonify({"ok": True})


@app.route("/api/login", methods=["POST"])
def login():
    d = request.get_json()
    user = User.query.filter_by(username=d["username"]).first()
    if not user or not user.check_password(d["password"]):
        return jsonify({"error": "Invalid credentials"}), 401
    login_user(user)
    return jsonify({"ok": True, "role": user.role, "username": user.username})


@app.route("/api/logout", methods=["POST"])
def logout():
    logout_user()
    return jsonify({"ok": True})


@app.route("/api/whoami")
def whoami():
    if not current_user.is_authenticated:
        return jsonify({"authenticated": False})
    return jsonify({
        "authenticated": True, 
        "username": current_user.username, 
        "role": current_user.role,
        "full_name": current_user.full_name
    })

# ===================== STATS =====================

@app.route("/api/stats")
@login_required
def stats():
    if current_user.is_admin:
        return jsonify({
            "employees": Employee.query.count(),
            "trainings": Training.query.count(),
            "leaves": LeaveRequest.query.count(),
            "pending_leaves": LeaveRequest.query.filter_by(status="Pending").count()
        })
    else:
        emp = Employee.query.filter_by(user_id=current_user.id).first()
        return jsonify({
            "my_documents": len(emp.documents) if emp else 0,
            "my_leaves": LeaveRequest.query.filter_by(employee_id=emp.id).count() if emp else 0,
            "pending_leaves": LeaveRequest.query.filter_by(employee_id=emp.id, status="Pending").count() if emp else 0
        })

# ===================== EMPLOYEE PANEL =====================

@app.route("/api/me/employee")
@login_required
def me_employee():
    if current_user.is_admin:
        return jsonify({"error": "Admins have no employee profile"}), 403
    emp = Employee.query.filter_by(user_id=current_user.id).first()
    if not emp:
        return jsonify({"error": "Employee profile not found"}), 404
    
    salary = Salary.query.filter_by(employee_id=emp.id).first()
    return jsonify({
        **emp.to_dict(),
        "salary": {
            "base": salary.base if salary else 0,
            "bonus": salary.bonus if salary else 0,
            "deductions": salary.deductions if salary else 0,
            "net": salary.net() if salary else 0
        }
    })


@app.route("/api/me/documents")
@login_required
def my_docs():
    if current_user.is_admin:
        return jsonify({"error": "Admins have no documents"}), 403
    emp = Employee.query.filter_by(user_id=current_user.id).first()
    if not emp:
        return jsonify([])
    docs = [d.to_dict() for d in emp.documents]
    return jsonify(docs)


@app.route("/api/me/upload", methods=["POST"])
@login_required
def my_upload():
    if current_user.is_admin:
        return jsonify({"error": "Admins cannot upload documents"}), 403
    emp = Employee.query.filter_by(user_id=current_user.id).first()
    if not emp:
        return jsonify({"error": "Employee profile not found"}), 404
    
    f = request.files.get("file")
    if not f:
        return jsonify({"error": "No file provided"}), 400
    
    filename = f"{datetime.utcnow().timestamp()}_{f.filename}"
    f.save(UPLOAD_DIR / filename)
    doc = Document(filename=filename, employee_id=emp.id)
    db.session.add(doc)
    db.session.commit()
    return jsonify({"ok": True, "doc": doc.to_dict()})

# ===================== ADMIN DECORATOR =====================

def admin_only(fn):
    @wraps(fn)
    def w(*a, **k):
        if not current_user.is_admin:
            return jsonify({"error": "Admin access required"}), 403
        return fn(*a, **k)
    return w

# ===================== ADMIN: EMPLOYEES =====================

@app.route("/api/employees")
@login_required
@admin_only
def employees():
    return jsonify([e.to_dict() for e in Employee.query.all()])

@app.route("/api/employees", methods=["POST"])
@login_required
@admin_only
def add_emp():
    d = request.get_json()
    if Employee.query.filter_by(reg_no=d["reg_no"]).first():
        return jsonify({"error": "Registration number already exists"}), 400
    
    e = Employee(
        name=d["name"], 
        reg_no=d["reg_no"],
        department=d.get("department", ""),
        position=d.get("position", "")
    )
    db.session.add(e)
    db.session.flush()
    db.session.add(Salary(employee_id=e.id))
    db.session.commit()
    return jsonify(e.to_dict())

@app.route("/api/employees/<int:id>", methods=["PUT"])
@login_required
@admin_only
def edit_emp(id):
    e = Employee.query.get_or_404(id)
    d = request.get_json()
    e.name = d.get("name", e.name)
    e.department = d.get("department", e.department)
    e.position = d.get("position", e.position)
    db.session.commit()
    return jsonify(e.to_dict())

@app.route("/api/employees/<int:id>", methods=["DELETE"])
@login_required
@admin_only
def del_emp(id):
    e = Employee.query.get_or_404(id)
    db.session.delete(e)
    db.session.commit()
    return jsonify({"ok": True})

@app.route("/api/employees/<int:id>/documents")
@login_required
@admin_only
def emp_documents(id):
    e = Employee.query.get_or_404(id)
    return jsonify([d.to_dict() for d in e.documents])

# ===================== ADMIN: SALARY =====================

@app.route("/api/salary/<int:id>")
@login_required
@admin_only
def salary(id):
    s = Salary.query.filter_by(employee_id=id).first()
    if not s:
        return jsonify({"error": "Salary record not found"}), 404
    return jsonify({
        "base": s.base, 
        "bonus": s.bonus, 
        "deductions": s.deductions, 
        "net": s.net()
    })

@app.route("/api/salary/<int:id>", methods=["POST"])
@login_required
@admin_only
def salary_update(id):
    s = Salary.query.filter_by(employee_id=id).first()
    if not s:
        s = Salary(employee_id=id)
        db.session.add(s)
    
    d = request.get_json()
    s.base = float(d.get("base", 0))
    s.bonus = float(d.get("bonus", 0))
    s.deductions = float(d.get("deductions", 0))
    db.session.commit()
    return jsonify({"ok": True, "net": s.net()})

# ===================== LEAVES =====================

@app.route("/api/leaves", methods=["GET"])
@login_required
def get_leaves():
    arr = []
    if current_user.is_admin:
        query = LeaveRequest.query.all()
    else:
        emp = Employee.query.filter_by(user_id=current_user.id).first()
        if not emp:
            return jsonify([])
        query = LeaveRequest.query.filter_by(employee_id=emp.id).all()
    
    for l in query:
        emp = Employee.query.get(l.employee_id)
        arr.append({
            "id": l.id,
            "employee_id": l.employee_id,
            "employee_name": emp.name if emp else "Unknown",
            "start_date": l.start_date,
            "end_date": l.end_date,
            "reason": l.reason,
            "status": l.status,
            "applied_on": l.applied_on.isoformat() if l.applied_on else None
        })
    return jsonify(arr)

@app.route("/api/leaves", methods=["POST"])
@login_required
def post_leave():
    d = request.get_json()
    
    # If employee, use their own id
    if not current_user.is_admin:
        emp = Employee.query.filter_by(user_id=current_user.id).first()
        if not emp:
            return jsonify({"error": "Employee profile not found"}), 404
        employee_id = emp.id
    else:
        # Admin can apply on behalf of any employee
        employee_id = d.get("employee_id")
        if not employee_id:
            return jsonify({"error": "Employee ID required"}), 400
    
    lr = LeaveRequest(
        employee_id=employee_id,
        start_date=d["start_date"],
        end_date=d["end_date"],
        reason=d.get("reason", "")
    )
    db.session.add(lr)
    db.session.commit()
    return jsonify({"ok": True})

@app.route("/api/leaves/<int:id>/action", methods=["POST"])
@login_required
@admin_only
def leave_action(id):
    lr = LeaveRequest.query.get_or_404(id)
    act = request.get_json()["action"]
    lr.status = "Approved" if act == "approve" else "Rejected"
    db.session.commit()
    return jsonify({"ok": True, "status": lr.status})

# ===================== ADMIN: TRAINING =====================

@app.route("/api/trainings", methods=["GET"])
@login_required
def trainings():
    return jsonify([{
        "id": t.id,
        "title": t.title,
        "department": t.department,
        "position": t.position,
        "description": t.description,
        "created_at": t.created_at.isoformat() if t.created_at else None
    } for t in Training.query.all()])

@app.route("/api/trainings", methods=["POST"])
@login_required
@admin_only
def add_training():
    d = request.get_json()
    t = Training(
        title=d["title"], 
        department=d.get("department", "All"),
        position=d.get("position", "All"),
        description=d.get("description", "")
    )
    db.session.add(t)
    db.session.commit()
    return jsonify({"ok": True, "id": t.id})

@app.route("/api/trainings/<int:id>", methods=["DELETE"])
@login_required
@admin_only
def del_training(id):
    t = Training.query.get_or_404(id)
    db.session.delete(t)
    db.session.commit()
    return jsonify({"ok": True})

# ===================== CHATBOT =====================

@app.route("/api/chat", methods=["POST"])
@login_required
def chat():
    msg = request.json["message"]
    try:
        r = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
            json={
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": "You are Chandana HR Assistant. Help with HR policies, onboarding, and employee queries."},
                    {"role": "user", "content": msg}
                ]
            },
            timeout=10
        ).json()
        return jsonify({"reply": r["choices"][0]["message"]["content"]})
    except Exception as e:
        return jsonify({"reply": f"AI service unavailable: {str(e)}"})

# ===================== RUN =====================

if __name__ == "__main__":
    app.run(debug=True, port=5000)
