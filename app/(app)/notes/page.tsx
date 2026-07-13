"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Autocomplete } from "@/components/autocomplete"
import { Combobox } from "@/components/combobox"
import { Skeleton } from "@/components/ui/skeleton"

import {
  FileText,
  Upload,
  SlidersHorizontal,
  X,
  Search,
  Sparkles,
  BookOpen,
  Download,
  Eye,
} from "lucide-react"



type Option = {
  id:number
  name?:string
  number?:number
}



const CATEGORY_OPTIONS = [

{
value:"NOTES",
label:"Notes"
},

{
value:"ASSIGNMENT",
label:"Assignment"
},

{
value:"LAB_RECORD",
label:"Lab Record"
},

{
value:"PREVIOUS_YEAR_PAPER",
label:"Previous Year Paper"
},

{
value:"BOOK",
label:"Books"
},

{
value:"PRESENTATION",
label:"Presentation"
},

{
value:"PRACTICAL_FILE",
label:"Practical File"
},

{
value:"QUESTION_BANK",
label:"Question Bank"
},

{
value:"FACULTY_NOTES",
label:"Faculty Notes"
},

{
value:"VIVA_QUESTIONS",
label:"Viva Questions"
},

{
value:"PROJECT",
label:"Project"
},

{
value:"SYLLABUS",
label:"Syllabus"
},

{
value:"OTHERS",
label:"Others"
},

]




type Note = {

id:number

title:string

description:string | null

fileUrl:string

isPremium:boolean

createdAt:string

category:string

unit:string | null

views:number

downloads:number


uploadedBy:{
name:string

college:{
name:string
}|null

}


university:{
name:string
}


course:{
name:string
}


semester:{
number:number
}


subject:{
name:string
}|null


}





export default function NotesPage(){


const router = useRouter()



const [notes,setNotes] = useState<Note[]>([])

const [loading,setLoading] = useState(true)

const [showFilters,setShowFilters] = useState(false)



const [universities,setUniversities] = useState<Option[]>([])

const [colleges,setColleges] = useState<Option[]>([])

const [courses,setCourses] = useState<Option[]>([])

const [semesters,setSemesters] = useState<Option[]>([])

const [subjects,setSubjects] = useState<Option[]>([])



const [universityId,setUniversityId] = useState("")

const [collegeId,setCollegeId] = useState("")

const [courseId,setCourseId] = useState("")

const [semesterId,setSemesterId] = useState("")

const [subjectId,setSubjectId] = useState("")

const [category,setCategory] = useState("")





useEffect(()=>{

fetch("/api/universities")
.then(res=>res.json())
.then(setUniversities)

},[])





useEffect(()=>{

if(!universityId){

setColleges([])

setCollegeId("")

return

}


fetch(`/api/colleges?universityId=${universityId}`)

.then(res=>res.json())

.then(setColleges)


},[universityId])





useEffect(()=>{

if(!collegeId){

setCourses([])

setCourseId("")

return

}


fetch(`/api/college-courses-by-id?collegeId=${collegeId}`)

.then(res=>res.json())

.then(setCourses)


},[collegeId])





useEffect(()=>{


if(!courseId){

setSemesters([])

setSemesterId("")

return

}


fetch(`/api/course-semesters?courseId=${courseId}`)

.then(res=>res.json())

.then(setSemesters)


},[courseId])






useEffect(()=>{


if(!semesterId){

setSubjects([])

setSubjectId("")

return

}


fetch(`/api/subjects?semesterId=${semesterId}`)

.then(res=>res.json())

.then(setSubjects)



},[semesterId])






async function search(){


setLoading(true)



const params = new URLSearchParams()



if(universityId)
params.set("universityId",universityId)


if(collegeId)
params.set("collegeId",collegeId)


if(courseId)
params.set("courseId",courseId)


if(semesterId)
params.set("semesterId",semesterId)


if(subjectId)
params.set("subjectId",subjectId)


if(category)
params.set("category",category)



const res = await fetch(`/api/notes?${params.toString()}`)


const data = await res.json()


setNotes(data)


setLoading(false)



}




useEffect(()=>{

search()

},[])





function clearFilters(){


setUniversityId("")

setCollegeId("")

setCourseId("")

setSemesterId("")

setSubjectId("")

setCategory("")


}






const activeFilterCount =
[
universityId,
collegeId,
courseId,
semesterId,
subjectId,
category
]
.filter(Boolean)
.length






async function handleDownload(
noteId:number,
fileUrl:string
){


const res = await fetch(
`/api/notes/${noteId}/track`,
{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
action:"download"
})

}
)



if(res.status===403){

const data = await res.json()

alert(data.message)

return

}



window.open(fileUrl,"_blank")

}
return (

<div className="space-y-6 pb-10">


{/* HERO SECTION */}

<motion.div

initial={{
opacity:0,
y:-15
}}

animate={{
opacity:1,
y:0
}}

className="
relative
overflow-hidden
rounded-3xl
border
bg-gradient-to-br
from-primary/10
via-background
to-primary/5

p-5
sm:p-8
"

>


<div className="
absolute
right-[-30px]
top-[-30px]

opacity-10
">

<BookOpen size={180}/>

</div>



<div className="
relative
z-10

flex
flex-col
sm:flex-row

justify-between
gap-5

">


<div>


<div className="
flex
items-center
gap-3
mb-3
">


<div className="
h-12
w-12

rounded-2xl

bg-primary/15

flex
items-center
justify-center
">


<FileText
className="text-primary"
size={26}
/>


</div>



<h1 className="
text-2xl
sm:text-3xl

font-bold

tracking-tight
">

Campus Library

</h1>



</div>




<p className="
text-sm

text-muted-foreground

max-w-xl
">

Access Notes, Previous Year Papers,
Assignments, Lab Records, Books and
important exam resources shared by students.

</p>



<div className="
flex
items-center
gap-2
mt-4
">


<span className="
flex
items-center
gap-1

text-xs

px-3
py-1

rounded-full

bg-primary/10

text-primary

font-medium
">

<Sparkles size={14}/>

Student Community

</span>



<span className="
text-xs

px-3
py-1

rounded-full

bg-muted
">

Free Resources

</span>



</div>


</div>




<Link href="/notes/upload">


<Button

className="
rounded-2xl

h-11

shadow-lg

hover:scale-105

transition
"

>

<Upload
className="h-4 w-4 mr-2"
/>

Upload Notes

</Button>


</Link>



</div>


</motion.div>






{/* MOBILE FILTER BUTTON */}


<div className="sm:hidden">


<Button

variant="outline"

className="
w-full
rounded-xl
h-11
"

onClick={()=>setShowFilters(!showFilters)}

>


<SlidersHorizontal
className="h-4 w-4 mr-2"
/>


Filters

{
activeFilterCount>0 &&
` (${activeFilterCount})`
}


</Button>


</div>






{/* FILTER SECTION */}


<div

className={`

${showFilters ? "block":"hidden"}

sm:block

rounded-3xl

border

bg-card

p-4

sm:p-5

shadow-sm

space-y-4

`}

>


<div className="
flex
items-center
gap-2

font-semibold

text-sm
">


<Search
size={17}
/>


Find Learning Material


</div>






<div className="

grid

grid-cols-1

sm:grid-cols-2

lg:grid-cols-6

gap-3

">





<Autocomplete

placeholder="University"

value={universityId}

onChange={setUniversityId}

options={
universities.map(u=>({

value:u.id.toString(),

label:u.name!

}))
}

/>







<Autocomplete

placeholder="College"

value={collegeId}

onChange={setCollegeId}

disabled={!universityId}

options={
colleges.map(c=>({

value:c.id.toString(),

label:c.name!

}))
}

/>







<Autocomplete

placeholder="Branch"

value={courseId}

onChange={setCourseId}

disabled={!collegeId}

options={
courses.map(c=>({

value:c.id.toString(),

label:c.name!

}))
}

/>







<Autocomplete

placeholder="Semester"

value={semesterId}

onChange={setSemesterId}

disabled={!courseId}

options={

semesters.map(s=>({

value:s.id.toString(),

label:`Semester ${s.number}`

}))

}

/>








<Autocomplete

placeholder="Subject"

value={subjectId}

onChange={setSubjectId}

disabled={!semesterId}

options={

subjects.map(s=>({

value:s.id.toString(),

label:s.name!

}))

}

/>







<Combobox

placeholder="Resource Type"

value={category}

onChange={setCategory}

options={CATEGORY_OPTIONS}

/>




</div>






<div className="
flex
gap-2
flex-wrap
">


<Button

onClick={search}

className="
rounded-xl
"

>

<Search
className="h-4 w-4 mr-2"
/>


Search Resources


</Button>





{

activeFilterCount>0 &&

<Button

variant="ghost"

onClick={()=>{

clearFilters()

search()

}}

className="
rounded-xl
"

>


<X
className="h-4 w-4 mr-1"
/>


Clear


</Button>


}



</div>



</div>
{/* NOTES GRID */}


{
loading ? (


<div className="
grid
grid-cols-1
sm:grid-cols-2
lg:grid-cols-3

gap-5
">


{
[1,2,3,4,5,6].map((item)=>(

<Skeleton

key={item}

className="
h-72
rounded-3xl
"

/>

))

}


</div>



)

:

notes.length===0 ? (


<div className="
rounded-3xl
border
bg-card

p-8

text-center

space-y-4
">


<div className="
mx-auto

h-16

w-16

rounded-3xl

bg-primary/10

flex

items-center

justify-center
">


<FileText

size={32}

className="text-primary"

/>


</div>




<h2 className="
text-xl
font-bold
">

No Resources Found

</h2>




<p className="
text-sm

text-muted-foreground

max-w-md

mx-auto
">

No notes available for this filter.
Try another search or upload your own resource.

</p>




<Link href="/notes/upload">


<Button

className="
rounded-xl
"

>

<Upload

className="h-4 w-4 mr-2"

/>

Upload Resource


</Button>


</Link>



</div>



)


:

(


<div className="
grid

grid-cols-1

sm:grid-cols-2

lg:grid-cols-3

gap-5
">


{

notes.map((note,index)=>(



<motion.div


key={note.id}



initial={{

opacity:0,

y:20

}}



animate={{

opacity:1,

y:0

}}



transition={{

duration:.3,

delay:index*0.05

}}




onClick={()=>router.push(`/notes/${note.id}`)}



className="

group

rounded-3xl

border

bg-card

p-5

cursor-pointer

overflow-hidden


hover:border-primary/50

hover:shadow-xl

transition-all

duration-300

"

>



{/* TOP */}


<div className="
flex

justify-between

items-start

mb-4
">


<div className="

h-12

w-12

rounded-2xl

bg-primary/10

flex

items-center

justify-center

">


<FileText

size={25}

className="text-primary"

/>


</div>





{

note.isPremium &&

<span

className="

text-[11px]

font-semibold

px-3

py-1

rounded-full

bg-yellow-500/10

text-yellow-600

border

border-yellow-500/20

"

>

⭐ Premium

</span>

}



</div>







{/* TITLE */}


<h2

className="

font-bold

text-base

leading-snug

line-clamp-2

group-hover:text-primary

transition

"

>


{note.title}


</h2>






{/* CATEGORY TAGS */}


<div className="

flex

flex-wrap

gap-2

mt-4

">


<span

className="

text-[11px]

px-3

py-1

rounded-full

bg-primary/10

text-primary

font-medium

"

>

{note.category.replace(/_/g," ")}


</span>




<span

className="

text-[11px]

px-3

py-1

rounded-full

bg-muted

font-medium

"

>

{note.course.name}

</span>





<span

className="

text-[11px]

px-3

py-1

rounded-full

bg-muted

font-medium

"

>

Semester {note.semester.number}

</span>






{

note.subject &&

<span

className="

text-[11px]

px-3

py-1

rounded-full

bg-muted

font-medium

line-clamp-1

"

>

{note.subject.name}


</span>

}



</div>







{

note.description &&

<p

className="

mt-4

text-sm

text-muted-foreground

line-clamp-2

"

>

{note.description}


</p>


}








{/* USER INFO */}


<div className="

mt-5

pt-4

border-t

space-y-3

">


<div className="

flex

items-center

gap-3

">


<div className="

h-9

w-9

rounded-full

bg-primary/10

flex

items-center

justify-center

text-primary

font-bold

"

>


{
note.uploadedBy.name.charAt(0)
}


</div>



<div className="
min-w-0
">


<p className="
text-sm
font-medium
truncate
">

{note.uploadedBy.name}

</p>



<p className="
text-xs
text-muted-foreground
truncate
">

{
note.uploadedBy.college?.name ?? "Student"
}

</p>


</div>


</div>







<div className="

flex

justify-between

text-xs

text-muted-foreground

">


<span className="
flex
items-center
gap-1
">

<Eye size={13}/>

{note.views} Views

</span>



<span className="
flex
items-center
gap-1
">

<Download size={13}/>

{note.downloads} Downloads

</span>


</div>



</div>







{/* BUTTON */}



<button

onClick={(e)=>{

e.stopPropagation()

handleDownload(
note.id,
note.fileUrl
)

}}



className="

mt-4

w-full

rounded-xl

py-2.5

text-sm

font-semibold


bg-primary/10

text-primary


hover:bg-primary

hover:text-primary-foreground


transition

"

>


Preview / Download


</button>






</motion.div>



))

}


</div>


)

}



{/* FOOTER TRUST SECTION */}

<motion.div

initial={{
opacity:0,
y:10
}}

animate={{
opacity:1,
y:0
}}

transition={{
duration:.4
}}

className="
mt-8

rounded-3xl

border

bg-gradient-to-r

from-primary/5

to-transparent

p-5

flex

flex-col

sm:flex-row

items-center

justify-between

gap-4

"

>


<div>


<h3 className="
font-semibold
text-sm
">

Help your campus grow 📚

</h3>


<p className="
text-xs

text-muted-foreground

mt-1

">

Upload your notes and help thousands of students.

</p>


</div>




<Link href="/notes/upload">


<Button

size="sm"

className="
rounded-xl
"

>

<Upload

className="h-4 w-4 mr-2"

/>


Share Notes


</Button>



</Link>




</motion.div>



</div>

)

}