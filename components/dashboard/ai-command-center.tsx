"use client"

import Link from "next/link"
import {
  Brain,
  Sparkles,
  FileText,
  MessageCircle,
  ArrowRight
} from "lucide-react"

import { Button } from "@/components/ui/button"


export function AICommandCenter(){

return (

<section
className="
relative
overflow-hidden
rounded-3xl
border
bg-gradient-to-br
from-purple-600/10
via-primary/10
to-blue-500/10
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
bg-purple-500/20
blur-3xl
"
/>



<div className="relative space-y-5">


<div className="flex items-center gap-3">


<div
className="
rounded-2xl
bg-primary/10
p-3
"
>

<Brain
className="
h-7
w-7
text-primary
"
/>

</div>



<div>

<h2
className="
font-[var(--font-manrope)]
text-xl
font-black
"
>

Campus AI Command Center

</h2>


<p
className="
text-sm
text-muted-foreground
"
>

Your personal AI study partner

</p>


</div>


</div>




<div
className="
grid
grid-cols-1
sm:grid-cols-3
gap-4
"
>


<Link href="/ai-assistant">

<div
className="
rounded-2xl
border
bg-card
p-4
hover:shadow-xl
transition
cursor-pointer
"
>


<Sparkles
className="
h-5
w-5
text-purple-500
"
/>


<h3
className="
font-bold
mt-3
"
>

Ask AI

</h3>


<p
className="
text-xs
text-muted-foreground
"
>

Solve doubts instantly

</p>


</div>

</Link>






<Link href="/tests">

<div
className="
rounded-2xl
border
bg-card
p-4
hover:shadow-xl
transition
cursor-pointer
"
>


<FileText
className="
h-5
w-5
text-green-500
"
/>


<h3
className="
font-bold
mt-3
"
>

Generate Test

</h3>


<p
className="
text-xs
text-muted-foreground
"
>

Practice smarter

</p>


</div>

</Link>







<Link href="/notes">

<div
className="
rounded-2xl
border
bg-card
p-4
hover:shadow-xl
transition
cursor-pointer
"
>


<MessageCircle

className="
h-5
w-5
text-orange-500
"
/>



<h3
className="
font-bold
mt-3
"
>

Summarize Notes

</h3>


<p
className="
text-xs
text-muted-foreground
"
>

AI powered summaries

</p>


</div>

</Link>



</div>




<Button
className="
rounded-xl
"
asChild
>

<Link href="/ai-assistant">

Open Campus AI

<ArrowRight
className="
ml-2
h-4
w-4
"
/>

</Link>


</Button>



</div>


</section>

)

}