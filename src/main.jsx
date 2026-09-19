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
  Check,
  Search,
  Menu,
  X,
  Wallet,
  Settings,
  ClipboardCheck,
  Pencil,
} from "lucide-react";
import "./style.css";

const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

const money = (n) =>
  new Intl.NumberFormat("vi-VN").format(Number(n) || 0) + "đ";

const today = () => new Date().toISOString().slice(0, 10);
const currentMonth = () => today().slice(0, 7);

const dayIndex = (label) =>
  days.indexOf(label) + 1 === 7 ? 0 : days.indexOf(label) + 1;

function App() {
  const API = import.meta.env.VITE_API_URL || "/api";

  const [page, setPage] = useState(
    location.pathname.startsWith("/share/") ? "public" : "dashboard",
  );

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("teacher_subjects") || "[]");
    } catch {
      return [];
    }
  });
  const [schedules, setSchedules] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [slots, setSlots] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [payments, setPayments] = useState([]);
  const [settings, setSettings] = useState(null);

  const [modal, setModal] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [publicData, setPublicData] = useState(null);

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

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        studentsRes,
        classesRes,
        schedulesRes,
        lessonsRes,
        slotsRes,
        attendanceRes,
        paymentsRes,
        settingsRes,
      ] = await Promise.all([
        fetch(`${API}/students`),
        fetch(`${API}/classes`),
        fetch(`${API}/schedules`),
        fetch(`${API}/lessons`),
        fetch(`${API}/time-slots`),
        fetch(`${API}/attendance`),
        fetch(`${API}/payments`),
        fetch(`${API}/settings`),
      ]);

      if (
        [
          studentsRes,
          classesRes,
          schedulesRes,
          lessonsRes,
          slotsRes,
          attendanceRes,
          paymentsRes,
          settingsRes,
        ].some((x) => !x.ok)
      ) {
        throw Error();
      }

      const [
        studentsData,
        classesData,
        schedulesData,
        lessonsData,
        slotsData,
        attendanceData,
        paymentsData,
        settingsData,
      ] = await Promise.all([
        studentsRes.json(),
        classesRes.json(),
        schedulesRes.json(),
        lessonsRes.json(),
        slotsRes.json(),
        attendanceRes.json(),
        paymentsRes.json(),
        settingsRes.json(),
      ]);

      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setClasses(Array.isArray(classesData) ? classesData : []);
      setSchedules(Array.isArray(schedulesData) ? schedulesData : []);
      setLessons(Array.isArray(lessonsData) ? lessonsData : []);
      setSlots(Array.isArray(slotsData) ? slotsData : []);
      setAttendance(Array.isArray(attendanceData) ? attendanceData : []);
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      setSettings(settingsData || {});
    } catch (e) {
      console.error(e);

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
    } else {
      load();
    }
  }, []);

  const notify = (m) => {
    setToast(m);
    setTimeout(() => setToast(""), 1800);
  };

  const saveStudent = async (v) => {
    try {
      const x = await api(v.id ? `/students/${v.id}` : "/students", {
        method: v.id ? "PUT" : "POST",
        body: JSON.stringify(v),
      });

      setStudents((s) =>
        v.id ? s.map((q) => (q.id === x.id ? x : q)) : [...s, x],
      );

      setModal(null);

      notify(v.id ? "Đã cập nhật học sinh" : "Đã thêm học sinh");
    } catch (e) {
      alert(e.message || "Không thể lưu học sinh");
    }
  };

  const deleteStudent = async (id) => {
    if (confirm("Xóa học sinh này?")) {
      try {
        await api(`/students/${id}`, {
          method: "DELETE",
        });

        setStudents((s) => s.filter((x) => x.id !== id));

        notify("Đã xóa học sinh");
      } catch (e) {
        alert(e.message || "Không thể xóa học sinh");
      }
    }
  };

  const addClass = async (v) => {
    try {
      const x = await api("/classes", {
        method: "POST",
        body: JSON.stringify(v),
      });

      setClasses((c) => [...c, x]);
      setModal(null);

      notify("Đã thêm lớp");

      return x;
    } catch (e) {
      alert(e.message || "Không thể thêm lớp");
      return null;
    }
  };

  const addSubject = async (name) => {
    const subjectName = String(name || "").trim();

    if (!subjectName) {
      alert("Vui lòng nhập tên môn học.");
      return null;
    }

    const duplicated = subjects.some(
      (x) => String(x).toLowerCase() === subjectName.toLowerCase(),
    );

    if (duplicated) {
      alert("Môn học này đã tồn tại.");
      return null;
    }

    const next = [...subjects, subjectName];

    setSubjects(next);

    localStorage.setItem("teacher_subjects", JSON.stringify(next));

    notify("Đã thêm môn học");

    return subjectName;
  };
  const saveSchedule = async (v) => {
    const x = await api(v.id ? `/schedules/${v.id}` : "/schedules", {
      method: v.id ? "PUT" : "POST",
      body: JSON.stringify(v),
    });

    setSchedules((s) =>
      v.id ? s.map((q) => (q.id === x.id ? x : q)) : [...s, x],
    );

    setModal(null);

    notify(v.id ? "Đã cập nhật lịch" : "Đã thêm lịch");
  };

  const deleteSchedule = async (id) => {
    if (confirm("Xóa lịch học này?")) {
      await api(`/schedules/${id}`, {
        method: "DELETE",
      });

      setSchedules((s) => s.filter((x) => x.id !== id));

      notify("Đã xóa lịch");
    }
  };

  const mark = async (v) => {
    const x = await api("/attendance", {
      method: "POST",
      body: JSON.stringify(v),
    });

    setAttendance((a) => {
      const i = a.findIndex((q) => q.id === x.id);

      return i >= 0 ? a.map((q) => (q.id === x.id ? x : q)) : [x, ...a];
    });

    setLessons((ls) =>
      ls.map((l) =>
        l.id === v.lessonId
          ? {
              ...l,
              status: v.status,
              fee: x.fee,
            }
          : l,
      ),
    );

    notify("Đã lưu điểm danh");
  };

  const addLesson = async (v) => {
    try {
      const x = await api("/lessons", {
        method: "POST",
        body: JSON.stringify(v),
      });

      setLessons((ls) => [x, ...ls]);

      // Đóng cửa sổ sau khi thêm thành công
      setModal(null);

      notify("Đã thêm buổi học");
    } catch (e) {
      alert(e.message || "Không thể thêm buổi học");
    }
  };

  const deleteLesson = async (id) => {
    if (confirm("Xóa buổi học này?")) {
      await api(`/lessons/${id}`, {
        method: "DELETE",
      });

      setLessons((ls) => ls.filter((x) => x.id !== id));

      setAttendance((a) => a.filter((x) => Number(x.lessonId) !== Number(id)));

      notify("Đã xóa buổi học");
    }
  };

const copyStudentLink = async (id) => {
  try {
    const x = await api("/share-links", {
      method: "POST",
      body: JSON.stringify({
        studentId: Number(id),
      }),
    });

    const url = `${location.origin}/share/${x.token}`;

    await navigator.clipboard?.writeText(url);

    notify("Đã copy lịch học trong tuần");
  } catch (e) {
    alert(e.message || "Không thể tạo link chia sẻ");
  }
};

  const stats = useMemo(
    () => ({
      students: students.length,
      classes: classes.length,
      lessons: lessons.length,
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

        <div className="teacher">👨‍🏫 {settings?.teacherName || "Giáo viên"}</div>
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
            text="Cài đặt"
            active={page === "settings"}
            onClick={() => nav("settings")}
          />
        </aside>

        <main className="content">
          {page === "public" ? (
            loading ? (
              <div className="card loading">Đang tải lịch...</div>
            ) : error ? (
              <div className="card error">{error}</div>
            ) : (
              <PublicSchedule data={publicData} />
            )
          ) : loading ? (
            <div className="card loading">Đang tải dữ liệu...</div>
          ) : error ? (
            <div className="card error">
              {error}

              <button className="primary" onClick={load}>
                Thử lại
              </button>
            </div>
          ) : (
            <>
              {page === "dashboard" && (
                <Dashboard stats={stats} onNavigate={nav} />
              )}

{page === "students" && (
  <Students
    students={students}
    lessons={lessons}
    onAdd={() =>
      setModal({
        type: "student",
      })
    }
    onEdit={(s) =>
      setModal({
        type: "student",
        data: s,
      })
    }
    onDelete={deleteStudent}
    onShare={copyStudentLink}
  />
)}

              {page === "classes" && (
                <Classes
                  classes={classes}
                  onAdd={() =>
                    setModal({
                      type: "class",
                    })
                  }
                />
              )}

              {page === "schedule" && (
                <Schedule
                  schedules={schedules}
                  students={students}
                  slots={slots}
                  lessons={lessons}
                  onAdd={() =>
                    setModal({
                      type: "schedule",
                    })
                  }
                  onEdit={(x) =>
                    setModal({
                      type: "schedule",
                      data: x,
                    })
                  }
                  onDelete={deleteSchedule}
                  onDeleteLesson={deleteLesson}
                />
              )}

              {page === "attendance" && (
                <Attendance
                  students={students}
                  lessons={lessons}
                  attendance={attendance}
                  onMark={mark}
                  onAdd={() =>
                    setModal({
                      type: "lesson",
                    })
                  }
                  onDelete={deleteLesson}
                />
              )}

              {page === "fees" && (
                <Fees
                  students={students}
                  attendance={attendance}
                  payments={payments}
                  onPayment={async (v) => {
                    await api("/payments", {
                      method: "POST",
                      body: JSON.stringify(v),
                    });

                    notify("Đã ghi nhận thanh toán");

                    await load();
                  }}
                  settings={settings}
                />
              )}

              {page === "settings" && (
                <SettingsPage
                  settings={settings}
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
        <StudentModal
          data={modal.data}
          classes={classes}
          onClose={() => setModal(null)}
          onSave={saveStudent}
          onAddClass={async (classData) => {
            const newClass = await addClass(classData);

            if (newClass) {
              return newClass;
            }

            return null;
          }}
        />
      )}

      {modal?.type === "class" && (
        <ClassModal onClose={() => setModal(null)} onSave={addClass} />
      )}

      {modal?.type === "schedule" && (
        <ScheduleModal
          data={modal.data}
          students={students}
          slots={slots}
          onClose={() => setModal(null)}
          onSave={saveSchedule}
        />
      )}
      {modal?.type === "lesson" && (
        <LessonModal
          students={students}
          subjects={subjects}
          slots={slots}
          onClose={() => setModal(null)}
          onSave={addLesson}
          onAddSubject={addSubject}
        />
      )}
    </div>
  );
}

function Nav({ icon, text, active, onClick }) {
  return (
    <button className={`nav ${active ? "active" : ""}`} onClick={onClick}>
      {React.cloneElement(icon, {
        size: 19,
      })}
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
  const [weekStart, setWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay();

    // JavaScript: Sunday = 0
    // Monday = 1
    const diff = day === 0 ? -6 : 1 - day;

    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);

    return monday;
  });

  const formatLocalDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");

    return `${y}-${m}-${d}`;
  };

  const formatDisplayDate = (date) => {
    return `${String(date.getDate()).padStart(2, "0")}/${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}`;
  };

  const addDays = (date, amount) => {
    const result = new Date(date);
    result.setDate(result.getDate() + amount);
    return result;
  };

  const weekDays = days.map((label, index) => {
    const date = addDays(weekStart, index);

    return {
      label,
      date,
      dateString: formatLocalDate(date),
    };
  });

  const weekEnd = weekDays[6].date;

  const weekLessons = (data?.lessons || [])
    .filter((lesson) => {
      return (
        lesson.lessonDate >= formatLocalDate(weekStart) &&
        lesson.lessonDate <= formatLocalDate(weekEnd)
      );
    })
    .sort((a, b) => {
      if (a.lessonDate !== b.lessonDate) {
        return a.lessonDate.localeCompare(b.lessonDate);
      }

      return String(a.time || "").localeCompare(
        String(b.time || ""),
      );
    });

  const lessonsByDate = (dateString) => {
    return weekLessons.filter(
      (lesson) => lesson.lessonDate === dateString,
    );
  };

  const goPreviousWeek = () => {
    setWeekStart((current) => addDays(current, -7));
  };

  const goNextWeek = () => {
    setWeekStart((current) => addDays(current, 7));
  };

  const goCurrentWeek = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;

    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);

    setWeekStart(monday);
  };

  const weekTitle =
    `${formatDisplayDate(weekStart)} - ` +
    `${formatDisplayDate(weekEnd)}`;

  return (
    <>
      <PageTitle
        title={`Thời gian biểu của ${
          data?.student?.name || "học sinh"
        }`}
        desc={`Lớp ${
          data?.student?.className || ""
        } · Lịch học trong tuần`}
      />

      <div className="card public-card">
        <div className="public-header">
          <div className="avatar">👨‍🎓</div>

          <div>
            <h2>{data?.student?.name}</h2>
            <p>
              {data?.student?.className || "Chưa có lớp"}
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          <button
            className="secondary"
            onClick={goPreviousWeek}
          >
            ← Tuần trước
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <b>{weekTitle}</b>

            <button
              className="secondary"
              onClick={goCurrentWeek}
            >
              Tuần này
            </button>
          </div>

          <button
            className="secondary"
            onClick={goNextWeek}
          >
            Tuần sau →
          </button>
        </div>

        <div className="mini-schedule">
          {weekDays.map((day) => {
            const dayLessons = lessonsByDate(
              day.dateString,
            );

            return (
              <div key={day.dateString}>
                <h3>
                  {day.label}
                  <small
                    style={{
                      marginLeft: 8,
                      fontWeight: 400,
                      opacity: 0.7,
                    }}
                  >
                    {formatDisplayDate(day.date)}
                  </small>
                </h3>

                {dayLessons.length > 0 ? (
                  dayLessons.map((lesson) => (
                    <div
                      className="public-lesson"
                      key={lesson.id}
                    >
                      <b>{lesson.time}</b>

                      <span>
                        {lesson.subject}

                        {lesson.room
                          ? ` · ${lesson.room}`
                          : ""}

                        {lesson.status === "attended" && (
                          <small
                            style={{
                              display: "block",
                              marginTop: 3,
                              opacity: 0.7,
                            }}
                          >
                            Đã học
                          </small>
                        )}

                        {lesson.status === "absent" && (
                          <small
                            style={{
                              display: "block",
                              marginTop: 3,
                              opacity: 0.7,
                            }}
                          >
                            Vắng
                          </small>
                        )}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="public-lesson">
                    <span>Không có lịch học</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function Dashboard({ stats, onNavigate }) {
  return (
    <>
      <PageTitle
        title="Tổng quan"
        desc="Quản lý lịch dạy, học sinh, điểm danh và học phí."
      />

      <div className="stats">
        <Stat icon={<Users />} label="Học sinh" value={stats.students} />

        <Stat icon={<School />} label="Lớp học" value={stats.classes} />

        <Stat icon={<CalendarDays />} label="Lịch học" value={stats.lessons} />

        <Stat
          icon={<Wallet />}
          label="Đã học tính tiền"
          value={money(stats.earned)}
        />
      </div>

      <section className="card">
        <div className="card-head">
          <div>
            <h2>Quản lý nhanh</h2>
            <p>Chọn chức năng bạn muốn quản lý.</p>
          </div>
        </div>

        <div className="quick-grid">
          <button onClick={() => onNavigate("students")}>
            👨‍🎓 Quản lý học sinh
          </button>

          <button onClick={() => onNavigate("attendance")}>✅ Điểm danh</button>

          <button onClick={() => onNavigate("fees")}>💰 Học phí</button>

          <button onClick={() => onNavigate("settings")}>⚙️ Cài đặt</button>
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

function Students({
  students,
  lessons,
  onAdd,
  onEdit,
  onDelete,
  onShare,
}) {
  const [q, setQ] = useState("");

  const list = students.filter((s) =>
    (s.name + " " + s.className + " " + s.phone)
      .toLowerCase()
      .includes(q.toLowerCase()),
  );

  // Đếm số buổi đã học thực tế của từng học sinh
  const getAttendedLessons = (studentId) => {
    return (lessons || []).filter(
      (l) =>
        Number(l.studentId) === Number(studentId) &&
        l.status === "attended",
    ).length;
  };

  return (
    <>
      <PageTitle
        title="Học sinh"
        desc="Quản lý thông tin và học phí riêng của từng học sinh."
        action={
          <button className="primary" onClick={onAdd}>
            <Plus size={18} />
            Thêm học sinh
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
              <th>SĐT</th>
              <th>Lớp</th>
              <th>Phí/buổi</th>
              <th>Đã học</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {list.map((s) => {
              const attendedLessons = getAttendedLessons(s.id);

              return (
                <tr key={s.id}>
                  <td>
                    <b>{s.name}</b>
                    <small>{s.note}</small>
                  </td>

                  <td>{s.phone || "—"}</td>

                  <td>
                    <span className="tag">
                      {s.className || "Chưa có lớp"}
                    </span>
                  </td>

                  <td>{money(s.feePerLesson)}</td>

                  <td>
                    <b>{attendedLessons}</b> buổi
                  </td>

                  <td>
                    <button
                      className="icon-btn"
                      title="Sửa"
                      onClick={() => onEdit(s)}
                    >
                      <Pencil size={17} />
                    </button>

                    <button
                      className="icon-btn"
                      title="Copy link"
                      onClick={() => onShare(s.id)}
                    >
                      <Link2 size={17} />
                    </button>

                    <button
                      className="icon-btn"
                      title="Xóa"
                      onClick={() => onDelete(s.id)}
                    >
                      <Trash2 size={17} />
                    </button>
                  </td>
                </tr>
              );
            })}

            {list.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-fee">
                  Không tìm thấy học sinh.
                </td>
              </tr>
            )}
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
        desc="Danh sách lớp dùng để phân loại học sinh."
        action={
          <button className="primary" onClick={onAdd}>
            <Plus size={18} />
            Thêm lớp
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

              <span>{c.count || 0} học sinh</span>
            </div>
          </div>
        ))}
      </div>

      {classes.length === 0 && (
        <div className="card empty-fee">
          Chưa có lớp học.
          <br />
          Hãy bấm "Thêm lớp" để tạo lớp đầu tiên.
        </div>
      )}
    </>
  );
}

function Schedule({
  schedules,
  students,
  slots,
  lessons,
  onAdd,
  onEdit,
  onDelete,
  onDeleteLesson,
}) {
  const [sid, setSid] = useState("Tất cả");

  // Ngày đầu tuần hiện tại (Thứ 2)
  const getMonday = (date = new Date()) => {
    const d = new Date(date);
    d.setHours(12, 0, 0, 0);

    const day = d.getDay(); // CN = 0, T2 = 1
    const diff = day === 0 ? -6 : 1 - day;

    d.setDate(d.getDate() + diff);

    return d;
  };

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");

    return `${y}-${m}-${d}`;
  };

  const formatDisplayDate = (date) => {
    return `${String(date.getDate()).padStart(2, "0")}/${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}`;
  };

  const [weekStart, setWeekStart] = useState(() => getMonday());

  // Tạo 7 ngày trong tuần đang chọn
  const weekDates = useMemo(() => {
    return days.map((day, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);

      return {
        day,
        date,
        dateString: formatDate(date),
        displayDate: formatDisplayDate(date),
      };
    });
  }, [weekStart]);

  const weekEnd = weekDates[6];

  // Chỉ lấy lesson trong tuần hiện tại
  const weekLessons = useMemo(() => {
    if (!weekDates.length) return [];

    const start = weekDates[0].dateString;
    const end = weekDates[6].dateString;

    return lessons.filter((x) => {
      const lessonDate = String(x.lessonDate || "");

      const correctDate =
        lessonDate >= start && lessonDate <= end;

      const correctStudent =
        sid === "Tất cả" ||
        Number(x.studentId) === Number(sid);

      return correctDate && correctStudent;
    });
  }, [lessons, sid, weekDates]);

  const previousWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };

  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  const currentWeek = () => {
    setWeekStart(getMonday());
  };

  const getStudentName = (studentId, fallback) => {
    return (
      fallback ||
      students.find(
        (s) => Number(s.id) === Number(studentId),
      )?.name ||
      "Học sinh"
    );
  };

  const getLessonsForCell = (dateString, time) => {
    return weekLessons.filter(
      (l) =>
        String(l.lessonDate) === String(dateString) &&
        String(l.time) === String(time),
    );
  };

  return (
    <>
      <PageTitle
        title="Thời gian biểu"
        desc="Lịch học cố định và các buổi học thực tế trong tuần."
        action={
          <button className="primary" onClick={onAdd}>
            <Plus size={18} />
            Thêm lịch học
          </button>
        }
      />

      {/* Bộ lọc */}
      <div className="card form-card attendance-filter">
        <label className="field">
          <span>Học sinh</span>

          <select
            value={sid}
            onChange={(e) => setSid(e.target.value)}
          >
            <option value="Tất cả">
              Tất cả học sinh
            </option>

            {students.map((s) => (
              <option value={s.id} key={s.id}>
                {s.name} · {s.className}
              </option>
            ))}
          </select>
        </label>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <button
            className="outline"
            onClick={previousWeek}
          >
            ← Tuần trước
          </button>

          <button
            className="outline"
            onClick={currentWeek}
          >
            Tuần này
          </button>

          <button
            className="outline"
            onClick={nextWeek}
          >
            Tuần sau →
          </button>
        </div>
      </div>

      {/* Header tuần */}
      <div className="card month-schedule">
        <div className="month-schedule-head">
          <b>
            Tuần {weekDates[0]?.displayDate} -{" "}
            {weekEnd?.displayDate}
          </b>

          <span>
            {weekLessons.length} buổi học
          </span>
        </div>

        {/* Danh sách buổi học thực tế trong tuần */}
        <div className="month-list">
          {weekLessons
            .slice()
            .sort(
              (a, b) =>
                String(a.lessonDate).localeCompare(
                  String(b.lessonDate),
                ) ||
                String(a.time).localeCompare(
                  String(b.time),
                ),
            )
            .map((l) => {
              const d = new Date(
                `${l.lessonDate}T12:00:00`,
              );

              const dayName =
                days[
                  d.getDay() === 0
                    ? 6
                    : d.getDay() - 1
                ];

              return (
                <div
                  className="month-lesson"
                  key={l.id}
                >
                  <div className="month-date">
                    <b>
                      {String(l.lessonDate).slice(8, 10)}
                    </b>

                    <span>
                      /
                      {String(l.lessonDate).slice(
                        5,
                        7,
                      )}
                    </span>
                  </div>

                  <div className="month-info">
                    <b>
                      {getStudentName(
                        l.studentId,
                        l.studentName,
                      )}
                    </b>

                    <span>
                      {dayName} · {l.time} ·{" "}
                      {l.subject} · {l.className}
                    </span>
                  </div>

                  <span
                    className={`status-tag ${
                      l.status || ""
                    }`}
                  >
                    {l.status === "attended"
                      ? "Đã học"
                      : l.status === "absent"
                        ? "Nghỉ"
                        : "Chưa điểm danh"}
                  </span>

                  <button
                    className="icon-btn danger-icon"
                    title="Xóa buổi"
                    onClick={() =>
                      onDeleteLesson(l.id)
                    }
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}

          {weekLessons.length === 0 && (
            <div className="empty-fee">
              Chưa có buổi học trong tuần này.
            </div>
          )}
        </div>
      </div>

      {/* ================================
          BẢNG THỜI GIAN BIỂU TRONG TUẦN
         ================================= */}
      <div className="card schedule-wrap">
        <div className="schedule-grid">
          <div className="corner">
            Giờ
          </div>

          {weekDates.map((x) => (
            <div
              className="day-head"
              key={x.dateString}
            >
              <div>{x.day}</div>

              <small
                style={{
                  display: "block",
                  marginTop: "3px",
                  fontWeight: 400,
                  opacity: 0.75,
                }}
              >
                {x.displayDate}
              </small>
            </div>
          ))}

          {slots.map((slot) => {
            const time = `${slot.startTime} - ${slot.endTime}`;

            return (
              <React.Fragment key={slot.id}>
                <div className="time-cell">
                  {slot.name && (
                    <small
                      style={{
                        display: "block",
                        marginBottom: "3px",
                        opacity: 0.7,
                      }}
                    >
                      {slot.name}
                    </small>
                  )}

                  {time}
                </div>

                {weekDates.map((dayInfo) => {
                  const actualLessons =
                    getLessonsForCell(
                      dayInfo.dateString,
                      time,
                    );

                  const fixedSchedules =
                    schedules.filter(
                      (q) =>
                        q.day === dayInfo.day &&
                        q.time === time &&
                        (sid === "Tất cả" ||
                          Number(q.studentId) ===
                            Number(sid)),
                    );

                  return (
                    <div
                      className="lesson-cell"
                      key={`${dayInfo.dateString}-${time}`}
                    >
                      {/* LỊCH CỐ ĐỊNH */}
                      {fixedSchedules.map((x) => (
                        <div
                          className="lesson"
                          key={`schedule-${x.id}`}
                        >
                          <b>
                            {getStudentName(
                              x.studentId,
                              x.studentName,
                            )}
                          </b>

                          <span>
                            {x.subject}
                          </span>

                          <button
                            title="Sửa"
                            onClick={() =>
                              onEdit(x)
                            }
                          >
                            <Pencil size={12} />
                          </button>

                          <button
                            className="lesson-delete"
                            title="Xóa"
                            onClick={() =>
                              onDelete(x.id)
                            }
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))}

                      {/* BUỔI HỌC THỰC TẾ */}
                      {actualLessons.map((x) => (
                        <div
                          className={`lesson ${
                            x.status === "attended"
                              ? "attended"
                              : x.status === "absent"
                                ? "absent"
                                : ""
                          }`}
                          key={`lesson-${x.id}`}
                        >
                          <b>
                            {getStudentName(
                              x.studentId,
                              x.studentName,
                            )}
                          </b>

                          <span>
                            {x.subject}
                          </span>

                          <small>
                            {x.status === "attended"
                              ? "✓ Đã học"
                              : x.status === "absent"
                                ? "Nghỉ"
                                : "Chưa điểm danh"}
                          </small>

                          <button
                            className="lesson-delete"
                            title="Xóa buổi"
                            onClick={() =>
                              onDeleteLesson(x.id)
                            }
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </>
  );
}

function monthDates(month) {
  const [y, m] = month.split("-").map(Number);

  const n = new Date(y, m, 0).getDate();

  return Array.from(
    { length: n },
    (_, i) =>
      `${y}-${String(m).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`,
  );
}

function Attendance({
  students,
  lessons,
  attendance,
  onMark,
  onAdd,
  onDelete,
}) {
  const [sid, setSid] = useState(students[0]?.id || "");

  const [month, setMonth] = useState(currentMonth());

  useEffect(() => {
    if (
      students.length > 0 &&
      !students.some((s) => Number(s.id) === Number(sid))
    ) {
      setSid(students[0].id);
    }
  }, [students, sid]);

  const rows = lessons
    .filter(
      (l) =>
        Number(l.studentId) === Number(sid) &&
        String(l.lessonDate).startsWith(month),
    )
    .sort(
      (a, b) =>
        String(b.lessonDate).localeCompare(String(a.lessonDate)) ||
        String(a.time).localeCompare(String(b.time)),
    );

  const attended = rows.filter((x) => x.status === "attended").length;

  const absent = rows.filter((x) => x.status === "absent").length;

  const earned = rows
    .filter((x) => x.status === "attended")
    .reduce((s, x) => s + Number(x.fee || 0), 0);

  const student = students.find((s) => Number(s.id) === Number(sid));

  return (
    <>
      <PageTitle
        title="Điểm danh"
        desc="Tất cả các buổi trong tháng. Có thể thêm hoặc xóa từng buổi học."
        action={
          <button className="primary" onClick={onAdd}>
            <Plus size={18} />
            Thêm buổi học
          </button>
        }
      />

      <div className="card form-card attendance-filter">
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
          <span>Tháng</span>

          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </label>
      </div>

      {student && (
        <div className="fee-summary attendance-summary">
          <div>
            <span>Tổng buổi</span>
            <b>{rows.length}</b>
          </div>

          <div>
            <span>Đã học</span>
            <b className="fee-paid">{attended}</b>
          </div>

          <div>
            <span>Nghỉ</span>
            <b className="fee-debt">{absent}</b>
          </div>

          <div>
            <span>Chưa điểm danh</span>

            <b>{rows.length - attended - absent}</b>
          </div>

          <div>
            <span>Tổng học phí</span>

            <b>{money(earned)}</b>
          </div>
        </div>
      )}

      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Thứ</th>
              <th>Giờ</th>
              <th>Môn</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {rows.map((l) => {
              const a = attendance.find(
                (x) => Number(x.lessonId) === Number(l.id),
              );

              return (
                <tr key={l.id}>
                  <td>{String(l.lessonDate).split("-").reverse().join("/")}</td>

                  <td>
                    {
                      [
                        "",
                        "Thứ 2",
                        "Thứ 3",
                        "Thứ 4",
                        "Thứ 5",
                        "Thứ 6",
                        "Thứ 7",
                        "Chủ nhật",
                      ][new Date(`${l.lessonDate}T12:00:00`).getDay() || 7]
                    }
                  </td>

                  <td>{l.time}</td>

                  <td>
                    <b>{l.subject}</b>
                  </td>

                  <td>
                    <div className="attendance-actions">
                      <button
                        className={
                          l.status === "attended" ? "primary" : "outline"
                        }
                        onClick={() =>
                          onMark({
                            studentId: sid,
                            lessonId: l.id,
                            scheduleId: l.scheduleId,
                            lessonDate: l.lessonDate,
                            status: "attended",
                            fee: student?.feePerLesson,
                          })
                        }
                      >
                        ✓ Đã học
                      </button>

                      <button
                        className={l.status === "absent" ? "danger" : "outline"}
                        onClick={() =>
                          onMark({
                            studentId: sid,
                            lessonId: l.id,
                            scheduleId: l.scheduleId,
                            lessonDate: l.lessonDate,
                            status: "absent",
                          })
                        }
                      >
                        Nghỉ
                      </button>
                    </div>
                  </td>

                  <td>
                    <button
                      className="icon-btn danger-icon"
                      onClick={() => onDelete(l.id)}
                      title="Xóa buổi"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}

            {rows.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-fee">
                  Không có buổi học trong tháng này.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Fees({ students, attendance, payments, onPayment, settings }) {
  const [month, setMonth] = useState(currentMonth());
  const [filterType, setFilterType] = useState("all");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [amounts, setAmounts] = useState({});
  const [pdfLoading, setPdfLoading] = useState(false);

  const classNames = [
    ...new Set(
      students.map((s) => s.className).filter((x) => x && String(x).trim()),
    ),
  ].sort();

const filtered = useMemo(() => {
  switch (filterType) {
    case "student":
      return students.filter(
        (s) => Number(s.id) === Number(selectedStudent),
      );

    case "class":
      return students.filter(
        (s) =>
          String(s.className || "").trim() ===
          String(selectedClass || "").trim(),
      );

    case "all":
    default:
      return [...students];
  }
}, [students, filterType, selectedClass, selectedStudent]);

  const getAtt = (s) =>
    attendance.filter(
      (a) =>
        Number(a.studentId) === Number(s.id) &&
        a.status === "attended" &&
        String(a.lessonDate).startsWith(month),
    );

  const getEarned = (s) =>
    getAtt(s).reduce((t, a) => t + Number(a.fee || 0), 0);

  const getPaid = (s) =>
    payments
      .filter((p) => Number(p.studentId) === Number(s.id) && p.month === month)
      .reduce((t, p) => t + Number(p.amount || 0), 0);

  const totalEarned = filtered.reduce((t, s) => t + getEarned(s), 0);

  const totalPaid = filtered.reduce((t, s) => t + getPaid(s), 0);

  const pay = async (s) => {
    const amount = Number(amounts[s.id] || 0);

    if (amount <= 0) return;

    await onPayment({
      studentId: s.id,
      month,
      amount,
    });

    setAmounts((p) => ({
      ...p,
      [s.id]: "",
    }));
  };

  const loadFont = async (url) => {
    const r = await fetch(url);

    if (!r.ok) {
      throw Error();
    }

    const b = new Uint8Array(await r.arrayBuffer());

    let bin = "";

    for (let i = 0; i < b.length; i += 0x8000) {
      bin += String.fromCharCode(
        ...b.subarray(i, Math.min(i + 0x8000, b.length)),
      );
    }

    return btoa(bin);
  };

const exportPDF = async () => {
  const exportStudents =
    filterType === "student"
      ? students.filter(
          (s) => Number(s.id) === Number(selectedStudent),
        )
      : filterType === "class"
        ? students.filter(
            (s) =>
              String(s.className || "").trim() ===
              String(selectedClass || "").trim(),
          )
        : [...students];

  if (!exportStudents.length) {
    alert("Không có học sinh để xuất PDF.");
    return;
  }

  try {
    setPdfLoading(true);

    const [jm, am] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);

    const autoTable = am.default || am;

    const [regular, bold] = await Promise.all([
      loadFont("/fonts/NotoSans-Regular.ttf"),
      loadFont("/fonts/NotoSans-Bold.ttf"),
    ]);

    // =====================================================
    // 1. TRƯỜNG HỢP MỘT HỌC SINH
    //    -> Xuất chi tiết từng buổi
    // =====================================================
    if (filterType === "student") {
      const doc = new jm.jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      doc.addFileToVFS("NotoSans-Regular.ttf", regular);
      doc.addFont(
        "NotoSans-Regular.ttf",
        "NotoSans",
        "normal",
      );

      doc.addFileToVFS("NotoSans-Bold.ttf", bold);
      doc.addFont(
        "NotoSans-Bold.ttf",
        "NotoSans",
        "bold",
      );

      const s = exportStudents[0];

      const rows = getAtt(s)
        .sort((a, b) =>
          String(a.lessonDate).localeCompare(
            String(b.lessonDate),
          ),
        )
        .map((a, i) => {
          const date = new Date(
            `${a.lessonDate}T12:00:00`,
          );

          const dayNames = [
            "Chủ nhật",
            "Thứ 2",
            "Thứ 3",
            "Thứ 4",
            "Thứ 5",
            "Thứ 6",
            "Thứ 7",
          ];

          return [
            i + 1,
            String(a.lessonDate)
              .split("-")
              .reverse()
              .join("/"),
            dayNames[date.getDay()],
            a.time || "",
            a.subject || "",
            money(a.fee),
          ];
        });

      const total = getEarned(s);

      doc.setFont("NotoSans", "bold");
      doc.setFontSize(18);

      doc.text("PHIẾU HỌC PHÍ", 105, 18, {
        align: "center",
      });

      doc.setFontSize(12);

      doc.text(
        `Học sinh: ${s.name}`,
        15,
        31,
      );

      doc.setFont("NotoSans", "normal");

      doc.text(
        `Lớp: ${s.className || ""}`,
        15,
        38,
      );

      doc.text(
        `Tháng: ${month.slice(5, 7)}/${month.slice(
          0,
          4,
        )}`,
        15,
        45,
      );

      doc.text(
        `Phí/buổi: ${money(s.feePerLesson)}`,
        110,
        38,
      );

      doc.text(
        `Số buổi đã học: ${rows.length}`,
        110,
        45,
      );

      autoTable(doc, {
        startY: 52,

        head: [[
          "STT",
          "Ngày",
          "Thứ",
          "Giờ",
          "Môn",
          "Số tiền",
        ]],

        body: rows,

        theme: "grid",

        styles: {
          font: "NotoSans",
          fontSize: 9,
        },

        headStyles: {
          font: "NotoSans",
          fontStyle: "bold",
        },

        columnStyles: {
          0: {
            cellWidth: 12,
            halign: "center",
          },

          1: {
            cellWidth: 25,
            halign: "center",
          },

          2: {
            cellWidth: 25,
            halign: "center",
          },

          3: {
            cellWidth: 30,
            halign: "center",
          },

          4: {
            cellWidth: 45,
          },

          5: {
            halign: "right",
          },
        },
      });

      let y = doc.lastAutoTable.finalY + 10;

      doc.setFont("NotoSans", "bold");

      doc.text(
        `TỔNG ĐÃ HỌC: ${rows.length} BUỔI`,
        15,
        y,
      );

      doc.text(
        `TỔNG HỌC PHÍ: ${money(total)}`,
        110,
        y,
      );

      y += 14;

      doc.text(
        "THÔNG TIN CHUYỂN KHOẢN",
        15,
        y,
      );

      y += 7;

      doc.setFont("NotoSans", "normal");

      doc.text(
        `Ngân hàng: ${settings?.bankName || ""}`,
        15,
        y,
      );

      y += 6;

      doc.text(
        `Số tài khoản: ${settings?.bankAccount || ""}`,
        15,
        y,
      );

      y += 6;

      doc.text(
        `Chủ tài khoản: ${settings?.bankOwner || ""}`,
        15,
        y,
      );

      y += 10;

      doc.setFont("NotoSans", "bold");

      doc.text("LƯU Ý", 15, y);

      y += 6;

      doc.setFont("NotoSans", "normal");

      const notes = doc.splitTextToSize(
        settings?.parentNote || "",
        175,
      );

      doc.text(notes, 15, y);

      const filename =
        `hoc-phi-${month}-` +
        `${s.name.replaceAll(" ", "-")}.pdf`;

      doc.save(filename);

      return;
    }

    // =====================================================
    // 2. TẤT CẢ / TOÀN BỘ LỚP
    //    -> CHỈ 1 BẢNG TỔNG HỢP
    // =====================================================

    const doc = new jm.jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    doc.addFileToVFS("NotoSans-Regular.ttf", regular);
    doc.addFont(
      "NotoSans-Regular.ttf",
      "NotoSans",
      "normal",
    );

    doc.addFileToVFS("NotoSans-Bold.ttf", bold);
    doc.addFont(
      "NotoSans-Bold.ttf",
      "NotoSans",
      "bold",
    );

    const title =
      filterType === "class"
        ? `TỔNG HỢP HỌC PHÍ - LỚP ${selectedClass}`
        : "TỔNG HỢP HỌC PHÍ - TẤT CẢ HỌC SINH";

    doc.setFont("NotoSans", "bold");
    doc.setFontSize(17);

    doc.text(title, 148, 16, {
      align: "center",
    });

    doc.setFontSize(11);
    doc.setFont("NotoSans", "normal");

    doc.text(
      `Tháng: ${month.slice(5, 7)}/${month.slice(
        0,
        4,
      )}`,
      15,
      27,
    );

    doc.text(
      `Số học sinh: ${exportStudents.length}`,
      230,
      27,
    );

    // =====================================================
    // DỮ LIỆU TỔNG HỢP
    // =====================================================

    const summaryRows = exportStudents.map(
      (s, index) => {
        const attended = getAtt(s);
        const count = attended.length;
        const total = getEarned(s);

        return [
          index + 1,
          s.name || "",
          s.className || "",
          money(s.feePerLesson),
          count,
          money(total),
        ];
      },
    );

    // =====================================================
    // TỔNG CỘNG
    // =====================================================

    const totalLessons = exportStudents.reduce(
      (sum, s) =>
        sum + getAtt(s).length,
      0,
    );

    const totalEarnedAll = exportStudents.reduce(
      (sum, s) =>
        sum + getEarned(s),
      0,
    );

    // =====================================================
    // BẢNG
    // =====================================================

    autoTable(doc, {
      startY: 34,

      head: [[
        "STT",
        "Học sinh",
        "Lớp",
        "Phí/buổi",
        "Số buổi",
        "Tổng học phí",
      ]],

      body: summaryRows,
      
      theme: "grid",

      styles: {
        font: "NotoSans",
        fontSize: 10,
        valign: "middle",
      },

      headStyles: {
        font: "NotoSans",
        fontStyle: "bold",
        halign: "center",
      },

      footStyles: {
        font: "NotoSans",
        fontStyle: "bold",
      },

      columnStyles: {
        0: {
          cellWidth: 15,
          halign: "center",
        },

        1: {
          cellWidth: 70,
        },

        2: {
          cellWidth: 50,
        },

        3: {
          cellWidth: 40,
          halign: "right",
        },

        4: {
          cellWidth: 30,
          halign: "center",
        },

        5: {
          cellWidth: 45,
          halign: "right",
        },
      },

      margin: {
        left: 10,
        right: 10,
      },
    });

    // =====================================================
    // THÔNG TIN CHUYỂN KHOẢN
    // =====================================================

    let y = doc.lastAutoTable.finalY + 12;

    doc.setFont("NotoSans", "bold");
    doc.setFontSize(11);

    doc.text(
      "THÔNG TIN CHUYỂN KHOẢN",
      15,
      y,
    );

    y += 7;

    doc.setFont("NotoSans", "normal");

    doc.text(
      `Ngân hàng: ${settings?.bankName || ""}`,
      15,
      y,
    );

    y += 6;

    doc.text(
      `Số tài khoản: ${settings?.bankAccount || ""}`,
      15,
      y,
    );

    y += 6;

    doc.text(
      `Chủ tài khoản: ${settings?.bankOwner || ""}`,
      15,
      y,
    );

    y += 10;

    doc.setFont("NotoSans", "bold");

    doc.text("LƯU Ý", 15, y);

    y += 6;

    doc.setFont("NotoSans", "normal");

    const notes = doc.splitTextToSize(
      settings?.parentNote || "",
      260,
    );

    doc.text(notes, 15, y);

    // =====================================================
    // TÊN FILE
    // =====================================================

    let filename = `hoc-phi-${month}`;

    if (filterType === "class") {
      filename +=
        `-lop-${selectedClass.replaceAll(
          " ",
          "-",
        )}`;
    } else {
      filename += "-tat-ca";
    }

    doc.save(`${filename}.pdf`);
  } catch (e) {
    console.error(e);

    alert(
      "Không thể tạo PDF. Hãy kiểm tra font NotoSans.",
    );
  } finally {
    setPdfLoading(false);
  }
};

  return (
    <>
      <PageTitle
        title="Học phí"
        desc="Theo dõi học phí theo từng học sinh, từng lớp và xuất phiếu PDF."
      />

      <div className="card fee-toolbar">
        <div className="fee-toolbar-top">
          {/* KIỂU XUẤT */}
          <label className="field">
            <span>Đối tượng</span>

            <select
              value={filterType}
onChange={(e) => {
  const value = e.target.value;

  setFilterType(value);

  if (value === "student") {
    setSelectedStudent(students[0]?.id || "");
  }

  if (value === "class") {
    setSelectedClass(classNames[0] || "");
  }

  if (value === "all") {
    setSelectedStudent("");
    setSelectedClass("");
  }
}}
            >
              <option value="all">Tất cả học sinh</option>

              <option value="class">Toàn bộ lớp</option>

              <option value="student">Một học sinh</option>
            </select>
          </label>

          {/* CHỌN LỚP */}
          {filterType === "class" && (
            <label className="field">
              <span>Chọn lớp</span>

              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                {classNames.map((name) => (
                  <option value={name} key={name}>
                    Lớp {name}
                  </option>
                ))}
              </select>
            </label>
          )}

          {/* CHỌN HỌC SINH */}
          {filterType === "student" && (
            <label className="field">
              <span>Học sinh</span>

              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
              >
                {students.map((s) => (
                  <option value={s.id} key={s.id}>
                    {s.name} · {s.className}
                  </option>
                ))}
              </select>
            </label>
          )}

          {/* THÁNG */}
          <label className="field">
            <span>Tháng</span>

            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </label>

          {/* EXPORT */}
          <button
            className="primary pdf-button"
            onClick={exportPDF}
            disabled={pdfLoading || !filtered.length}
          >
            {pdfLoading
              ? "Đang tạo PDF..."
              : filterType === "class"
                ? `📄 Xuất PDF toàn bộ lớp`
                : filterType === "student"
                  ? "📄 Xuất PDF học sinh"
                  : "📄 Xuất PDF tất cả"}
          </button>
        </div>

        <div className="fee-summary">
          <div>
            <span>Học sinh</span>
            <b>{filtered.length}</b>
          </div>

          <div>
            <span>Tổng phải thu</span>
            <b>{money(totalEarned)}</b>
          </div>

          <div>
            <span>Đã thu</span>
            <b>{money(totalPaid)}</b>
          </div>

          <div>
            <span>Còn thiếu</span>
            <b>{money(totalEarned - totalPaid)}</b>
          </div>
        </div>
      </div>

      <div className="card table-wrap fee-table-wrap">
        <table className="fee-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Học sinh</th>
              <th>Lớp</th>
              <th>Phí/buổi</th>
              <th>Đã học</th>
              <th>Tổng học phí</th>
              <th>Đã thu</th>
              <th>Còn thiếu</th>
              <th>Thanh toán</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((s, i) => {
              const e = getEarned(s);
              const p = getPaid(s);
              const d = e - p;

              return (
                <tr key={s.id}>
                  <td className="text-center">{i + 1}</td>

                  <td>
                    <b>{s.name}</b>
                    <small>{s.phone}</small>
                  </td>

                  <td>
                    <span className="tag">{s.className}</span>
                  </td>

                  <td className="money-cell">{money(s.feePerLesson)}</td>

                  <td className="text-center">{getAtt(s).length}</td>

                  <td className="money-cell">
                    <b>{money(e)}</b>
                  </td>

                  <td className="money-cell">{money(p)}</td>

                  <td className="money-cell">
                    <strong className={d > 0 ? "fee-debt" : "fee-paid"}>
                      {money(d)}
                    </strong>
                  </td>

                  <td>
                    <div className="payment-inline">
                      <input
                        type="number"
                        min="0"
                        placeholder="Số tiền"
                        value={amounts[s.id] || ""}
                        onChange={(e) =>
                          setAmounts((v) => ({
                            ...v,
                            [s.id]: e.target.value,
                          }))
                        }
                      />

                      <button
                        className="primary"
                        disabled={!Number(amounts[s.id] || 0)}
                        onClick={() => pay(s)}
                      >
                        Thu
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan="9" className="empty-fee">
                  Không có học sinh phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function SettingsPage({ settings, slots, API, onReload, notify }) {
  const [v, setV] = useState(settings || {});
  const [editingSlot, setEditingSlot] = useState(null);

  useEffect(() => {
    setV(settings || {});
  }, [settings]);

  const save = async () => {
    const r = await fetch(`${API}/settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(v),
    });

    if (!r.ok) {
      return alert("Không lưu được cài đặt");
    }

    await onReload();

    notify("Đã lưu cài đặt");
  };

  // =========================
  // THÊM KHUNG GIỜ
  // =========================
  const addTime = async () => {
    const name = prompt("Tên khung giờ", "Tiết mới");

    if (!name || !name.trim()) return;

    const start = prompt("Giờ bắt đầu", "08:00");

    if (!start || !start.trim()) return;

    const end = prompt("Giờ kết thúc", "09:00");

    if (!end || !end.trim()) return;

    try {
      const r = await fetch(`${API}/time-slots`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          startTime: start.trim(),
          endTime: end.trim(),
        }),
      });

      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        throw Error(data.error || "Không thể thêm khung giờ");
      }

      await onReload();

      notify("Đã thêm khung giờ");
    } catch (e) {
      alert(e.message || "Không thể thêm khung giờ");
    }
  };

  // =========================
  // MỞ FORM SỬA
  // =========================
  const editTime = (x) => {
    setEditingSlot({
      id: x.id,
      name: x.name || "",
      startTime: x.startTime || "",
      endTime: x.endTime || "",
    });
  };

  // =========================
  // LƯU KHUNG GIỜ ĐÃ SỬA
  // =========================
  const saveTime = async () => {
    if (!editingSlot) return;

    const name = editingSlot.name.trim();
    const startTime = editingSlot.startTime.trim();
    const endTime = editingSlot.endTime.trim();

    if (!name) {
      alert("Vui lòng nhập tên khung giờ.");
      return;
    }

    if (!startTime) {
      alert("Vui lòng nhập giờ bắt đầu.");
      return;
    }

    if (!endTime) {
      alert("Vui lòng nhập giờ kết thúc.");
      return;
    }

    try {
      const r = await fetch(`${API}/time-slots/${editingSlot.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          startTime,
          endTime,
        }),
      });

      if (!r.ok) {
        const data = await r.json().catch(() => ({}));

        throw Error(data.error || "Không thể sửa khung giờ");
      }

      // Reload dữ liệu mới
      await onReload();

      // Đóng form sửa
      setEditingSlot(null);

      notify("Đã cập nhật khung giờ");
    } catch (e) {
      alert(e.message || "Không thể sửa khung giờ");
    }
  };

  // =========================
  // XÓA KHUNG GIỜ
  // =========================
  const delTime = async (id) => {
    if (!confirm("Xóa khung giờ này?")) return;

    try {
      const r = await fetch(`${API}/time-slots/${id}`, {
        method: "DELETE",
      });

      if (!r.ok) {
        const data = await r.json().catch(() => ({}));

        throw Error(data.error || "Không thể xóa khung giờ");
      }

      await onReload();

      notify("Đã xóa khung giờ");
    } catch (e) {
      alert(e.message || "Không thể xóa khung giờ");
    }
  };

  return (
    <>
      <PageTitle
        title="Cài đặt"
        desc="Thông tin giáo viên, chuyển khoản, lưu ý PDF và khung giờ học."
      />

      <div className="settings-grid">
        {/* =========================
            THÔNG TIN GIÁO VIÊN
        ========================== */}
        <div className="card form-card">
          <h2>Thông tin giáo viên</h2>

          <Field
            label="Tên giáo viên"
            value={v.teacherName || ""}
            onChange={(e) =>
              setV({
                ...v,
                teacherName: e.target.value,
              })
            }
          />

          <Field
            label="Số điện thoại"
            value={v.teacherPhone || ""}
            onChange={(e) =>
              setV({
                ...v,
                teacherPhone: e.target.value,
              })
            }
          />

          <h2>Thông tin chuyển khoản</h2>

          <Field
            label="Số tài khoản"
            value={v.bankAccount || ""}
            onChange={(e) =>
              setV({
                ...v,
                bankAccount: e.target.value,
              })
            }
          />

          <Field
            label="Chủ tài khoản"
            value={v.bankOwner || ""}
            onChange={(e) =>
              setV({
                ...v,
                bankOwner: e.target.value,
              })
            }
          />

          <Field
            label="Ngân hàng"
            value={v.bankName || ""}
            onChange={(e) =>
              setV({
                ...v,
                bankName: e.target.value,
              })
            }
          />

          <label className="field">
            <span>Lưu ý phụ huynh</span>

            <textarea
              rows="5"
              value={v.parentNote || ""}
              onChange={(e) =>
                setV({
                  ...v,
                  parentNote: e.target.value,
                })
              }
            />
          </label>

          <button className="primary" onClick={save}>
            💾 Lưu thông tin
          </button>
        </div>

        {/* =========================
            KHUNG GIỜ HỌC
        ========================== */}
        <div className="card form-card">
          <div className="section-head">
            <div>
              <h2>Khung giờ học</h2>

              <p>Các khung giờ dùng trong thời gian biểu.</p>
            </div>

            <button className="primary" onClick={addTime}>
              <Plus size={17} />
              Thêm
            </button>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Bắt đầu</th>
                  <th>Kết thúc</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {slots.map((x) => (
                  <tr key={x.id}>
                    <td>
                      <b>{x.name}</b>
                    </td>

                    <td>{x.startTime}</td>

                    <td>{x.endTime}</td>

                    <td>
                      <button className="outline" onClick={() => editTime(x)}>
                        <Pencil size={15} />
                        Sửa
                      </button>{" "}
                      <button
                        className="icon-btn"
                        onClick={() => delTime(x.id)}
                        title="Xóa"
                      >
                        <Trash2 size={17} />
                      </button>
                    </td>
                  </tr>
                ))}

                {slots.length === 0 && (
                  <tr>
                    <td colSpan="4" className="empty-fee">
                      Chưa có khung giờ học.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* =========================
          MODAL SỬA KHUNG GIỜ
      ========================== */}
      {editingSlot && (
        <div className="modal-bg">
          <div className="modal">
            <div className="modal-head">
              <h2>Sửa khung giờ học</h2>

              <button onClick={() => setEditingSlot(null)}>
                <X />
              </button>
            </div>

            <Field
              label="Tên khung giờ"
              value={editingSlot.name}
              onChange={(e) =>
                setEditingSlot({
                  ...editingSlot,
                  name: e.target.value,
                })
              }
              placeholder="Ví dụ: Buổi tối"
            />

            <Field
              label="Giờ bắt đầu"
              type="time"
              value={editingSlot.startTime}
              onChange={(e) =>
                setEditingSlot({
                  ...editingSlot,
                  startTime: e.target.value,
                })
              }
            />

            <Field
              label="Giờ kết thúc"
              type="time"
              value={editingSlot.endTime}
              onChange={(e) =>
                setEditingSlot({
                  ...editingSlot,
                  endTime: e.target.value,
                })
              }
            />

            <div className="modal-actions">
              <button className="outline" onClick={() => setEditingSlot(null)}>
                Hủy
              </button>

              <button className="primary" onClick={saveTime}>
                💾 Lưu
              </button>
            </div>
          </div>
        </div>
      )}
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

/* =========================================================
   STUDENT MODAL - FIX CHỌN LỚP
   ========================================================= */

function StudentModal({ data, classes, onClose, onSave, onAddClass }) {
  const normalizedClasses = Array.isArray(classes)
    ? classes.filter((c) => c && c.name && String(c.name).trim())
    : [];

  const [v, setV] = useState(() => {
    if (data) {
      return {
        ...data,
        className: data.className || "",
        phone: data.phone || "",
        note: data.note || "",
        feePerLesson: data.feePerLesson ?? 100000,
        active: data.active ?? 1,
      };
    }

    return {
      name: "",
      className: normalizedClasses[0]?.name || "",
      phone: "",
      note: "",
      feePerLesson: 100000,
      active: 1,
    };
  });

  const [addingClass, setAddingClass] = useState(false);

  const [newClassName, setNewClassName] = useState("");

  useEffect(() => {
    if (!data && !v.className) {
      if (normalizedClasses[0]) {
        setV((prev) => ({
          ...prev,
          className: normalizedClasses[0].name,
        }));
      }
    }
  }, [classes, data, normalizedClasses.length]);

  const existingClassNames = normalizedClasses.map((c) => String(c.name));

  const currentClassExists =
    !v.className || existingClassNames.includes(String(v.className));

  const createClassFromStudent = async () => {
    const name = newClassName.trim();

    if (!name) {
      alert("Vui lòng nhập tên lớp.");
      return;
    }

    const duplicated = normalizedClasses.some(
      (c) => String(c.name).trim().toLowerCase() === name.toLowerCase(),
    );

    if (duplicated) {
      alert("Lớp này đã tồn tại.");
      return;
    }

    try {
      const newClass = await onAddClass({
        name,
        teacher: "",
      });

      if (newClass) {
        setV((prev) => ({
          ...prev,
          className: newClass.name,
        }));

        setNewClassName("");
        setAddingClass(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const canSave = v.name.trim() && v.className.trim();

  return (
    <Modal
      title={data ? "Sửa học sinh" : "Thêm học sinh"}
      onClose={onClose}
      onSave={() => canSave && onSave(v)}
    >
      <Field
        label="Họ tên"
        value={v.name}
        onChange={(e) =>
          setV({
            ...v,
            name: e.target.value,
          })
        }
      />

      <label className="field">
        <span>Lớp</span>

        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
          }}
        >
          <select
            value={currentClassExists ? v.className : "__OLD_CLASS__"}
            onChange={(e) => {
              if (e.target.value === "__OLD_CLASS__") {
                return;
              }

              setV({
                ...v,
                className: e.target.value,
              });
            }}
            style={{
              flex: 1,
            }}
          >
            <option value="">-- Chọn lớp --</option>

            {!currentClassExists && v.className && (
              <option value="__OLD_CLASS__">{v.className} (lớp cũ)</option>
            )}

            {normalizedClasses.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="outline"
            onClick={() => setAddingClass(!addingClass)}
            title="Thêm lớp mới"
            style={{
              whiteSpace: "nowrap",
            }}
          >
            <Plus size={16} />
            Thêm lớp
          </button>
        </div>
      </label>

      {addingClass && (
        <div
          className="field"
          style={{
            background: "rgba(99,102,241,0.06)",
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid rgba(99,102,241,0.15)",
          }}
        >
          <span>Tạo lớp mới</span>

          <div
            style={{
              display: "flex",
              gap: "8px",
            }}
          >
            <input
              autoFocus
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="Ví dụ: 8C"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  createClassFromStudent();
                }
              }}
            />

            <button
              type="button"
              className="primary"
              onClick={createClassFromStudent}
            >
              Tạo
            </button>
          </div>
        </div>
      )}

      {normalizedClasses.length === 0 && (
        <div
          style={{
            padding: "10px 12px",
            marginBottom: "12px",
            borderRadius: "8px",
            background: "#fff7ed",
            border: "1px solid #fed7aa",
            color: "#9a3412",
            fontSize: "14px",
          }}
        >
          Chưa có lớp nào.
          <br />
          Hãy bấm <b>"+ Thêm lớp"</b> để tạo lớp mới.
        </div>
      )}

      <Field
        label="Số điện thoại"
        value={v.phone || ""}
        onChange={(e) =>
          setV({
            ...v,
            phone: e.target.value,
          })
        }
      />

      <Field
        label="Học phí / buổi"
        type="number"
        value={v.feePerLesson}
        onChange={(e) =>
          setV({
            ...v,
            feePerLesson: e.target.value,
          })
        }
      />

      <Field
        label="Ghi chú"
        value={v.note || ""}
        onChange={(e) =>
          setV({
            ...v,
            note: e.target.value,
          })
        }
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
      onSave={() =>
        name &&
        onSave({
          name,
          teacher: "",
        })
      }
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

function ScheduleModal({ data, onClose, onSave, slots, students }) {
  const existing = data
    ? {
        ...data,
        studentId: String(data.studentId || ""),
      }
    : {
        day: "Thứ 2",
        time: slots[0]
          ? `${slots[0].startTime} - ${slots[0].endTime}`
          : "08:00 - 09:00",
        subject: "",
        room: "",
        studentId: String(students[0]?.id || ""),
      };

  const [v, setV] = useState(existing);

  const selected = students.find((s) => Number(s.id) === Number(v.studentId));

  return (
    <Modal
      title={data ? "Sửa lịch học" : "Thêm lịch học"}
      onClose={onClose}
      onSave={() =>
        selected &&
        v.subject &&
        onSave({
          ...v,
          id: data?.id || undefined,
          studentId: Number(v.studentId),
          className: selected.className,
        })
      }
    >
      <label className="field">
        <span>Học sinh</span>

        <select
          value={v.studentId}
          onChange={(e) =>
            setV({
              ...v,
              studentId: e.target.value,
            })
          }
        >
          {students.map((s) => (
            <option value={s.id} key={s.id}>
              {s.name} · {s.className}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Thứ</span>

        <select
          value={v.day}
          onChange={(e) =>
            setV({
              ...v,
              day: e.target.value,
            })
          }
        >
          {days.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Khung giờ</span>

        <select
          value={v.time}
          onChange={(e) =>
            setV({
              ...v,
              time: e.target.value,
            })
          }
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
        onChange={(e) =>
          setV({
            ...v,
            subject: e.target.value,
          })
        }
        placeholder="Toán"
      />

      <Field
        label="Phòng"
        value={v.room || ""}
        onChange={(e) =>
          setV({
            ...v,
            room: e.target.value,
          })
        }
        placeholder="P.101"
      />
    </Modal>
  );
}

function LessonModal({
  students,
  subjects,
  slots,
  onClose,
  onSave,
  onAddSubject,
}) {
  const s0 = students[0];

  const getSlotTime = (slot) =>
    slot ? `${slot.startTime} - ${slot.endTime}` : "";

  const [v, setV] = useState({
    studentId: String(s0?.id || ""),
    lessonDate: today(),
    time: getSlotTime(slots?.[0]),
    subject: subjects?.[0] || "",
    className: s0?.className || "",
    fee: s0?.feePerLesson || 0,
  });

  const [addingSubject, setAddingSubject] = useState(false);
  const [newSubject, setNewSubject] = useState("");

  const selected = students.find((s) => Number(s.id) === Number(v.studentId));

  const handleStudentChange = (studentId) => {
    const s = students.find((x) => Number(x.id) === Number(studentId));

    setV((prev) => ({
      ...prev,
      studentId,
      className: s?.className || "",
      fee: s?.feePerLesson || 0,
    }));
  };

  const createSubject = async () => {
    const name = newSubject.trim();

    if (!name) {
      alert("Vui lòng nhập tên môn học.");
      return;
    }

    const result = await onAddSubject(name);

    if (result) {
      setV((prev) => ({
        ...prev,
        subject: result,
      }));

      setNewSubject("");
      setAddingSubject(false);
    }
  };

  return (
    <Modal
      title="Thêm buổi học"
      onClose={onClose}
      onSave={() => {
        if (selected && v.lessonDate && v.subject && v.time) {
          onSave({
            ...v,
            studentId: Number(v.studentId),
            className: selected.className,
            fee: Number(v.fee || selected.feePerLesson || 0),
          });
        }
      }}
    >
      {/* Học sinh */}
      <label className="field">
        <span>Học sinh</span>

        <select
          value={v.studentId}
          onChange={(e) => handleStudentChange(e.target.value)}
        >
          {students.map((s) => (
            <option value={s.id} key={s.id}>
              {s.name} · {s.className}
            </option>
          ))}
        </select>
      </label>

      {/* Ngày học */}
      <Field
        label="Ngày học"
        type="date"
        value={v.lessonDate}
        onChange={(e) =>
          setV({
            ...v,
            lessonDate: e.target.value,
          })
        }
      />

      {/* Giờ học */}
      <label className="field">
        <span>Giờ học</span>

        <select
          value={v.time}
          onChange={(e) =>
            setV({
              ...v,
              time: e.target.value,
            })
          }
        >
          {slots.map((slot) => {
            const time = getSlotTime(slot);

            return (
              <option key={slot.id} value={time}>
                {slot.name ? `${slot.name} · ${time}` : time}
              </option>
            );
          })}
        </select>
      </label>

      {/* Môn học */}
      <label className="field">
        <span>Môn học</span>

        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
          }}
        >
          <select
            value={v.subject}
            onChange={(e) =>
              setV({
                ...v,
                subject: e.target.value,
              })
            }
            style={{
              flex: 1,
            }}
          >
            <option value="">-- Chọn môn học --</option>

            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="outline"
            onClick={() => setAddingSubject(!addingSubject)}
            style={{
              whiteSpace: "nowrap",
            }}
          >
            <Plus size={16} />
            Thêm môn
          </button>
        </div>
      </label>

      {/* Tạo môn mới */}
      {addingSubject && (
        <div
          className="field"
          style={{
            background: "rgba(99,102,241,0.06)",
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid rgba(99,102,241,0.15)",
          }}
        >
          <span>Tạo môn học mới</span>

          <div
            style={{
              display: "flex",
              gap: "8px",
            }}
          >
            <input
              autoFocus
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="Ví dụ: Toán"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  createSubject();
                }
              }}
            />

            <button type="button" className="primary" onClick={createSubject}>
              Tạo
            </button>
          </div>
        </div>
      )}

      {/* Học phí */}
      <Field
        label="Học phí buổi này"
        type="number"
        value={v.fee}
        onChange={(e) =>
          setV({
            ...v,
            fee: e.target.value,
          })
        }
      />
    </Modal>
  );
}

createRoot(document.getElementById("root")).render(<App />);
