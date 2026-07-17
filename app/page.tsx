"use client"

import Link from "next/link"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { CampusHubLogo } from "@/components/campushub-logo"

import {
  ArrowRight,
  Sparkles,
  FileText,
  Bell,
  Calendar,
  ShoppingBag,
  Package,
  Brain,
  MessageCircle,
  Search,
  Users,
  ShieldCheck,
  Zap,
  Star,
  Quote,
} from "lucide-react"


const features = [
  {
    icon: FileText,
    title: "Academic Resources",
    description:
      "Notes, PYQs, assignments and study material shared by your campus community.",
  },
  {
    icon: Bell,
    title: "Smart Notices",
    description:
      "Never miss important college announcements, deadlines or updates.",
  },
  {
    icon: Calendar,
    title: "Campus Events",
    description:
      "Discover hackathons, fests, workshops and opportunities around you.",
  },
  {
    icon: ShoppingBag,
    title: "Student Marketplace",
    description:
      "Buy, sell and exchange products safely inside your campus.",
  },
  {
    icon: Package,
    title: "Rent Anything",
    description:
      "Books, laptops, calculators and equipment whenever you need.",
  },
  {
    icon: Brain,
    title: "AI Learning Assistant",
    description:
      "Instant doubt solving, explanations and personalized learning.",
  },
  {
    icon: MessageCircle,
    title: "Student Network",
    description:
      "Connect with seniors, juniors and classmates easily.",
  },
  {
    icon: Search,
    title: "Lost & Found",
    description:
      "Find lost items faster with help from your campus community.",
  },
]


const stats = [
  {
    value: "10K+",
    label: "Resources Shared",
  },
  {
    value: "50+",
    label: "Colleges Ready",
  },
  {
    value: "24/7",
    label: "Student Support",
  },
  {
    value: "AI",
    label: "Powered Learning",
  },
]


const testimonials = [
  {
    name: "Ananya Sharma",
    role: "CSE Student",
    quote:
      "Finding notes and previous year papers became effortless. CampusHub saves hours every week.",
  },
  {
    name: "Rohan Kumar",
    role: "ECE Student",
    quote:
      "The marketplace and rental features solved real problems students face daily.",
  },
  {
    name: "Priya Singh",
    role: "Final Year Student",
    quote:
      "The AI assistant feels like having a personal mentor available anytime.",
  },
]


const fade = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: (i:number = 0)=>({
    opacity:1,
    y:0,
    transition:{
      duration:.45,
      delay:i*.08
    }
  })
}


const jsonLd = {
 "@context":"https://schema.org",
 "@type":"Organization",
 name:"CampusHub",
 description:
 "A digital platform connecting students with notes, events, marketplace and AI learning tools.",
 url:"https://campushub-nine-lake.vercel.app"
}


export default function HomePage(){

return (

<main className="min-h-screen overflow-hidden">


<script
type="application/ld+json"
dangerouslySetInnerHTML={{
__html:JSON.stringify(jsonLd)
}}
/>



{/* NAVBAR */}

<header className="
sticky top-0 z-50
border-b
bg-background/80
backdrop-blur-xl
">

<div className="
max-w-7xl mx-auto
px-6
py-4
flex items-center
justify-between
">


<div className="flex items-center gap-3">

<CampusHubLogo className="h-9 w-9"/>

<div>
<h1 className="font-bold text-lg leading-none">
CampusHub
</h1>

<p className="text-[11px] text-muted-foreground">
Your Digital Campus
</p>

</div>

</div>



<div className="flex items-center gap-3">


<Link href="/login">

<Button
variant="outline"
className="
rounded-xl
border-primary/30
hover:bg-primary/10
"
>
Login
</Button>

</Link>



<Link href="/signup">

<Button
className="
rounded-xl
shadow-lg
shadow-primary/20
"
>
Get Started
<ArrowRight className="ml-2 h-4 w-4"/>
</Button>

</Link>


</div>


</div>

</header>





{/* HERO */}


<section className="
relative
px-6
pt-24
pb-20
max-w-7xl
mx-auto
text-center
">


<div className="
absolute
top-20
left-1/2
-translate-x-1/2
h-[500px]
w-[500px]
rounded-full
bg-primary/20
blur-[120px]
-z-10
"/>



<motion.div
initial="hidden"
animate="show"
custom={0}
variants={fade}
>

<div className="
inline-flex
items-center
gap-2
px-4
py-2
rounded-full
bg-primary/10
border
border-primary/20
text-primary
text-sm
font-medium
">

<Sparkles className="h-4 w-4"/>

Built for the next generation of students

</div>

</motion.div>



<motion.h1
initial="hidden"
animate="show"
custom={1}
variants={fade}

className="
mt-8
text-5xl
sm:text-7xl
font-bold
tracking-tight
leading-[1.05]
"
>


The Future of

<br/>


<span className="
bg-gradient-to-r
from-primary
via-purple-500
to-pink-500
bg-clip-text
text-transparent
">

College Life

</span>



</motion.h1>



<motion.p
initial="hidden"
animate="show"
custom={2}
variants={fade}

className="
max-w-2xl
mx-auto
mt-6
text-muted-foreground
text-lg
"
>

CampusHub brings notes, notices, events,
student marketplace and AI learning tools
into one powerful platform.

</motion.p>



<motion.div
initial="hidden"
animate="show"
custom={3}
variants={fade}

className="
flex
justify-center
gap-4
mt-10
flex-wrap
"
>


<Link href="/signup">

<Button
size="lg"
className="
rounded-xl
px-8
shadow-xl
shadow-primary/30
"
>

Join Your Campus

<ArrowRight className="ml-2 h-5 w-5"/>

</Button>

</Link>



<Link href="/login">

<Button
size="lg"
variant="outline"
className="
rounded-xl
px-8
"
>

Login

</Button>

</Link>



</motion.div>


</section>
{/* PRODUCT PREVIEW */}


<section className="px-6 max-w-6xl mx-auto pb-24">


<motion.div

initial={{
opacity:0,
y:40
}}

whileInView={{
opacity:1,
y:0
}}

viewport={{
once:true
}}

transition={{
duration:.6
}}

className="
relative
rounded-3xl
border
bg-card
shadow-2xl
overflow-hidden
"

>


{/* Browser Top Bar */}

<div className="
h-12
border-b
flex
items-center
gap-2
px-5
bg-muted/40
">

<div className="h-3 w-3 rounded-full bg-red-400"/>
<div className="h-3 w-3 rounded-full bg-yellow-400"/>
<div className="h-3 w-3 rounded-full bg-green-400"/>

<div className="
ml-5
h-6
rounded-md
bg-background
border
flex-1
max-w-sm
"/>

</div>



<div className="
grid
md:grid-cols-[220px_1fr]
min-h-[420px]
">


{/* SIDEBAR */}

<div className="
hidden
md:block
border-r
p-5
space-y-4
">


<div className="
rounded-xl
bg-primary
text-primary-foreground
p-3
font-semibold
text-sm
">

CampusHub

</div>



{
[
"Dashboard",
"Notes",
"Events",
"Marketplace",
"AI Assistant"
].map((item,i)=>(

<div
key={item}
className={`
p-3
rounded-xl
text-sm
${i===0
?"bg-primary/10 text-primary"
:"text-muted-foreground"
}
`}
>

{item}

</div>

))
}


</div>





{/* MAIN DASHBOARD */}

<div className="
p-5
space-y-5
">


<div className="
rounded-2xl
bg-gradient-to-r
from-primary
to-purple-600
p-6
text-primary-foreground
relative
overflow-hidden
">


<div className="
absolute
right-0
top-0
h-40
w-40
rounded-full
bg-white/10
blur-2xl
"/>



<p className="text-sm opacity-80">
Good Morning 👋
</p>


<h2 className="
text-2xl
font-bold
mt-1
">

Welcome to your campus

</h2>


<p className="
text-sm
mt-2
opacity-80
">

Everything you need in one place.

</p>


</div>





<div className="
grid
grid-cols-2
md:grid-cols-4
gap-4
">


{
[
["📚","Notes"],
["🔔","Notices"],
["🎯","Events"],
["🛒","Market"]
].map(([icon,title])=>(


<div

key={title}

className="
rounded-2xl
border
bg-background
p-5
text-center
hover:shadow-lg
transition
"

>

<div className="text-2xl">
{icon}
</div>


<p className="
mt-2
font-medium
text-sm
">

{title}

</p>


</div>


))

}


</div>





<div className="
grid
md:grid-cols-2
gap-4
">


<div className="
rounded-2xl
border
p-5
space-y-3
">

<div className="flex items-center gap-2">

<Brain className="h-5 w-5 text-primary"/>

<h3 className="font-semibold">
AI Study Assistant
</h3>

</div>


<p className="
text-sm
text-muted-foreground
">

Ask questions, generate quizzes,
and learn faster.

</p>


</div>





<div className="
rounded-2xl
border
p-5
space-y-3
">


<div className="flex items-center gap-2">

<Users className="h-5 w-5 text-primary"/>

<h3 className="font-semibold">
Student Community
</h3>

</div>


<p className="
text-sm
text-muted-foreground
">

Connect with your classmates
and seniors.

</p>


</div>



</div>


</div>


</div>


</motion.div>


</section>





{/* HOW IT WORKS */}



<section className="
px-6
py-20
max-w-6xl
mx-auto
">


<div className="
text-center
mb-14
">


<span className="
text-xs
font-semibold
text-primary
uppercase
tracking-widest
">

How It Works

</span>


<h2 className="
text-3xl
sm:text-5xl
font-bold
mt-3
">

Start your campus journey in seconds

</h2>


<p className="
text-muted-foreground
mt-4
max-w-xl
mx-auto
">

Simple onboarding designed for students,
colleges and communities.

</p>


</div>






<div className="
grid
md:grid-cols-3
gap-8
">


{


[
{
number:"01",
title:"Create Account",
desc:"Select your college, branch and semester."
},

{
number:"02",
title:"Explore Campus",
desc:"Access notes, events, marketplace and AI tools."
},

{
number:"03",
title:"Grow Together",
desc:"Share knowledge and build your community."
}

].map((item,i)=>(



<motion.div

key={item.number}

initial={{
opacity:0,
y:20
}}

whileInView={{
opacity:1,
y:0
}}

viewport={{
once:true
}}

transition={{
delay:i*.1
}}

className="
relative
text-center
"

>


<div className="
mx-auto
h-16
w-16
rounded-2xl
bg-primary
text-primary-foreground
flex
items-center
justify-center
font-bold
text-lg
">

{item.number}

</div>


<h3 className="
font-semibold
text-xl
mt-5
">

{item.title}

</h3>


<p className="
text-sm
text-muted-foreground
mt-3
leading-relaxed
">

{item.desc}

</p>


</motion.div>



))


}



</div>


</section>






{/* TRUST STRIP */}



<section className="
border-y
bg-muted/30
px-6
py-10
">


<div className="
max-w-5xl
mx-auto
grid
grid-cols-2
md:grid-cols-4
gap-6
text-center
">


{


[
{
icon:ShieldCheck,
text:"Secure Platform"
},

{
icon:Users,
text:"Student First"
},

{
icon:Zap,
text:"Fast Experience"
},

{
icon:Star,
text:"AI Powered"
}

].map((item)=>(


<div
key={item.text}
className="
flex
items-center
justify-center
gap-2
text-sm
font-medium
text-muted-foreground
"
>


<item.icon className="
h-5
w-5
text-primary
"/>


{item.text}


</div>


))


}


</div>


</section>
{/* STATS SECTION */}


<section className="
px-6
py-16
max-w-5xl
mx-auto
">


<div className="
grid
grid-cols-2
md:grid-cols-4
gap-8
text-center
">


{

stats.map((item,i)=>(


<motion.div

key={item.label}

initial={{
opacity:0,
y:20
}}

whileInView={{
opacity:1,
y:0
}}

viewport={{
once:true
}}

transition={{
delay:i*.08
}}

>

<h3 className="
text-4xl
font-bold
text-primary
">

{item.value}

</h3>


<p className="
text-sm
text-muted-foreground
mt-2
">

{item.label}

</p>


</motion.div>


))


}


</div>


</section>







{/* FEATURES SECTION */}



<section className="
px-6
py-20
max-w-7xl
mx-auto
">


<div className="
text-center
mb-14
">


<span className="
text-xs
font-semibold
text-primary
uppercase
tracking-widest
">

Features

</span>



<h2 className="
text-3xl
sm:text-5xl
font-bold
mt-3
">

Everything students need

</h2>



<p className="
text-muted-foreground
mt-4
max-w-xl
mx-auto
">

One platform replacing multiple apps
used in everyday college life.

</p>


</div>





<div className="
grid
sm:grid-cols-2
lg:grid-cols-4
gap-5
">


{


features.map((feature,i)=>{


const Icon=feature.icon


return (


<motion.div

key={feature.title}

initial={{
opacity:0,
y:25
}}

whileInView={{
opacity:1,
y:0
}}

viewport={{
once:true
}}

transition={{
delay:i*.05
}}

whileHover={{
y:-6
}}

className="
rounded-3xl
border
bg-card
p-6
hover:shadow-xl
transition-all
"

>


<div className="
h-12
w-12
rounded-2xl
bg-primary/10
flex
items-center
justify-center
mb-5
">

<Icon className="
h-6
w-6
text-primary
"/>

</div>



<h3 className="
font-semibold
text-lg
">

{feature.title}

</h3>



<p className="
text-sm
text-muted-foreground
mt-3
leading-relaxed
">

{feature.description}

</p>


</motion.div>


)


})


}



</div>


</section>








{/* AI SECTION */}



<section className="
px-6
py-24
bg-muted/30
">


<div className="
max-w-6xl
mx-auto
grid
md:grid-cols-2
gap-12
items-center
">


<motion.div

initial={{
opacity:0,
x:-30
}}

whileInView={{
opacity:1,
x:0
}}

viewport={{
once:true
}}

>


<span className="
text-xs
font-semibold
text-primary
uppercase
tracking-widest
">

AI Learning

</span>



<h2 className="
text-3xl
sm:text-5xl
font-bold
mt-4
leading-tight
">

Your personal AI mentor,
available anytime

</h2>



<p className="
text-muted-foreground
mt-5
leading-relaxed
">

CampusHub AI helps students understand
concepts, prepare exams, generate practice
tests and solve doubts instantly.

</p>



<div className="
mt-8
space-y-4
">


{


[
"Instant doubt solving",
"AI generated quizzes",
"Personalized learning",
"Career guidance"

].map(item=>(


<div
key={item}
className="
flex
items-center
gap-3
"
>


<div className="
h-2
w-2
rounded-full
bg-primary
"/>


<p className="
text-sm
font-medium
">

{item}

</p>


</div>


))


}


</div>


</motion.div>







{/* AI CARD */}



<motion.div

initial={{
opacity:0,
x:30
}}

whileInView={{
opacity:1,
x:0
}}

viewport={{
once:true
}}

className="
rounded-3xl
border
bg-background
p-6
shadow-xl
"

>


<div className="
rounded-2xl
bg-primary
text-primary-foreground
p-6
">


<div className="
flex
items-center
gap-3
">


<div className="
h-10
w-10
rounded-xl
bg-white/20
flex
items-center
justify-center
">

<Brain/>

</div>


<div>

<p className="
font-semibold
">

CampusHub AI

</p>

<p className="
text-xs
opacity-80
">

Online now

</p>


</div>


</div>


</div>





<div className="
mt-5
space-y-4
">


<div className="
bg-muted
rounded-2xl
p-4
text-sm
">

Explain recursion in simple words

</div>



<div className="
bg-primary/10
rounded-2xl
p-4
text-sm
">

Recursion means a function
calling itself to solve smaller
parts of a problem...

</div>



<div className="
h-12
rounded-xl
border
flex
items-center
px-4
text-sm
text-muted-foreground
">

Ask anything...

</div>


</div>



</motion.div>


</div>


</section>







{/* WHY CAMPUSHUB */}



<section className="
px-6
py-24
max-w-6xl
mx-auto
">


<div className="
text-center
mb-14
">


<span className="
text-xs
font-semibold
text-primary
uppercase
tracking-widest
">

Why CampusHub

</span>


<h2 className="
text-3xl
sm:text-5xl
font-bold
mt-3
">

Built around real student problems

</h2>


</div>





<div className="
grid
md:grid-cols-3
gap-8
">


{


[
{
icon:Zap,
title:"Simple & Fast",
desc:"Everything organized in one clean experience."
},

{
icon:Users,
title:"Student Community",
desc:"Learn and grow together with your campus."
},

{
icon:ShieldCheck,
title:"Safe & Secure",
desc:"Your identity and data stay protected."
}

].map((item,i)=>{


const Icon=item.icon


return (


<motion.div

key={item.title}

initial={{
opacity:0,
y:20
}}

whileInView={{
opacity:1,
y:0
}}

viewport={{
once:true
}}

className="
text-center
"

>


<div className="
mx-auto
h-16
w-16
rounded-2xl
bg-primary/10
flex
items-center
justify-center
">

<Icon className="
h-7
w-7
text-primary
"/>

</div>


<h3 className="
font-semibold
text-xl
mt-5
">

{item.title}

</h3>


<p className="
text-sm
text-muted-foreground
mt-3
">

{item.desc}

</p>


</motion.div>


)


})


}


</div>


</section>
{/* TESTIMONIALS */}


<section className="
px-6
py-24
max-w-7xl
mx-auto
">


<div className="
text-center
mb-14
">


<span className="
text-xs
font-semibold
text-primary
uppercase
tracking-widest
">

Student Stories

</span>


<h2 className="
text-3xl
sm:text-5xl
font-bold
mt-3
">

Loved by students

</h2>


<p className="
text-muted-foreground
mt-4
">

Real problems. Real solutions.

</p>


</div>





<div className="
grid
md:grid-cols-3
gap-6
">


{


testimonials.map((item,i)=>(


<motion.div

key={item.name}

initial={{
opacity:0,
y:20
}}

whileInView={{
opacity:1,
y:0
}}

viewport={{
once:true
}}

transition={{
delay:i*.1
}}

className="
rounded-3xl
border
bg-card
p-6
"

>


<Quote className="
h-7
w-7
text-primary/40
"/>


<p className="
mt-5
text-sm
leading-relaxed
">

"{item.quote}"

</p>



<div className="
mt-6
flex
items-center
gap-3
border-t
pt-5
">


<div className="
h-10
w-10
rounded-full
bg-primary
text-primary-foreground
flex
items-center
justify-center
font-bold
text-sm
">

{item.name
.split(" ")
.map(n=>n[0])
.join("")
}

</div>


<div>

<p className="
font-medium
text-sm
">

{item.name}

</p>


<p className="
text-xs
text-muted-foreground
">

{item.role}

</p>


</div>


</div>


</motion.div>


))


}


</div>


</section>







{/* FAQ */}



<section className="
px-6
py-24
max-w-4xl
mx-auto
">


<div className="
text-center
mb-12
">


<span className="
text-xs
font-semibold
text-primary
uppercase
tracking-widest
">

FAQ

</span>


<h2 className="
text-3xl
sm:text-5xl
font-bold
mt-3
">

Frequently Asked Questions

</h2>


</div>




<div className="
space-y-4
">


{


[
{
q:"Is CampusHub free?",
a:"Yes. Core features like notes, notices, events and community access are free for students."
},

{
q:"Can any college join?",
a:"Yes. Students can select their university, college, branch and semester during signup."
},

{
q:"Is my information safe?",
a:"Yes. CampusHub uses secure authentication and privacy focused systems."
},

{
q:"Does CampusHub use AI?",
a:"Yes. AI helps students with doubts, practice tests and personalized learning."
}

].map((faq,i)=>(


<details

key={i}

className="
group
rounded-2xl
border
bg-card
p-5
"

>


<summary className="
cursor-pointer
font-medium
list-none
flex
justify-between
items-center
">

{faq.q}


<span className="
text-primary
group-open:rotate-45
transition
">

+

</span>


</summary>



<p className="
mt-4
text-sm
text-muted-foreground
leading-relaxed
">

{faq.a}

</p>



</details>


))


}


</div>


</section>








{/* FINAL CTA */}



<section className="
px-6
py-24
max-w-6xl
mx-auto
">


<motion.div

initial={{
opacity:0,
scale:.95
}}

whileInView={{
opacity:1,
scale:1
}}

viewport={{
once:true
}}

className="
relative
overflow-hidden
rounded-[2.5rem]
bg-primary
text-primary-foreground
p-10
sm:p-16
text-center
"

>


<div className="
absolute
top-0
right-0
h-64
w-64
rounded-full
bg-white/10
blur-3xl
"/>


<div className="
absolute
bottom-0
left-0
h-64
w-64
rounded-full
bg-white/10
blur-3xl
"/>



<h2 className="
relative
text-3xl
sm:text-5xl
font-bold
">

Ready to transform your campus?

</h2>


<p className="
relative
mt-5
opacity-90
max-w-xl
mx-auto
">

Join students building a smarter,
connected and AI-powered college experience.

</p>



<Link href="/signup">


<Button

size="lg"

variant="secondary"

className="
relative
mt-8
rounded-xl
px-10
shadow-xl
"

>

Create Account

<ArrowRight className="
ml-2
h-5
w-5
"/>

</Button>


</Link>


</motion.div>


</section>









{/* FOOTER */}



<footer className="
border-t
px-6
py-12
">


<div className="
max-w-7xl
mx-auto
flex
flex-col
md:flex-row
items-center
justify-between
gap-6
">


<div className="
flex
items-center
gap-3
">


<CampusHubLogo className="
h-8
w-8
"/>


<div>

<p className="
font-bold
">

CampusHub

</p>


<p className="
text-xs
text-muted-foreground
">

Your Digital Campus OS

</p>


</div>


</div>




<div className="
flex
gap-5
text-sm
text-muted-foreground
">


<Link
href="/login"
className="hover:text-foreground"
>

Login

</Link>


<Link
href="/signup"
className="hover:text-foreground"
>

Sign Up

</Link>


<Link
href="/terms"
className="hover:text-foreground"
>

Terms

</Link>


<Link
href="/privacy"
className="hover:text-foreground"
>

Privacy

</Link>


</div>




<p className="
text-xs
text-muted-foreground
">

© {new Date().getFullYear()} CampusHub.
Made for students ❤️

</p>


</div>


</footer>



</main>

)

}
