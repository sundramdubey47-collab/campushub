"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Semester = { id: number; number: number }
type Course = { id: number; name: string; semesters: Semester[] }
type Department = { id: number; name: string; courses: Course[] }
type College = { id: number; name: string; departments: Department[] }
type University = { id: number; name: string; colleges: College[] }

export default function OnboardingPage() {
  const router = useRouter()
  const [universities, setUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [universityId, setUniversityId] = useState("")
  const [collegeId, setCollegeId] = useState("")
  const [departmentId, setDepartmentId] = useState("")
  const [courseId, setCourseId] = useState("")
  const [semesterId, setSemesterId] = useState("")

  useEffect(() => {
    fetch("/api/onboarding-data")
      .then((res) => res.json())
      .then((data) => setUniversities(data))
  }, [])

  const selectedUniversity = universities.find((u) => u.id === Number(universityId))
  const colleges = selectedUniversity?.colleges ?? []

  const selectedCollege = colleges.find((c) => c.id === Number(collegeId))
  const departments = selectedCollege?.departments ?? []

  const selectedDepartment = departments.find((d) => d.id === Number(departmentId))
  const courses = selectedDepartment?.courses ?? []

  const selectedCourse = courses.find((c) => c.id === Number(courseId))
  const semesters = selectedCourse?.semesters ?? []

  async function handleSubmit() {
    setError("")

    if (!collegeId || !departmentId || !courseId || !semesterId) {
      setError("please fill all fileds")
      return
    }

    setLoading(true)

    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collegeId, departmentId, courseId, semesterId }),
    })

    setLoading(false)

    if (!res.ok) {
      setError("somthing went wrong")
      return
    }

    router.push("/dashboard")
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4 border rounded-lg p-6">
        <h1 className="text-2xl font-bold text-center">your College</h1>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        <Select value={universityId} onValueChange={(v) => {
          setUniversityId(v); setCollegeId(""); setDepartmentId(""); setCourseId(""); setSemesterId("")
        }}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="University" />
          </SelectTrigger>
          <SelectContent>
            {universities.map((u) => (
              <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={collegeId} onValueChange={(v) => {
          setCollegeId(v); setDepartmentId(""); setCourseId(""); setSemesterId("")
        }} disabled={!universityId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="College" />
          </SelectTrigger>
          <SelectContent>
            {colleges.map((c) => (
              <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={departmentId} onValueChange={(v) => {
          setDepartmentId(v); setCourseId(""); setSemesterId("")
        }} disabled={!collegeId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((d) => (
              <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={courseId} onValueChange={(v) => {
          setCourseId(v); setSemesterId("")
        }} disabled={!departmentId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={semesterId} onValueChange={setSemesterId} disabled={!courseId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Semester" />
          </SelectTrigger>
          <SelectContent>
            {semesters.map((s) => (
              <SelectItem key={s.id} value={s.id.toString()}>Semester {s.number}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button className="w-full" onClick={handleSubmit} disabled={loading}>
          {loading ? "please wait while we saving your details..." : "Continue"}
        </Button>
      </div>
    </main>
  )
}