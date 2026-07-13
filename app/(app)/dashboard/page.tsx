"use server"

import Link from "next/link"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import { AnimatedCard } from "@/components/animated-card"

import {
  FileUp,
  Ticket,
  Download,
  Crown,
  Bell,
  Calendar,
  FileText,
  ShoppingBag,
  Package,
  Search,
  MessageCircle,
  Brain,
  Sparkles,
  ShieldCheck,
  Users,
  Zap,
  ArrowRight,
  Rocket,
  GraduationCap,
  Star,
} from "lucide-react"



const quickLinks = [
  {
    href:"/notes",
    label:"Resources",
    icon:FileText,
    color:"oklch(0.55 0.15 278)"
  },
  {
    href:"/notices",
    label:"Notices",
    icon:Bell,
    color:"oklch(0.6 0.18 25)"
  },
  {
    href:"/events",
    label:"Events",
    icon:Calendar,
    color:"oklch(0.72 0.15 60)"
  },
  {
    href:"/marketplace",
    label:"Marketplace",
    icon:ShoppingBag,
    color:"oklch(0.55 0.13 145)"
  },
  {
    href:"/rentals",
    label:"Rentals",
    icon:Package,
    color:"oklch(0.55 0.15 278)"
  },
  {
    href:"/lost-found",
    label:"Lost & Found",
    icon:Search,
    color:"oklch(0.6 0.18 25)"
  },
  {
    href:"/tests",
    label:"AI Tests",
    icon:Brain,
    color:"oklch(0.72 0.15 60)"
  },
  {
    href:"/ai-assistant",
    label:"AI Assistant",
    icon:MessageCircle,
    color:"oklch(0.55 0.13 145)"
  },
]



const features = [

{
 icon:Rocket,
 title:"Everything in One Place",
 description:
 "Notes, events, marketplace, AI tools and student services inside one powerful campus ecosystem."
},


{
 icon:Brain,
 title:"AI Powered Learning",
 description:
 "Generate tests, solve doubts and improve your preparation using AI."
},


{
 icon:Users,
 title:"Student Community",
 description:
 "Connect with verified students and share knowledge."
},


{
 icon:ShieldCheck,
 title:"Safe Campus Network",
 description:
 "Private and secure environment designed only for your college."
}

]





export default async function DashboardPage(){


const session = await auth()



const dbUser = await prisma.user.findUnique({

where:{
 email:session?.user?.email ?? ""
},


include:{


college:{
select:{
name:true
}
},


_count:{
select:{
uploadedNotes:true,
coupons:true
}
}


}

})



if(!dbUser){

return (

<div className="p-10">

<p className="text-red-500">

Could not load dashboard

</p>

</div>

)

}





const [
recentNotices,
upcomingEvents,
totalDownloadsReceived

]=await Promise.all([



prisma.notice.findMany({

where:{
collegeId:dbUser.collegeId ?? 0,
isArchived:false
},

orderBy:[
{
isPinned:"desc"
},
{
createdAt:"desc"
}
],

take:3,


select:{
id:true,
title:true,
createdAt:true,
isPinned:true
}

}),





prisma.event.findMany({

where:{
collegeId:dbUser.collegeId ?? 0,
eventDate:{
gte:new Date()
}
},

orderBy:{
eventDate:"asc"
},

take:3,


select:{
id:true,
title:true,
eventDate:true
}


}),






prisma.note.aggregate({

where:{
uploadedById:dbUser.id
},

_sum:{
downloads:true
}


})


])





const uploadsCount =
dbUser._count.uploadedNotes


const couponsCount =
dbUser._count.coupons


const downloadsReceived =
totalDownloadsReceived._sum.downloads ?? 0



return (

<div className="
space-y-10
pb-12
">



{/* HERO */}

<section
className="
relative
overflow-hidden
rounded-3xl
border
bg-gradient-to-br
from-primary
via-primary/90
to-purple-700
text-primary-foreground
p-6
sm:p-10
shadow-2xl
"
>


<div
className="
absolute
-right-20
-top-20
h-72
w-72
rounded-full
bg-white/20
blur-3xl
"
/>



<div
className="
relative
flex
flex-col
lg:flex-row
lg:items-center
justify-between
gap-8
"
>


<div className="space-y-5">


<div
className="
inline-flex
items-center
gap-2
rounded-full
bg-white/15
px-4
py-2
text-xs
backdrop-blur
"
>

<GraduationCap className="h-4 w-4"/>

{dbUser.college?.name ?? "CampusHub"}

</div>




<h1
className="
text-3xl
sm:text-5xl
font-black
tracking-tight
"
>

Welcome back

<br/>

{dbUser.name.split(" ")[0]} 👋

</h1>



<p
className="
max-w-xl
text-white/80
text-sm
sm:text-base
"
>

Your complete digital campus.
Study smarter, connect faster and grow together.

</p>
<div className="
flex
flex-wrap
gap-3
pt-3
">

<Link href="/events">

<Button
variant="secondary"
className="
rounded-xl
shadow-lg
"
>

Explore Campus

<ArrowRight
className="
ml-2
h-4
w-4
"
/>

</Button>

</Link>



{!dbUser.isPremium && (

<Link href="/premium">

<Button
className="
rounded-xl
bg-white
text-black
hover:bg-white/90
shadow-lg
"
>

<Crown
className="
mr-2
h-4
w-4
"
/>

Go Premium

</Button>

</Link>

)}

</div>

</div>




{/* Desktop Hero Card */}

<div
className="
hidden
lg:block
"
>


<div
className="
w-80
rounded-3xl
border
border-white/20
bg-white/10
backdrop-blur-xl
p-6
space-y-6
"
>


<div className="
flex
items-center
justify-between
">

<div>

<p className="
text-xs
text-white/70
">

Campus Experience

</p>


<p className="
text-2xl
font-bold
">

Premium

</p>

</div>


<Star
className="
h-9
w-9
fill-yellow-300
text-yellow-300
"
/>

</div>



<div className="
space-y-4
text-sm
">


<div className="
flex
justify-between
">

<span className="text-white/70">
Learning
</span>

<span>
AI Enabled
</span>

</div>



<div className="
flex
justify-between
">

<span className="text-white/70">
Community
</span>

<span>
Verified
</span>

</div>



<div className="
flex
justify-between
">

<span className="text-white/70">
Resources
</span>

<span>
Unlimited
</span>

</div>


</div>



</div>


</div>


</div>


</section>





{/* STATS SECTION */}


<div
className="
grid
grid-cols-2
lg:grid-cols-4
gap-4
"
>


<AnimatedCard
delay={0}
className="
rounded-2xl
border
bg-card
p-5
space-y-3
hover:shadow-lg
transition
"
>

<div
className="
w-fit
rounded-xl
bg-purple-500/10
p-2.5
"
>

<FileUp
className="
h-5
w-5
text-purple-600
"
/>

</div>


<p className="
text-3xl
font-bold
">

{uploadsCount}

</p>


<p className="
text-sm
text-muted-foreground
">

Uploads

</p>


</AnimatedCard>







<AnimatedCard
delay={0.05}
className="
rounded-2xl
border
bg-card
p-5
space-y-3
hover:shadow-lg
transition
"
>


<div
className="
w-fit
rounded-xl
bg-green-500/10
p-2.5
"
>


<Download
className="
h-5
w-5
text-green-600
"
/>


</div>


<p className="
text-3xl
font-bold
">

{downloadsReceived}

</p>


<p className="
text-sm
text-muted-foreground
">

Downloads

</p>


</AnimatedCard>






<AnimatedCard
delay={0.1}
className="
rounded-2xl
border
bg-card
p-5
space-y-3
hover:shadow-lg
transition
"
>


<div
className="
w-fit
rounded-xl
bg-orange-500/10
p-2.5
"
>

<Ticket
className="
h-5
w-5
text-orange-500
"
/>


</div>



<p className="
text-3xl
font-bold
">

{couponsCount}

</p>


<p className="
text-sm
text-muted-foreground
">

Coupons

</p>


</AnimatedCard>






<AnimatedCard
delay={0.15}
className="
rounded-2xl
border
bg-card
p-5
space-y-3
hover:shadow-lg
transition
"
>


<div
className="
w-fit
rounded-xl
bg-yellow-500/10
p-2.5
"
>


<Crown
className="
h-5
w-5
text-yellow-500
"
/>


</div>



<p className="
text-xl
font-bold
"
>

{dbUser.isPremium ? "Premium" : "Free"}

</p>


<p className="
text-sm
text-muted-foreground
">

Plan

</p>


</AnimatedCard>



</div>






{/* QUICK ACCESS */}


<section className="
space-y-4
">


<div className="
flex
items-center
justify-between
">

<h2 className="
font-bold
text-lg
">

Quick Access

</h2>


<span className="
text-xs
text-muted-foreground
">

Student Tools

</span>


</div>



<div
className="
grid
grid-cols-4
sm:grid-cols-4
lg:grid-cols-8
gap-3
"
>


{quickLinks.map((item)=>{


const Icon=item.icon


return (

<Link
key={item.href}
href={item.href}
className="
group
rounded-2xl
border
bg-card
p-3
sm:p-4
flex
flex-col
items-center
gap-2
hover:-translate-y-1
hover:shadow-xl
transition-all
"
>


<div
className="
rounded-xl
p-2
transition
group-hover:scale-110
"
style={{
backgroundColor:`${item.color}20`
}}
>


<Icon
className="
h-4
w-4
sm:h-5
sm:w-5
"
style={{
color:item.color
}}
/>


</div>


<span
className="
text-[10px]
sm:text-xs
font-medium
text-center
"
>

{item.label}

</span>


</Link>

)


})}


</div>


</section>
{/* NOTICES + EVENTS */}


<section
className="
grid
grid-cols-1
lg:grid-cols-2
gap-5
"
>


{/* Notices */}

<div
className="
rounded-2xl
border
bg-card
p-5
space-y-4
"
>


<div
className="
flex
items-center
justify-between
"
>

<h2
className="
font-bold
flex
items-center
gap-2
"
>

<Bell className="h-5 w-5 text-primary"/>

Recent Notices

</h2>


<Link
href="/notices"
className="
text-xs
text-primary
hover:underline
"
>

View all

</Link>


</div>




{
recentNotices.length===0 ? (

<EmptyState
icon={Bell}
title="No notices yet"
/>

)

:

(

<div className="space-y-2">

{
recentNotices.map((notice)=>(


<Link

key={notice.id}

href="/notices"

className="
block
rounded-xl
p-3
hover:bg-muted
transition
text-sm
"

>


{
notice.isPinned && "📌 "
}

{notice.title}


</Link>


))

}


</div>


)

}



</div>






{/* Events */}


<div
className="
rounded-2xl
border
bg-card
p-5
space-y-4
"
>


<div
className="
flex
items-center
justify-between
"
>


<h2
className="
font-bold
flex
items-center
gap-2
"
>

<Calendar className="h-5 w-5 text-primary"/>

Upcoming Events

</h2>


<Link

href="/events"

className="
text-xs
text-primary
hover:underline
"

>

View all

</Link>


</div>





{
upcomingEvents.length===0 ? (

<EmptyState

icon={Calendar}

title="No upcoming events"

/>

)

:

(

<div className="space-y-2">


{
upcomingEvents.map((event)=>(


<Link

key={event.id}

href="/events"

className="
block
rounded-xl
p-3
hover:bg-muted
transition
text-sm
"

>


<div className="
font-medium
">

{event.title}

</div>


<p className="
text-xs
text-muted-foreground
mt-1
">

{
new Date(event.eventDate)
.toLocaleDateString()
}

</p>


</Link>


))

}


</div>

)

}


</div>



</section>








{/* PREMIUM CTA */}



{
!dbUser.isPremium && (

<section

className="
relative
overflow-hidden
rounded-3xl
border
bg-gradient-to-r
from-yellow-500/10
to-transparent
p-6
"

>


<div
className="
absolute
right-0
top-0
h-40
w-40
rounded-full
bg-yellow-400/20
blur-3xl
"
/>



<div

className="
relative
flex
flex-col
sm:flex-row
items-center
justify-between
gap-5
"

>


<div className="
flex
items-center
gap-4
"
>


<div
className="
rounded-2xl
bg-yellow-500/20
p-3
"
>


<Crown
className="
h-7
w-7
text-yellow-500
"
/>


</div>



<div>

<h3
className="
font-bold
text-lg
"
>

Unlock CampusHub Premium

</h3>


<p
className="
text-sm
text-muted-foreground
"
>

Unlimited resources, AI tests and exclusive features.

</p>


</div>


</div>




<Link href="/premium">


<Button

className="
rounded-xl
"

>

Upgrade Now

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


</section>


)

}









{/* WHY CAMPUSHUB */}



<section
className="
space-y-5
pt-5
"
>


<div
className="
text-center
space-y-2
"
>


<h2
className="
text-2xl
sm:text-3xl
font-black
"
>

Why Choose CampusHub?

</h2>


<p
className="
text-sm
text-muted-foreground
max-w-xl
mx-auto
"
>

The ultimate student operating system built for modern campuses.

</p>


</div>





<div

className="
grid
grid-cols-1
sm:grid-cols-2
gap-5
"

>


{
features.map((feature)=>{


const Icon=feature.icon


return (

<div

key={feature.title}

className="
rounded-2xl
border
bg-card
p-5
hover:shadow-xl
transition
"

>


<div

className="
w-fit
rounded-xl
bg-primary/10
p-3
"

>

<Icon

className="
h-6
w-6
text-primary
"

/>

</div>



<h3
className="
font-bold
mt-4
"
>

{feature.title}

</h3>



<p

className="
text-sm
text-muted-foreground
mt-2
leading-relaxed
"

>

{feature.description}

</p>



</div>


)


})

}


</div>



</section>









{/* FOOTER */}


<footer

className="
border-t
pt-8
mt-10
space-y-5
"

>


<div

className="
flex
flex-col
sm:flex-row
justify-between
items-center
gap-5
"

>


<div className="
text-center
sm:text-left
"
>


<h3
className="
font-black
text-lg
"
>

CampusHub

</h3>


<p
className="
text-xs
text-muted-foreground
"
>

One platform for every college student.

</p>


</div>





<div
className="
flex
gap-5
text-xs
text-muted-foreground
"
>


<Link href="/notes">
Resources
</Link>


<Link href="/events">
Events
</Link>


<Link href="/premium">
Premium
</Link>


<Link href="/ai-assistant">
AI
</Link>



</div>



</div>






<p

className="
text-center
text-xs
text-muted-foreground
"

>

© {new Date().getFullYear()} CampusHub.
Made with ❤️ for students.

</p>



</footer>




</div>

)

}