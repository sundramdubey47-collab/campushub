"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  GraduationCap,
  Building2,
  BookOpen,
  Layers,
  CalendarDays,
  CheckCircle2
} from "lucide-react"


type Semester = {
  id: number
  number: number
}


type Course = {
  id: number
  name: string
  semesters: Semester[]
}


type Department = {
  id: number
  name: string
  courses: Course[]
}


type College = {
  id: number
  name: string
  departments: Department[]
}


type University = {
  id: number
  name: string
  colleges: College[]
}



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
  const [section, setSection] = useState("")


  useEffect(() => {

    fetch("/api/onboarding-data")
      .then(res => res.json())
      .then(data => setUniversities(data))

  }, [])



  const university =
    universities.find(
      u => u.id === Number(universityId)
    )


  const colleges =
    university?.colleges ?? []



  const college =
    colleges.find(
      c => c.id === Number(collegeId)
    )


  const departments =
    college?.departments ?? []



  const department =
    departments.find(
      d => d.id === Number(departmentId)
    )


  const courses =
    department?.courses ?? []



  const course =
    courses.find(
      c => c.id === Number(courseId)
    )


  const semesters =
    course?.semesters ?? []



  async function handleSubmit() {

    setError("")


    if (
      !collegeId ||
      !departmentId ||
      !courseId ||
      !semesterId
    ) {

      setError("Please complete all details")

      return

    }


    setLoading(true)


    const res = await fetch(
      "/api/onboarding",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({ collegeId, departmentId, courseId, semesterId, section }),
      }

    )


    setLoading(false)


    if (!res.ok) {

      setError("Something went wrong")

      return

    }


    router.push("/dashboard")


  }



  return (

    <div className="
min-h-screen
bg-muted/30
flex
items-center
justify-center
p-4
">


      <div className="
max-w-6xl
w-full
grid
md:grid-cols-2
gap-6
">



        {/* LEFT INFO */}

        <div className="
bg-primary
text-primary-foreground
rounded-2xl
p-8
space-y-6
">


          <h1 className="
text-3xl
font-bold
">

            Welcome to CampusHub 🎓

          </h1>

          <div className="space-y-4">


            <div className="flex gap-3">


            </div>



            <div className="flex gap-3">

              <div>


              </div>

            </div>




            <div className="flex gap-3">


              <div>

              </div>

            </div>


          </div>

        </div>
        {/* RIGHT FORM */}

        <div className="
bg-background
border
rounded-2xl
p-6
md:p-8
space-y-6
">


          <div>

            <h2 className="
text-2xl
font-bold
">

              Complete Your Profile

            </h2>


            <p className="
text-sm
text-muted-foreground
mt-2
">

              Select your academic details to personalize
              your CampusHub dashboard.

            </p>

          </div>



          {
            error && (

              <p className="
bg-red-50
text-red-600
rounded-lg
p-3
text-sm
">

                {error}

              </p>

            )

          }




          {/* UNIVERSITY */}


          <div className="space-y-2">

            <label className="flex items-center gap-2 text-sm font-medium">

              <GraduationCap className="h-4 w-4" />

              University

            </label>


            <Select

              value={universityId}

              onValueChange={(v) => {

                setUniversityId(v)
                setCollegeId("")
                setDepartmentId("")
                setCourseId("")
                setSemesterId("")

              }}

            >


              <SelectTrigger>

                <SelectValue placeholder="Select University" />

              </SelectTrigger>


              <SelectContent>

                {
                  universities.map(u => (

                    <SelectItem
                      key={u.id}
                      value={u.id.toString()}
                    >

                      {u.name}

                    </SelectItem>

                  ))

                }

              </SelectContent>


            </Select>


          </div>





          {/* COLLEGE */}


          <div className="space-y-2">


            <label className="flex items-center gap-2 text-sm font-medium">

              <Building2 className="h-4 w-4" />

              College

            </label>



            <Select

              value={collegeId}

              disabled={!universityId}

              onValueChange={(v) => {

                setCollegeId(v)
                setDepartmentId("")
                setCourseId("")
                setSemesterId("")

              }}

            >


              <SelectTrigger>

                <SelectValue placeholder="Select College" />

              </SelectTrigger>


              <SelectContent>


                {
                  colleges.map(c => (

                    <SelectItem

                      key={c.id}

                      value={c.id.toString()}

                    >

                      {c.name}

                    </SelectItem>

                  ))

                }


              </SelectContent>


            </Select>


          </div>





          {/* DEPARTMENT */}


          <div className="space-y-2">


            <label className="flex items-center gap-2 text-sm font-medium">


              <Layers className="h-4 w-4" />

              Department


            </label>



            <Select

              value={departmentId}

              disabled={!collegeId}

              onValueChange={(v) => {

                setDepartmentId(v)
                setCourseId("")
                setSemesterId("")

              }}

            >


              <SelectTrigger>

                <SelectValue placeholder="Select Department" />

              </SelectTrigger>


              <SelectContent>


                {
                  departments.map(d => (

                    <SelectItem

                      key={d.id}

                      value={d.id.toString()}

                    >

                      {d.name}

                    </SelectItem>


                  ))

                }


              </SelectContent>


            </Select>



          </div>





          {/* COURSE */}



          <div className="space-y-2">


            <label className="flex items-center gap-2 text-sm font-medium">


              <BookOpen className="h-4 w-4" />

              Course


            </label>



            <Select

              value={courseId}

              disabled={!departmentId}

              onValueChange={(v) => {

                setCourseId(v)
                setSemesterId("")

              }}

            >


              <SelectTrigger>

                <SelectValue placeholder="Select Course" />

              </SelectTrigger>



              <SelectContent>


                {
                  courses.map(c => (

                    <SelectItem

                      key={c.id}

                      value={c.id.toString()}

                    >

                      {c.name}

                    </SelectItem>

                  ))

                }


              </SelectContent>


            </Select>



          </div>
          {/* SEMESTER */}

          <div className="space-y-2">


            <label className="flex items-center gap-2 text-sm font-medium">

              <CalendarDays className="h-4 w-4" />

              Current Semester

            </label>



            <Select

              value={semesterId}

              disabled={!courseId}

              onValueChange={setSemesterId}

            >


              <SelectTrigger>

                <SelectValue placeholder="Select Semester" />

              </SelectTrigger>



              <SelectContent>


                {
                  semesters.map(s => (

                    <SelectItem

                      key={s.id}

                      value={s.id.toString()}

                    >

                      Semester {s.number}

                    </SelectItem>

                  ))

                }


              </SelectContent>


              <Input
                placeholder="Your Section (e.g. A, B, C) — optional"
                value={section}
                onChange={(e) => setSection(e.target.value.toUpperCase())}
              />
            </Select>


          </div>





          <Button

            onClick={handleSubmit}

            disabled={loading}

            className="
w-full
h-12
text-base
font-semibold
"

          >


            {
              loading

                ?

                "Saving Profile..."

                :

                "Continue to CampusHub 🚀"

            }


          </Button>



          <p className="
text-xs
text-center
text-muted-foreground
pt-2
">

            Your academic details help CampusHub show
            relevant notes, tests and campus updates.

          </p>



        </div>


      </div>


    </div>


  )

}