"use client"

import { useState } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Trophy,
  GraduationCap,
  Sparkles,
} from "lucide-react"



const slides = [

{
title:"TechFest 2026",
subtitle:"Innovate. Inspire. Build.",
description:
"Join workshops, hackathons and exciting competitions happening on your campus.",
button:"Explore Events",
href:"/events",
icon:Trophy,
gradient:
"from-violet-600 via-purple-600 to-indigo-600",
},


{
title:"Placement Season",
subtitle:"Your Dream Company Awaits",
description:
"Stay updated with placement drives, internships and career opportunities.",
button:"View Placements",
href:"/placements",
icon:GraduationCap,
gradient:
"from-blue-600 via-cyan-500 to-sky-500",
},


{
title:"CampusHub AI",
subtitle:"Study Smarter with AI",
description:
"Generate notes, quizzes, summaries and get instant answers using AI.",
button:"Try AI",
href:"/ai-assistant",
icon:Sparkles,
gradient:
"from-pink-600 via-fuchsia-500 to-purple-600",
},

]



type Props = {

collegeName:string

}



export default function HeroSlider({

collegeName

}:Props){



const [current,setCurrent] = useState(0)



const slide = slides[current]

const Icon = slide.icon




function nextSlide(){

setCurrent(

(prev)=>(prev + 1) % slides.length

)

}



function previousSlide(){

setCurrent(

(prev)=>
(prev - 1 + slides.length) % slides.length

)

}





return(


<div className="
relative
overflow-hidden
rounded-3xl
shadow-lg
">



<div
className={`
relative
bg-gradient-to-br
${slide.gradient}
p-5
sm:p-7
text-white
transition-all
duration-500
`}
>




{/* Background Glow */}

<div className="
absolute
-right-10
-top-10
h-52
w-52
rounded-full
bg-white/10
blur-3xl
"/>



<div className="
absolute
-left-10
-bottom-10
h-44
w-44
rounded-full
bg-white/10
blur-3xl
"/>






<div className="
relative
flex
items-center
justify-between
gap-5
">



<div className="
max-w-lg
">



<p className="
text-[11px]
uppercase
tracking-[3px]
text-white/70
font-semibold
">

{collegeName}

</p>




<h2 className="
mt-3
text-2xl
sm:text-3xl
font-bold
leading-tight
">

{slide.title}

</h2>




<p className="
mt-2
text-base
sm:text-lg
text-white/90
font-medium
">

{slide.subtitle}

</p>




<p className="
mt-3
text-sm
leading-6
text-white/80
">

{slide.description}

</p>





<Link href={slide.href}>


<Button

className="
mt-5
rounded-full
bg-white
text-black
hover:bg-white/90
shadow-lg
"

>


{slide.button}


<ArrowRight

className="
ml-2
h-4
w-4
"

/>


</Button>


</Link>



</div>






<div className="
hidden
sm:flex
"
>


<div className="
h-32
w-32
rounded-3xl
bg-white/15
backdrop-blur
items-center
justify-center
flex
">


<Icon

className="
h-16
w-16
"

/>


</div>


</div>



</div>





{/* Controls */}



<div className="
mt-7
flex
items-center
justify-between
">



<button

onClick={previousSlide}

className="
h-9
w-9
rounded-full
bg-white/15
hover:bg-white/25
flex
items-center
justify-center
transition
"

>


<ChevronLeft className="h-5 w-5"/>


</button>






<div className="
flex
gap-2
">


{

slides.map((_,index)=>(


<button

key={index}

onClick={()=>setCurrent(index)}

className={`
rounded-full
transition-all
duration-300

${
current===index
?
"w-8 h-2 bg-white"
:
"w-2 h-2 bg-white/40"
}

`}

/>


))


}


</div>







<button

onClick={nextSlide}

className="
h-9
w-9
rounded-full
bg-white/15
hover:bg-white/25
flex
items-center
justify-center
transition
"

>


<ChevronRight className="h-5 w-5"/>


</button>




</div>





</div>



</div>


)


}