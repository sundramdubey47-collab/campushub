"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Autocomplete } from "@/components/autocomplete"
import { Plus } from "lucide-react"
import Papa from "papaparse"
import { Upload, Download, Trash2 } from "lucide-react"

type Item = { id: number; name?: string; number?: number }

export default function StructureManagementPage() {
  const [colleges, setColleges] = useState<Item[]>([])
  const [departments, setDepartments] = useState<Item[]>([])
  const [courses, setCourses] = useState<Item[]>([])
  const [semesters, setSemesters] = useState<Item[]>([])
  const [subjects, setSubjects] = useState<Item[]>([])

  const [collegeId, setCollegeId] = useState("")
  const [departmentId, setDepartmentId] = useState("")
  const [courseId, setCourseId] = useState("")
  const [semesterId, setSemesterId] = useState("")

  // Form fields
  const [deptName, setDeptName] = useState("")
  const [deptCode, setDeptCode] = useState("")
  const [courseName, setCourseName] = useState("")
  const [courseCode, setCourseCode] = useState("")
  const [duration, setDuration] = useState("4")
  const [semNumber, setSemNumber] = useState("")
  const [subjName, setSubjName] = useState("")
  const [subjCode, setSubjCode] = useState("")
  const [message, setMessage] = useState("")
  const [csvFile, setCsvFile] = useState<File | null>(null)
const [importing, setImporting] = useState(false)

  useEffect(() => {
    fetch("/api/super-admin/colleges").then((r) => r.json()).then(setColleges)
  }, [])

  useEffect(() => {
    if (!collegeId) { setDepartments([]); setDepartmentId(""); return }
    fetch(`/api/super-admin/departments?collegeId=${collegeId}`).then((r) => r.json()).then(setDepartments)
  }, [collegeId])

  useEffect(() => {
    if (!departmentId) { setCourses([]); setCourseId(""); return }
    fetch(`/api/super-admin/courses?departmentId=${departmentId}`).then((r) => r.json()).then(setCourses)
  }, [departmentId])

  useEffect(() => {
    if (!courseId) { setSemesters([]); setSemesterId(""); return }
    fetch(`/api/super-admin/semesters?courseId=${courseId}`).then((r) => r.json()).then(setSemesters)
  }, [courseId])

  useEffect(() => {
    if (!semesterId) { setSubjects([]); return }
    fetch(`/api/super-admin/subjects?semesterId=${semesterId}`).then((r) => r.json()).then(setSubjects)
  }, [semesterId])

  function downloadTemplate() {
  const csvContent = "Department,BranchName,BranchCode,DurationYears,SemesterNumber,SubjectName,SubjectCode\nEngineering,Computer Science,CSE,4,1,Mathematics I,MA101\nEngineering,Computer Science,CSE,4,1,Physics,PH101\nEngineering,Computer Science,CSE,4,2,Data Structures,CS201"
  const blob = new Blob([csvContent], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "campushub-structure-template.csv"
  a.click()
}

async function handleBulkImport() {
  if (!csvFile || !collegeId) {
    setMessage("❌ Please select a college and a CSV file")
    return
  }

  setImporting(true)
  setMessage("")

  Papa.parse(csvFile, {
    header: true,
    skipEmptyLines: true,
    complete: async (results) => {
      const res = await fetch("/api/super-admin/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collegeId, rows: results.data }),
      })
      const data = await res.json()
      setImporting(false)

      if (!res.ok) {
        setMessage("❌ " + data.error)
        return
      }

      setMessage(
        `✅ Imported: ${data.created.departments} departments, ${data.created.courses} branches, ${data.created.semesters} semesters, ${data.created.subjects} subjects`
      )
      setCsvFile(null)
      // Refresh lists
      fetch(`/api/super-admin/departments?collegeId=${collegeId}`).then((r) => r.json()).then(setDepartments)
    },
  })
}

  async function addDepartment() {
    setMessage("")
    const res = await fetch("/api/super-admin/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: deptName, code: deptCode, collegeId }),
    })
    const data = await res.json()
    if (!res.ok) { setMessage("❌ " + data.error); return }
    setDeptName(""); setDeptCode("")
    fetch(`/api/super-admin/departments?collegeId=${collegeId}`).then((r) => r.json()).then(setDepartments)
    setMessage("✅ Department added")
  }

  async function addCourse() {
    setMessage("")
    const res = await fetch("/api/super-admin/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: courseName, code: courseCode, durationYrs: duration, departmentId }),
    })
    const data = await res.json()
    if (!res.ok) { setMessage("❌ " + data.error); return }
    setCourseName(""); setCourseCode("")
    fetch(`/api/super-admin/courses?departmentId=${departmentId}`).then((r) => r.json()).then(setCourses)
    setMessage("✅ Branch added")
  }

  async function addSemester() {
    setMessage("")
    const res = await fetch("/api/super-admin/semesters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number: semNumber, courseId }),
    })
    const data = await res.json()
    if (!res.ok) { setMessage("❌ " + data.error); return }
    setSemNumber("")
    fetch(`/api/super-admin/semesters?courseId=${courseId}`).then((r) => r.json()).then(setSemesters)
    setMessage("✅ Semester added")
  }

  async function addSubject() {
    setMessage("")
    const res = await fetch("/api/super-admin/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: subjName, code: subjCode, semesterId }),
    })
    const data = await res.json()
    if (!res.ok) { setMessage("❌ " + data.error); return }
    setSubjName(""); setSubjCode("")
    fetch(`/api/super-admin/subjects?semesterId=${semesterId}`).then((r) => r.json()).then(setSubjects)
    setMessage("✅ Subject added")
  }

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Academic Structure" description="Set up departments, branches, semesters & subjects for a college" />

      {message && <p className="text-sm">{message}</p>}

      {/* College selector */}
      <div className="rounded-xl border bg-card p-4 space-y-2">
        <Label>Select College</Label>
        <Autocomplete
          placeholder="Choose a college..."
          value={collegeId}
          onChange={setCollegeId}
          options={colleges.map((c: any) => ({ value: c.id.toString(), label: c.name }))}
        />
      </div>

{collegeId && (
  <div className="rounded-xl border bg-card p-4 space-y-3">
    <div className="flex items-center justify-between">
      <h3 className="font-semibold text-sm">Bulk Import (CSV)</h3>
      <button onClick={downloadTemplate} className="text-xs text-primary underline flex items-center gap-1">
        <Download className="h-3 w-3" /> Download Template
      </button>
    </div>
    <p className="text-xs text-muted-foreground">
      Import all departments, branches, semesters, and subjects at once using a CSV file
    </p>
    <div className="flex gap-2">
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
        className="text-xs flex-1"
      />
      <Button size="sm" onClick={handleBulkImport} disabled={importing || !csvFile}>
        <Upload className="h-3.5 w-3.5 mr-1.5" /> {importing ? "Importing..." : "Import"}
      </Button>
    </div>
  </div>
)}
      {collegeId && (
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <h3 className="font-semibold text-sm">Departments</h3>
          <div className="flex gap-2 flex-wrap">
  {departments.map((d: any) => (
    <span key={d.id} className="text-xs bg-muted px-2 py-1 rounded-full flex items-center gap-1.5">
      {d.name}
      <button
        onClick={async () => {
          if (!confirm(`Delete "${d.name}"? This will fail if it has branches inside.`)) return
          const res = await fetch(`/api/super-admin/departments/${d.id}`, { method: "DELETE" })
          if (res.ok) {
            fetch(`/api/super-admin/departments?collegeId=${collegeId}`).then((r) => r.json()).then(setDepartments)
          } else {
            alert("Cannot delete — remove branches inside it first")
          }
        }}
      >
        <Trash2 className="h-3 w-3 text-red-500" />
      </button>
    </span>
  ))}
</div>
          <div className="flex gap-2">
            <Input placeholder="Department name" value={deptName} onChange={(e) => setDeptName(e.target.value)} />
            <Input placeholder="Code" className="w-24" value={deptCode} onChange={(e) => setDeptCode(e.target.value)} />
            <Button size="sm" onClick={addDepartment}><Plus className="h-4 w-4" /></Button>
          </div>

          <div className="pt-2">
            <Label>Select Department</Label>
            <Autocomplete
              placeholder="Choose a department..."
              value={departmentId}
              onChange={setDepartmentId}
              options={departments.map((d: any) => ({ value: d.id.toString(), label: d.name }))}
            />
          </div>
        </div>
      )}

      {departmentId && (
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <h3 className="font-semibold text-sm">Branches / Courses</h3>
           <div className="flex gap-2 flex-wrap">
  {courses.map((c: any) => (
    <span key={c.id} className="text-xs bg-muted px-2 py-1 rounded-full flex items-center gap-1.5">
      {c.name}
      <button
        onClick={async () => {
          if (!confirm(`Delete "${c.name}"? This will fail if it has semesters inside.`)) return
          const res = await fetch(`/api/super-admin/courses/${c.id}`, { method: "DELETE" })
          if (res.ok) {
            fetch(`/api/super-admin/courses?departmentId=${departmentId}`).then((r) => r.json()).then(setCourses)
          } else {
            alert("Cannot delete — remove semesters inside it first")
          }
        }}
      >
        <Trash2 className="h-3 w-3 text-red-500" />
      </button>
    </span>
  ))}
</div>
          <div className="flex gap-2">
            <Input placeholder="Branch name" value={courseName} onChange={(e) => setCourseName(e.target.value)} />
            <Input placeholder="Code" className="w-20" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} />
            <Input placeholder="Yrs" type="number" className="w-16" value={duration} onChange={(e) => setDuration(e.target.value)} />
            <Button size="sm" onClick={addCourse}><Plus className="h-4 w-4" /></Button>
          </div>

          <div className="pt-2">
            <Label>Select Branch</Label>
            <Autocomplete
              placeholder="Choose a branch..."
              value={courseId}
              onChange={setCourseId}
              options={courses.map((c: any) => ({ value: c.id.toString(), label: c.name }))}
            />
          </div>
        </div>
      )}

      {courseId && (
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <h3 className="font-semibold text-sm">Semesters</h3>
         <div className="flex gap-2 flex-wrap">
  {semesters.map((s: any) => (
    <span key={s.id} className="text-xs bg-muted px-2 py-1 rounded-full flex items-center gap-1.5">
      Sem {s.number}
      <button
        onClick={async () => {
          if (!confirm(`Delete Semester ${s.number}? This will fail if it has subjects inside.`)) return
          const res = await fetch(`/api/super-admin/semesters/${s.id}`, { method: "DELETE" })
          if (res.ok) {
            fetch(`/api/super-admin/semesters?courseId=${courseId}`).then((r) => r.json()).then(setSemesters)
          } else {
            alert("Cannot delete — remove subjects inside it first")
          }
        }}
      >
        <Trash2 className="h-3 w-3 text-red-500" />
      </button>
    </span>
  ))}
</div>
          <div className="flex gap-2">
            <Input placeholder="Semester number (e.g. 1)" type="number" value={semNumber} onChange={(e) => setSemNumber(e.target.value)} />
            <Button size="sm" onClick={addSemester}><Plus className="h-4 w-4" /></Button>
          </div>

          <div className="pt-2">
            <Label>Select Semester</Label>
            <Autocomplete
              placeholder="Choose a semester..."
              value={semesterId}
              onChange={setSemesterId}
              options={semesters.map((s: any) => ({ value: s.id.toString(), label: `Semester ${s.number}` }))}
            />
          </div>
        </div>
      )}

      {semesterId && (
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <h3 className="font-semibold text-sm">Subjects</h3>
            <div className="flex gap-2 flex-wrap">
  {subjects.map((s: any) => (
    <span key={s.id} className="text-xs bg-muted px-2 py-1 rounded-full flex items-center gap-1.5">
      {s.name}
      <button
        onClick={async () => {
          if (!confirm(`Delete "${s.name}"?`)) return
          const res = await fetch(`/api/super-admin/subjects/${s.id}`, { method: "DELETE" })
          if (res.ok) {
            fetch(`/api/super-admin/subjects?semesterId=${semesterId}`).then((r) => r.json()).then(setSubjects)
          } else {
            alert("Could not delete")
          }
        }}
      >
        <Trash2 className="h-3 w-3 text-red-500" />
      </button>
    </span>
  ))}
</div>
          <div className="flex gap-2">
            <Input placeholder="Subject name" value={subjName} onChange={(e) => setSubjName(e.target.value)} />
            <Input placeholder="Code" className="w-24" value={subjCode} onChange={(e) => setSubjCode(e.target.value)} />
            <Button size="sm" onClick={addSubject}><Plus className="h-4 w-4" /></Button>
          </div>
        </div>
      )}
    </div>
  )
}