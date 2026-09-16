import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  CalendarDays,
  Users,
  School,
  Link2,
  LayoutDashboard,
  Plus,
  Trash2,
  Copy,
  Check,
  Search,
  Menu,
  X,
  Clock3,
  Wallet,
  Settings,
  ClipboardCheck,
} from "lucide-react";
import "./style.css";

const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
const money = (n) =>
  new Intl.NumberFormat("vi-VN").format(Number(n) || 0) + "đ";
const today = () => new Date().toISOString().slice(0, 10);

function App() {
  const API = import.meta.env.VITE_API_URL || "/api";
  const [page, setPage] = useState(
      location.pathname.startsWith("/share/") ? "public" : "dashboard",
    ),
    [students, setStudents] = useState([]),
    [classes, setClasses] = useState([]),
    [schedules, setSchedules] = useState([]),
    [slots, setSlots] = useState([]),
    [attendance, setAttendance] = useState([]),
    [modal, setModal] = useState(null),
    [mobileOpen, setMobileOpen] = useState(false),
    [toast, setToast] = useState(""),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [publicData, setPublicData] = useState(null);
  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const [a, b, c, d, e] = await Promise.all([
        fetch(`${API}/students`),
        fetch(`${API}/classes`),
        fetch(`${API}/schedules`),
        fetch(`${API}/time-slots`),
        fetch(`${API}/attendance`),
      ]);
      if ([a, b, c, d, e].some((x) => !x.ok)) throw Error();
      setStudents(await a.json());
      setClasses(await b.json());
      setSchedules(await c.json());
      setSlots(await d.json());
      setAttendance(await e.json());
    } catch {
      setError(
        "Không kết nối được backend. Hãy chạy backend tại http://localhost:4000.",
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (location.pathname.startsWith("/share/")) {
      (async () => {
        try {
          const r = await fetch(
            `${API}/share/${location.pathname.split("/").pop()}`,
          );
          if (!r.ok) throw Error();
          setPublicData(await r.json());
        } catch {
          setError("Link chia sẻ không hợp lệ hoặc đã bị xóa.");
        } finally {
          setLoading(false);
        }
      })();
    } else load();
  }, []);
  const notify = (m) => {
    setToast(m);
    setTimeout(() => setToast(""), 1800);
  };
  const api = async (path, options = {}) => {
    const r = await fetch(`${API}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      throw Error(j.error || "API error");
    }
    return r.json();
  };
  const addStudent = async (v) => {
    const x = await api("/students", {
      method: "POST",
      body: JSON.stringify(v),
    });
    setStudents((s) => [...s, x]);
    setModal(null);
  };
  const deleteStudent = async (id) => {
    if (confirm("Xóa học sinh này?")) {
      await api(`/students/${id}`, { method: "DELETE" });
      setStudents((s) => s.filter((x) => x.id !== id));
      notify("Đã xóa học sinh");
    }
  };
  const addClass = async (v) => {
    const x = await api("/classes", {
      method: "POST",
      body: JSON.stringify(v),
    });
    setClasses((c) => [...c, x]);
    setModal(null);
  };
  const addSchedule = async (v) => {
    const x = await api("/schedules", {
      method: "POST",
      body: JSON.stringify(v),
    });
    setSchedules((s) => [...s, x]);
    setModal(null);
  };
  const deleteSchedule = async (id) => {
    if (confirm("Xóa tiết học này?")) {
      await api(`/schedules/${id}`, { method: "DELETE" });
      setSchedules((s) => s.filter((x) => x.id !== id));
    }
  };
  const mark = async (v) => {
    const x = await api("/attendance", {
      method: "POST",
      body: JSON.stringify(v),
    });
    setAttendance((a) => {
      const old = a.findIndex((q) => q.id === x.id);
      return old >= 0 ? a.map((q) => (q.id === x.id ? x : q)) : [x, ...a];
    });
    notify("Đã lưu điểm danh");
  };
  const copyStudentLink = async (studentId) => {
    const x = await api("/share-links", {
      method: "POST",
      body: JSON.stringify({ studentId }),
    });
    const url = `${location.origin}/share/${x.token}`;
    await navigator.clipboard?.writeText(url);
    notify("Đã copy link riêng cho học sinh");
  };
  const stats = useMemo(
    () => ({
      students: students.length,
      classes: classes.length,
      lessons: schedules.length,
      earned: attendance
        .filter((x) => x.status === "attended")
        .reduce((a, x) => a + Number(x.fee || 0), 0),
    }),
    [students, classes, schedules, attendance],
  );
  const nav = (p) => {
    setPage(p);
    setMobileOpen(false);
  };
  return (
    <div className="app">
      <header className="topbar">
        <button
          className="mobile-menu"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <div className="brand">
          📚 <span>Teacher Schedule</span>
        </div>
        <div className="teacher">👨‍🏫 Nguyễn Thị Nam Giang</div>
      </header>
      <div className="layout">
        <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
          <Nav
            icon={<LayoutDashboard />}
            text="Tổng quan"
            active={page === "dashboard"}
            onClick={() => nav("dashboard")}
          />
          <Nav
            icon={<CalendarDays />}
            text="Thời gian biểu"
            active={page === "schedule"}
            onClick={() => nav("schedule")}
          />
          <Nav
            icon={<Users />}
            text="Học sinh"
            active={page === "students"}
            onClick={() => nav("students")}
          />
          <Nav
            icon={<School />}
            text="Lớp học"
            active={page === "classes"}
            onClick={() => nav("classes")}
          />
          <Nav
            icon={<ClipboardCheck />}
            text="Điểm danh"
            active={page === "attendance"}
            onClick={() => nav("attendance")}
          />
          <Nav
            icon={<Wallet />}
            text="Học phí"
            active={page === "fees"}
            onClick={() => nav("fees")}
          />
          <Nav
            icon={<Settings />}
            text="Cài đặt giờ"
            active={page === "settings"}
            onClick={() => nav("settings")}
          />
        </aside>
        <main className="content">
          {page === "public" ? (
            loading ? (
              <div className="card" style={{ padding: 30 }}>
                Đang tải lịch...
              </div>
            ) : error ? (
              <div className="card" style={{ padding: 30, color: "#b42318" }}>
                {error}
              </div>
            ) : (
              <PublicSchedule data={publicData} />
            )
          ) : loading ? (
            <div className="card" style={{ padding: 30 }}>
              Đang tải dữ liệu...
            </div>
          ) : error ? (
            <div className="card" style={{ padding: 30, color: "#b42318" }}>
              {error}
              <button
                className="primary"
                style={{ marginLeft: 15 }}
                onClick={load}
              >
                Thử lại
              </button>
            </div>
          ) : (
            <>
              {page === "dashboard" && (
                <Dashboard
                  stats={stats}
                  students={students}
                  attendance={attendance}
                  onNavigate={nav}
                />
              )}{" "}
              {page === "students" && (
                <Students
                  students={students}
                  onAdd={() => setModal({ type: "student" })}
                  onDelete={deleteStudent}
                  onShare={copyStudentLink}
                />
              )}{" "}
              {page === "classes" && (
                <Classes
                  classes={classes}
                  onAdd={() => setModal({ type: "class" })}
                />
              )}{" "}
              {page === "schedule" && (
                <Schedule
                  schedules={schedules}
                  slots={slots}
                  onAdd={() => setModal({ type: "schedule" })}
                  onDelete={deleteSchedule}
                />
              )}{" "}
              {page === "attendance" && (
                <Attendance
                  students={students}
                  schedules={schedules}
                  attendance={attendance}
                  onMark={mark}
                />
              )}{" "}
              {page === "fees" && (
                <Fees
                  students={students}
                  attendance={attendance}
                  onPayment={async (v) => {
                    await api("/payments", {
                      method: "POST",
                      body: JSON.stringify(v),
                    });
                    notify("Đã ghi nhận thanh toán");
                    load();
                  }}
                />
              )}{" "}
              {page === "settings" && (
                <TimeSettings
                  slots={slots}
                  API={API}
                  onReload={load}
                  notify={notify}
                />
              )}
            </>
          )}
        </main>
      </div>
      {toast && (
        <div className="toast">
          <Check size={18} />
          {toast}
        </div>
      )}
      {modal?.type === "student" && (
        <StudentModal onClose={() => setModal(null)} onSave={addStudent} />
      )}{" "}
      {modal?.type === "class" && (
        <ClassModal onClose={() => setModal(null)} onSave={addClass} />
      )}{" "}
      {modal?.type === "schedule" && (
        <ScheduleModal
          slots={slots}
          classes={classes}
          students={students}
          onClose={() => setModal(null)}
          onSave={addSchedule}
        />
      )}
    </div>
  );
}
function Nav({ icon, text, active, onClick }) {
  return (
    <button className={`nav ${active ? "active" : ""}`} onClick={onClick}>
      {React.cloneElement(icon, { size: 19 })}
      <span>{text}</span>
    </button>
  );
}
function PageTitle({ title, desc, action }) {
  return (
    <div className="page-title">
      <div>
        <h1>{title}</h1>
        <p>{desc}</p>
      </div>
      {action}
    </div>
  );
}
function PublicSchedule({ data }) {
  const schedules = data?.schedules || [];
  return (
    <>
      <PageTitle
        title={`Thời gian biểu của ${data?.student?.name || "học sinh"}`}
        desc={`Lớp ${data?.student?.className || ""} · Link riêng tư`}
      />
      <div className="card public-card">
        <div className="public-header">
          <div className="avatar">👨‍🎓</div>
          <div>
            <h2>{data?.student?.name}</h2>
            <p>Thời gian biểu cá nhân</p>
          </div>
        </div>
        <div className="mini-schedule">
          {days.map((d) => (
            <div key={d}>
              <h3>{d}</h3>
              {schedules
                .filter((x) => x.day === d)
                .map((x) => (
                  <div className="public-lesson" key={x.id}>
                    <b>{x.time}</b>
                    <span>
                      {x.subject} · {x.className}
                      {x.room ? ` · ${x.room}` : ""}
                    </span>
                  </div>
                ))}
              {!schedules.some((x) => x.day === d) && (
                <div className="public-lesson">
                  <span>Không có lịch</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function Dashboard({ stats, students, attendance, onNavigate }) {
  return (
    <>
      <PageTitle
        title="Tổng quan"
        desc="Quản lý lịch dạy, học sinh, điểm danh và học phí."
      />
      <div className="stats">
        <Stat icon={<Users />} label="Học sinh" value={stats.students} />
        <Stat icon={<School />} label="Lớp học" value={stats.classes} />
        <Stat icon={<CalendarDays />} label="Tiết học" value={stats.lessons} />
        <Stat
          icon={<Wallet />}
          label="Đã học tính tiền"
          value={money(stats.earned)}
        />
      </div>
      <section className="card">
        <div className="card-head">
          <div>
            <h2>Học sinh</h2>
            <p>Chọn chức năng bạn muốn quản lý.</p>
          </div>
        </div>
        <div className="quick-grid">
          <button onClick={() => onNavigate("students")}>
            👨‍🎓 Quản lý học sinh
          </button>
          <button onClick={() => onNavigate("attendance")}>
            ✅ Điểm danh buổi học
          </button>
          <button onClick={() => onNavigate("fees")}>
            💰 Tính và thu học phí
          </button>
          <button onClick={() => onNavigate("settings")}>
            ⏰ Điều chỉnh giờ học
          </button>
        </div>
      </section>
    </>
  );
}
function Stat({ icon, label, value }) {
  return (
    <div className="stat card">
      <div className="stat-icon">{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}
function Students({ students, onAdd, onDelete, onShare }) {
  const [q, setQ] = useState("");
  const list = students.filter((s) =>
    (s.name + s.className + s.phone).toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <>
      <PageTitle
        title="Học sinh"
        desc="Mỗi học sinh có thể có mức phí/buổi riêng và link lịch riêng."
        action={
          <button className="primary" onClick={onAdd}>
            <Plus size={18} /> Thêm học sinh
          </button>
        }
      />
      <div className="toolbar">
        <div className="search">
          <Search size={18} />
          <input
            placeholder="Tìm học sinh..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Họ tên</th>
              <th>Lớp</th>
              <th>Phí/buổi</th>
              <th>Đã học</th>
              <th>Còn phải thu</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((s) => (
              <tr key={s.id}>
                <td>
                  <b>{s.name}</b>
                  <small>{s.phone}</small>
                </td>
                <td>
                  <span className="tag">{s.className}</span>
                </td>
                <td>{money(s.feePerLesson)}</td>
                <td>{s.attendedLessons || 0}</td>
                <td>{money((s.totalEarned || 0) - (s.totalPaid || 0))}</td>
                <td>
                  <button
                    className="icon-btn"
                    title="Copy link riêng"
                    onClick={() => onShare(s.id)}
                  >
                    <Link2 size={17} />
                  </button>
                  <button className="icon-btn" onClick={() => onDelete(s.id)}>
                    <Trash2 size={17} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
function Classes({ classes, onAdd }) {
  return (
    <>
      <PageTitle
        title="Lớp học"
        desc="Danh sách các lớp đang quản lý."
        action={
          <button className="primary" onClick={onAdd}>
            <Plus size={18} /> Thêm lớp
          </button>
        }
      />
      <div className="class-grid">
        {classes.map((c) => (
          <div className="card class-card" key={c.id}>
            <div className="class-symbol">🏫</div>
            <div>
              <h3>Lớp {c.name}</h3>
              <p>{c.teacher}</p>
              <span>{c.count} học sinh</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
function Schedule({ schedules, slots, onAdd, onDelete }) {
  const [classFilter, setClassFilter] = useState("Tất cả");
  const classes = ["Tất cả", ...new Set(schedules.map((x) => x.className))];
  const times = slots.map((x) => `${x.startTime} - ${x.endTime}`);
  const get = (d, t) =>
    schedules.filter(
      (x) =>
        x.day === d &&
        x.time === t &&
        (classFilter === "Tất cả" || x.className === classFilter),
    );
  return (
    <>
      <PageTitle
        title="Thời gian biểu"
        desc="Khung giờ lấy từ Cài đặt giờ."
        action={
          <button className="primary" onClick={onAdd}>
            <Plus size={18} /> Thêm tiết
          </button>
        }
      />
      <div className="filter">
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
        >
          {classes.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="card schedule-wrap">
        <div className="schedule-grid">
          <div className="corner">Giờ</div>
          {days.map((d) => (
            <div className="day-head" key={d}>
              {d}
            </div>
          ))}
          {times.map((t) => (
            <React.Fragment key={t}>
              <div className="time-cell">{t}</div>
              {days.map((d) => (
                <div className="lesson-cell" key={d + t}>
                  {get(d, t).map((x) => (
                    <div className="lesson" key={x.id}>
                      <b>{x.subject}</b>
                      <span>
                        {x.studentId ? "Cá nhân" : "Lớp"} {x.className}
                      </span>
                      <small>{x.room}</small>
                      <button onClick={() => onDelete(x.id)}>
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
}
function Attendance({ students, schedules, attendance, onMark }) {
  const [sid, setSid] = useState(students[0]?.id || "");
  const [date, setDate] = useState(today());
  const student = students.find((s) => s.id === Number(sid));
  const lessons = schedules.filter(
    (x) =>
      !student ||
      x.studentId === student.id ||
      (!x.studentId && x.className === student.className),
  );
  return (
    <>
      <PageTitle
        title="Điểm danh"
        desc="Mỗi lần bấm Đã học sẽ tự tính tiền theo mức phí của học sinh."
      />
      <div className="card form-card">
        <label className="field">
          <span>Học sinh</span>
          <select value={sid} onChange={(e) => setSid(e.target.value)}>
            {students.map((s) => (
              <option value={s.id} key={s.id}>
                {s.name} · {s.className}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Ngày học</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
      </div>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Thứ</th>
              <th>Giờ</th>
              <th>Môn</th>
              <th>Trạng thái</th>
              <th>Tiền</th>
            </tr>
          </thead>
          <tbody>
            {lessons.map((l) => {
              const a = attendance.find(
                (x) =>
                  x.studentId === student?.id &&
                  x.scheduleId === l.id &&
                  x.lessonDate === date,
              );
              return (
                <tr key={l.id}>
                  <td>{l.day}</td>
                  <td>{l.time}</td>
                  <td>
                    <b>{l.subject}</b>
                  </td>
                  <td>
                    <button
                      className={
                        a?.status === "attended" ? "primary" : "outline"
                      }
                      onClick={() =>
                        onMark({
                          studentId: student.id,
                          scheduleId: l.id,
                          lessonDate: date,
                          status: "attended",
                        })
                      }
                    >
                      ✓ Đã học
                    </button>{" "}
                    <button
                      className={a?.status === "absent" ? "danger" : "outline"}
                      onClick={() =>
                        onMark({
                          studentId: student.id,
                          scheduleId: l.id,
                          lessonDate: date,
                          status: "absent",
                        })
                      }
                    >
                      Nghỉ
                    </button>
                  </td>
                  <td>{a?.status === "attended" ? money(a.fee) : "0đ"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
function Fees({ students, attendance, onPayment }) {
  const [classFilter, setClassFilter] = useState("Tất cả");
  const [amounts, setAmounts] = useState({});
  const [pdfLoading, setPdfLoading] = useState(false);

  const classNames = [
    "Tất cả",
    ...new Set(
      students
        .map((s) => s.className)
        .filter(Boolean)
    ),
  ];

  const filteredStudents =
    classFilter === "Tất cả"
      ? students
      : students.filter(
          (s) => s.className === classFilter
        );

  const getEarned = (student) => {
    return attendance
      .filter(
        (a) =>
          Number(a.studentId) === Number(student.id) &&
          a.status === "attended"
      )
      .reduce(
        (total, a) =>
          total + Number(a.fee || 0),
        0
      );
  };

  const getPaid = (student) => {
    return Number(student.totalPaid || 0);
  };

  const getDebt = (student) => {
    return getEarned(student) - getPaid(student);
  };

  const totalEarned = filteredStudents.reduce(
    (total, student) =>
      total + getEarned(student),
    0
  );

  const totalPaid = filteredStudents.reduce(
    (total, student) =>
      total + getPaid(student),
    0
  );

  const totalDebt = totalEarned - totalPaid;

  const handlePayment = async (student) => {
    const amount = Number(
      amounts[student.id] || 0
    );

    if (amount <= 0) return;

    try {
      await onPayment({
        studentId: student.id,
        month: new Date()
          .toISOString()
          .slice(0, 7),
        amount,
      });

      setAmounts((prev) => ({
        ...prev,
        [student.id]: "",
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const loadFont = async (url) => {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Không tải được font: ${url}`
      );
    }

    const buffer = await response.arrayBuffer();

    let binary = "";

    const bytes = new Uint8Array(buffer);

    const chunkSize = 0x8000;

    for (
      let i = 0;
      i < bytes.length;
      i += chunkSize
    ) {
      binary += String.fromCharCode(
        ...bytes.subarray(
          i,
          Math.min(i + chunkSize, bytes.length)
        )
      );
    }

    return btoa(binary);
  };

  const exportFeePDF = async () => {
    try {
      setPdfLoading(true);

      const [
        jsPDFModule,
        autoTableModule,
      ] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);

      const jsPDF = jsPDFModule.jsPDF;
      const autoTable =
        autoTableModule.default ||
        autoTableModule;

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // =========================
      // LOAD FONT TIẾNG VIỆT
      // =========================

      const regularFont = await loadFont(
        "/fonts/NotoSans-Regular.ttf"
      );

      const boldFont = await loadFont(
        "/fonts/NotoSans-Bold.ttf"
      );

      doc.addFileToVFS(
        "NotoSans-Regular.ttf",
        regularFont
      );

      doc.addFont(
        "NotoSans-Regular.ttf",
        "NotoSans",
        "normal"
      );

      doc.addFileToVFS(
        "NotoSans-Bold.ttf",
        boldFont
      );

      doc.addFont(
        "NotoSans-Bold.ttf",
        "NotoSans",
        "bold"
      );

      doc.setFont("NotoSans", "normal");

      // =========================
      // NGÀY
      // =========================

      const now = new Date();

      const dateText =
        `${String(now.getDate()).padStart(2, "0")}/` +
        `${String(now.getMonth() + 1).padStart(2, "0")}/` +
        `${now.getFullYear()}`;

      // =========================
      // TIÊU ĐỀ
      // =========================

      doc.setFont(
        "NotoSans",
        "bold"
      );

      doc.setFontSize(18);

      doc.text(
        "BẢNG HỌC PHÍ HỌC SINH",
        148,
        17,
        {
          align: "center",
        }
      );

      doc.setFont(
        "NotoSans",
        "normal"
      );

      doc.setFontSize(10);

      doc.text(
        `Ngày xuất: ${dateText}`,
        282,
        17,
        {
          align: "right",
        }
      );

      // =========================
      // THÔNG TIN GIÁO VIÊN
      // =========================

      doc.setFont(
        "NotoSans",
        "bold"
      );

      doc.text(
        "THÔNG TIN GIÁO VIÊN",
        15,
        29
      );

      doc.setFont(
        "NotoSans",
        "normal"
      );

      doc.text(
        "Tên giáo viên: Nguyễn Thị Nam Giang",
        15,
        36
      );

      doc.text(
        "SĐT: 123",
        15,
        43
      );

      doc.text(
        `Lớp: ${classFilter}`,
        160,
        36
      );

      doc.text(
        `Số học sinh: ${filteredStudents.length}`,
        160,
        43
      );

      // =========================
      // DỮ LIỆU BẢNG
      // =========================

      const rows = filteredStudents.map(
        (student, index) => {
          const earned =
            getEarned(student);

          const paid =
            getPaid(student);

          const debt =
            earned - paid;

          return [
            index + 1,
            student.name || "",
            student.className || "",
            money(
              student.feePerLesson
            ),
            student.attendedLessons || 0,
            money(earned),
            money(paid),
            money(debt),
          ];
        }
      );

      // =========================
      // BẢNG
      // =========================

      autoTable(doc, {
        startY: 50,

        head: [
          [
            "STT",
            "Học sinh",
            "Lớp",
            "Phí/buổi",
            "Buổi học",
            "Tổng phải thu",
            "Đã thu",
            "Còn thiếu",
          ],
        ],

        body: rows,

        theme: "grid",

        styles: {
          font: "NotoSans",
          fontStyle: "normal",
          fontSize: 9,
          cellPadding: 3,
          lineColor: [
            220,
            223,
            230,
          ],
          lineWidth: 0.2,
          textColor: [
            31,
            41,
            55,
          ],
          valign: "middle",
        },

        headStyles: {
          font: "NotoSans",
          fontStyle: "bold",
          fontSize: 9,
          halign: "center",
          valign: "middle",
        },

        columnStyles: {
          0: {
            halign: "center",
            cellWidth: 13,
          },

          1: {
            halign: "left",
            cellWidth: 55,
          },

          2: {
            halign: "center",
            cellWidth: 30,
          },

          3: {
            halign: "right",
            cellWidth: 32,
          },

          4: {
            halign: "center",
            cellWidth: 25,
          },

          5: {
            halign: "right",
            cellWidth: 38,
          },

          6: {
            halign: "right",
            cellWidth: 35,
          },

          7: {
            halign: "right",
            cellWidth: 35,
          },
        },

        didParseCell: (data) => {
          if (
            data.section === "body" &&
            data.column.index === 7
          ) {
            const value =
              filteredStudents[
                data.row.index
              ];

            if (value) {
              const debt =
                getDebt(value);

              if (debt > 0) {
                data.cell.styles.textColor =
                  [180, 35, 24];
              } else {
                data.cell.styles.textColor =
                  [8, 116, 67];
              }
            }
          }
        },
      });

      // =========================
      // THÔNG TIN CUỐI BẢNG
      // =========================

      let y =
        doc.lastAutoTable.finalY + 10;

      // Tổng
      doc.setFont(
        "NotoSans",
        "bold"
      );

      doc.setFontSize(11);

      doc.text(
        `TỔNG PHẢI THU: ${money(
          totalEarned
        )}`,
        15,
        y
      );

      doc.text(
        `ĐÃ THU: ${money(
          totalPaid
        )}`,
        105,
        y
      );

      doc.text(
        `CÒN THIẾU: ${money(
          totalDebt
        )}`,
        180,
        y
      );

      y += 12;

      // =========================
      // CHUYỂN KHOẢN
      // =========================

      doc.setFontSize(12);

      doc.text(
        "THÔNG TIN CHUYỂN KHOẢN",
        15,
        y
      );

      y += 7;

      doc.setFont(
        "NotoSans",
        "normal"
      );

      doc.setFontSize(10);

      doc.text(
        "Số tài khoản: 12345",
        15,
        y
      );

      y += 6;

      doc.text(
        "Chủ tài khoản: Nguyễn Thị Nam Giang",
        15,
        y
      );

      y += 6;

      doc.text(
        "Ngân hàng: MB Bank",
        15,
        y
      );

      // =========================
      // LƯU Ý
      // =========================

      y += 11;

      doc.setFont(
        "NotoSans",
        "bold"
      );

      doc.setFontSize(12);

      doc.text(
        "LƯU Ý PHỤ HUYNH",
        15,
        y
      );

      y += 7;

      doc.setFont(
        "NotoSans",
        "normal"
      );

      doc.setFontSize(10);

      const note =
        "Vui lòng thanh toán học phí đúng hạn. " +
        "Khi chuyển khoản, phụ huynh vui lòng ghi rõ " +
        "họ tên học sinh để giáo viên dễ dàng kiểm tra.";

      const noteLines =
        doc.splitTextToSize(
          note,
          265
        );

      doc.text(
        noteLines,
        15,
        y
      );

      // =========================
      // FOOTER
      // =========================

      const pageCount =
        doc.getNumberOfPages();

      for (
        let i = 1;
        i <= pageCount;
        i++
      ) {
        doc.setPage(i);

        doc.setFont(
          "NotoSans",
          "normal"
        );

        doc.setFontSize(8);

        doc.text(
          `Trang ${i}/${pageCount}`,
          282,
          202,
          {
            align: "right",
          }
        );
      }

      // =========================
      // DOWNLOAD
      // =========================

      const safeDate =
        dateText.replaceAll(
          "/",
          "-"
        );

      const className =
        classFilter === "Tất cả"
          ? "tat-ca"
          : classFilter
              .replaceAll(" ", "-")
              .replaceAll("/", "-");

      doc.save(
        `bang-hoc-phi-${className}-${safeDate}.pdf`
      );
    } catch (error) {
      console.error(
        "Lỗi xuất PDF:",
        error
      );

      alert(
        "Không thể tạo file PDF. " +
          "Hãy kiểm tra 2 file font trong public/fonts."
      );
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <>
      <PageTitle
        title="Học phí"
        desc="Theo dõi học phí của tất cả học sinh theo từng lớp."
      />

      {/* =========================
          TOOLBAR
      ========================= */}

      <div className="card fee-toolbar">
        <div className="fee-toolbar-top">
          <div className="fee-filter">
            <label className="field">
              <span>Lớp học</span>

              <select
                value={classFilter}
                onChange={(e) =>
                  setClassFilter(
                    e.target.value
                  )
                }
              >
                {classNames.map(
                  (name) => (
                    <option
                      key={name}
                      value={name}
                    >
                      {name}
                    </option>
                  )
                )}
              </select>
            </label>
          </div>

          <button
            className="primary pdf-button"
            onClick={exportFeePDF}
            disabled={
              pdfLoading ||
              filteredStudents.length === 0
            }
          >
            {pdfLoading
              ? "Đang tạo PDF..."
              : "📄 Xuất học phí PDF"}
          </button>
        </div>

        {/* =========================
            SUMMARY
        ========================= */}

        <div className="fee-summary">
          <div>
            <span>Học sinh</span>
            <b>
              {filteredStudents.length}
            </b>
          </div>

          <div>
            <span>Tổng phải thu</span>
            <b>
              {money(totalEarned)}
            </b>
          </div>

          <div>
            <span>Đã thu</span>
            <b>
              {money(totalPaid)}
            </b>
          </div>

          <div>
            <span>Còn thiếu</span>
            <b
              className={
                totalDebt > 0
                  ? "fee-debt"
                  : "fee-paid"
              }
            >
              {money(totalDebt)}
            </b>
          </div>
        </div>
      </div>

      {/* =========================
          TABLE
      ========================= */}

      <div className="card table-wrap fee-table-wrap">
        <table className="fee-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Học sinh</th>
              <th>Lớp</th>
              <th>Phí/buổi</th>
              <th>Buổi học</th>
              <th>Tổng phải thu</th>
              <th>Đã thu</th>
              <th>Còn thiếu</th>
              <th>Thanh toán</th>
            </tr>
          </thead>

          <tbody>
            {filteredStudents.map(
              (student, index) => {
                const earned =
                  getEarned(student);

                const paid =
                  getPaid(student);

                const debt =
                  earned - paid;

                return (
                  <tr
                    key={student.id}
                  >
                    <td className="text-center">
                      {index + 1}
                    </td>

                    <td>
                      <div className="student-fee-name">
                        <b>
                          {student.name}
                        </b>

                        {student.phone && (
                          <small>
                            {student.phone}
                          </small>
                        )}
                      </div>
                    </td>

                    <td>
                      <span className="tag">
                        {student.className ||
                          "Chưa có lớp"}
                      </span>
                    </td>

                    <td className="money-cell">
                      {money(
                        student.feePerLesson
                      )}
                    </td>

                    <td className="text-center">
                      {student.attendedLessons ||
                        0}
                    </td>

                    <td className="money-cell">
                      <b>
                        {money(earned)}
                      </b>
                    </td>

                    <td className="money-cell">
                      {money(paid)}
                    </td>

                    <td className="money-cell">
                      <strong
                        className={
                          debt > 0
                            ? "fee-debt"
                            : "fee-paid"
                        }
                      >
                        {money(debt)}
                      </strong>
                    </td>

                    <td>
                      <div className="payment-inline">
                        <input
                          type="number"
                          min="0"
                          placeholder="Số tiền"
                          value={
                            amounts[
                              student.id
                            ] || ""
                          }
                          onChange={(e) =>
                            setAmounts(
                              (prev) => ({
                                ...prev,
                                [student.id]:
                                  e.target.value,
                              })
                            )
                          }
                        />

                        <button
                          className="primary"
                          onClick={() =>
                            handlePayment(
                              student
                            )
                          }
                          disabled={
                            !Number(
                              amounts[
                                student.id
                              ] || 0
                            )
                          }
                        >
                          Thu
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              }
            )}

            {filteredStudents.length ===
              0 && (
              <tr>
                <td
                  colSpan="9"
                  className="empty-fee"
                >
                  Không có học sinh.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
function TimeSettings({ slots, API, onReload, notify }) {
  const [v, setV] = useState({
    name: "",
    startTime: "08:00",
    endTime: "09:00",
  });
  const add = async () => {
    if (!v.startTime || !v.endTime) return;
    await fetch(`${API}/time-slots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(v),
    });
    setV({ name: "", startTime: "08:00", endTime: "09:00" });
    onReload();
    notify("Đã thêm khung giờ");
  };
  const edit = async (x) => {
    const start = prompt("Giờ bắt đầu", x.startTime),
      end = prompt("Giờ kết thúc", x.endTime);
    if (start && end) {
      await fetch(`${API}/time-slots/${x.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: x.name, startTime: start, endTime: end }),
      });
      onReload();
      notify("Đã sửa giờ");
    }
  };
  const del = async (id) => {
    if (confirm("Xóa khung giờ?")) {
      await fetch(`${API}/time-slots/${id}`, { method: "DELETE" });
      onReload();
    }
  };
  return (
    <>
      <PageTitle
        title="Cài đặt giờ học"
        desc="Bạn có thể tự điều chỉnh giờ bắt đầu và kết thúc từng tiết."
      />
      <div className="card form-card">
        <div className="time-add">
          <input
            placeholder="Tên tiết, ví dụ Tiết 1"
            value={v.name}
            onChange={(e) => setV({ ...v, name: e.target.value })}
          />
          <input
            type="time"
            value={v.startTime}
            onChange={(e) => setV({ ...v, startTime: e.target.value })}
          />
          <span>→</span>
          <input
            type="time"
            value={v.endTime}
            onChange={(e) => setV({ ...v, endTime: e.target.value })}
          />
          <button className="primary" onClick={add}>
            <Plus size={17} /> Thêm
          </button>
        </div>
      </div>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Tiết</th>
              <th>Bắt đầu</th>
              <th>Kết thúc</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {slots.map((x) => (
              <tr key={x.id}>
                <td>{x.name}</td>
                <td>{x.startTime}</td>
                <td>{x.endTime}</td>
                <td>
                  <button className="outline" onClick={() => edit(x)}>
                    Sửa
                  </button>{" "}
                  <button className="icon-btn" onClick={() => del(x.id)}>
                    <Trash2 size={17} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
function Modal({ title, children, onClose, onSave }) {
  return (
    <div className="modal-bg">
      <div className="modal">
        <div className="modal-head">
          <h2>{title}</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>
        {children}
        <div className="modal-actions">
          <button className="outline" onClick={onClose}>
            Hủy
          </button>
          <button className="primary" onClick={onSave}>
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
function Field({ label, ...p }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input {...p} />
    </label>
  );
}
function StudentModal({ onClose, onSave }) {
  const [v, setV] = useState({
    name: "",
    className: "8A",
    phone: "",
    note: "",
    feePerLesson: 100000,
  });
  return (
    <Modal
      title="Thêm học sinh"
      onClose={onClose}
      onSave={() => v.name && onSave(v)}
    >
      <Field
        label="Họ tên"
        value={v.name}
        onChange={(e) => setV({ ...v, name: e.target.value })}
        placeholder="Nguyễn Văn B"
      />
      <Field
        label="Lớp"
        value={v.className}
        onChange={(e) => setV({ ...v, className: e.target.value })}
      />
      <Field
        label="Số điện thoại"
        value={v.phone}
        onChange={(e) => setV({ ...v, phone: e.target.value })}
      />
      <Field
        label="Học phí / buổi"
        type="number"
        value={v.feePerLesson}
        onChange={(e) => setV({ ...v, feePerLesson: e.target.value })}
      />
      <Field
        label="Ghi chú"
        value={v.note}
        onChange={(e) => setV({ ...v, note: e.target.value })}
      />
    </Modal>
  );
}
function ClassModal({ onClose, onSave }) {
  const [name, setName] = useState("");
  return (
    <Modal
      title="Thêm lớp"
      onClose={onClose}
      onSave={() => name && onSave({ name, teacher: "Nguyễn Văn An" })}
    >
      <Field
        label="Tên lớp"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="8C"
      />
    </Modal>
  );
}
function ScheduleModal({ onClose, onSave, slots, classes, students }) {
  const [v, setV] = useState({
    day: "Thứ 2",
    time: slots[0]
      ? `${slots[0].startTime} - ${slots[0].endTime}`
      : "08:00 - 09:00",
    subject: "",
    className: classes[0]?.name || "8A",
    room: "P.101",
    studentId: "",
  });
  return (
    <Modal
      title="Thêm tiết học"
      onClose={onClose}
      onSave={() =>
        v.subject && onSave({ ...v, studentId: v.studentId || null })
      }
    >
      <label className="field">
        <span>Thứ</span>
        <select
          value={v.day}
          onChange={(e) => setV({ ...v, day: e.target.value })}
        >
          {days.map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Thời gian</span>
        <select
          value={v.time}
          onChange={(e) => setV({ ...v, time: e.target.value })}
        >
          {slots.map((x) => (
            <option key={x.id}>
              {x.startTime} - {x.endTime}
            </option>
          ))}
        </select>
      </label>
      <Field
        label="Môn học"
        value={v.subject}
        onChange={(e) => setV({ ...v, subject: e.target.value })}
        placeholder="Toán"
      />
      <label className="field">
        <span>Lớp</span>
        <select
          value={v.className}
          onChange={(e) => setV({ ...v, className: e.target.value })}
        >
          {classes.map((x) => (
            <option key={x.id}>{x.name}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Học sinh riêng (không bắt buộc)</span>
        <select
          value={v.studentId}
          onChange={(e) => setV({ ...v, studentId: e.target.value })}
        >
          <option value="">Lịch chung của lớp</option>
          {students.map((x) => (
            <option value={x.id} key={x.id}>
              {x.name}
            </option>
          ))}
        </select>
      </label>
      <Field
        label="Phòng"
        value={v.room}
        onChange={(e) => setV({ ...v, room: e.target.value })}
      />
    </Modal>
  );
}
createRoot(document.getElementById("root")).render(<App />);
