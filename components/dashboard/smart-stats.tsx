"use client"

import {
  BookOpen,
  Brain,
  Flame,
  Trophy
} from "lucide-react"



interface SmartStatsProps{

uploads:number
downloads:number
premium:boolean

}



export function SmartStats({
uploads,
downloads,
premium
}:SmartStatsProps){


const stats=[


{
title:"Learning Score",
value:"86%",
subtitle:"Great progress this week",
icon:Brain,
color:"text-purple-600",
bg:"bg-purple-500/10"
},


{
title:"Resources",
value:uploads,
subtitle:"Notes uploaded",
icon:BookOpen,
color:"text-blue-600",
bg:"bg-blue-500/10"
},


{
title:"Campus Activity",
value:"12 Days",
subtitle:"Learning streak 🔥",
icon:Flame,
color:"text-orange-500",
bg:"bg-orange-500/10"
},


{
title:"Rank",
value:"#24",
subtitle:"Top contributors",
icon:Trophy,
color:"text-yellow-600",
bg:"bg-yellow-500/10"
}


]




return (

<section

className="
grid
grid-cols-2
lg:grid-cols-4
gap-4
"

>


{
stats.map((item)=>{


const Icon=item.icon


return (

<div

key={item.title}

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

className={`
w-fit
rounded-xl
p-3
${item.bg}
`}

>


<Icon

className={`
h-5
w-5
${item.color}
`}

/>


</div>



<h3

className="
font-[var(--font-manrope)]
font-black
text-2xl
mt-4
"

>

{item.value}

</h3>



<p
className="
font-semibold
text-sm
"

>

{item.title}

</p>


<p

className="
text-xs
text-muted-foreground
mt-1
"

>

{item.subtitle}

</p>


</div>


)


})


}


</section>

)

}