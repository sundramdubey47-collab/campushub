"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Plus, Bot } from "lucide-react"


type Message = {
  id:number
  role:"USER" | "ASSISTANT"
  content:string
}


type SessionSummary = {
  id:number
  title:string
  updatedAt:string
}



export default function AIAssistantPage(){


const [sessions,setSessions] =
useState<SessionSummary[]>([])


const [currentSessionId,setCurrentSessionId] =
useState<number | null>(null)


const [messages,setMessages] =
useState<Message[]>([])


const [input,setInput] =
useState("")


const [loading,setLoading] =
useState(false)


const [error,setError] =
useState("")


const messagesEndRef =
useRef<HTMLDivElement>(null)




async function loadSessions(){

const res =
await fetch("/api/ai-chat/sessions")

const data =
await res.json()

setSessions(data)

}




useEffect(()=>{

loadSessions()

},[])



useEffect(()=>{

messagesEndRef.current?.scrollIntoView({
behavior:"smooth"
})

},[messages])





async function openSession(id:number){

const res =
await fetch(`/api/ai-chat/sessions/${id}`)


const data =
await res.json()


setCurrentSessionId(id)

setMessages(data.messages)

}





function startNewChat(){

setCurrentSessionId(null)

setMessages([])

}





async function handleSend(e:React.FormEvent){

e.preventDefault()


if(!input.trim() || loading)
return



setError("")


const userMessage=input

setInput("")



setMessages(prev=>[
...prev,
{
id:Date.now(),
role:"USER",
content:userMessage
}
])



setLoading(true)



const res =
await fetch("/api/ai-chat",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

sessionId:currentSessionId,

message:userMessage

})

})



const data =
await res.json()


setLoading(false)



if(!res.ok){

setError(data.error)

return

}



setCurrentSessionId(data.sessionId)


setMessages(prev=>[
...prev,
{
id:Date.now()+1,
role:"ASSISTANT",
content:data.reply
}
])


loadSessions()


}
return (

<div className="
flex
h-[calc(100vh-10rem)]
gap-4
overflow-hidden
">


{/* SIDEBAR */}

<div className="
hidden
md:flex
w-56
flex-col
border
rounded-xl
p-3
gap-2
overflow-y-auto
">


<Button
size="sm"
onClick={startNewChat}
>

<Plus className="h-4 w-4 mr-1"/>

New Chat

</Button>



{
sessions.map(s=>(

<button

key={s.id}

onClick={()=>openSession(s.id)}

className={`
text-left
text-sm
p-2
rounded-lg
hover:bg-muted
truncate
${
currentSessionId===s.id
?
"bg-muted"
:
""
}

`}

>

{s.title}

</button>


))

}


</div>





{/* CHAT BOX */}


<div className="
flex-1
flex
flex-col
border
rounded-xl
overflow-hidden
bg-background
mb-10
">





{/* HEADER */}

<div className="
p-3
border-b
flex
items-center
gap-2
font-semibold
text-sm
">

<Bot className="h-4 w-4"/>

24x7 Help Center

</div>





{/* MESSAGES */}


<div className="
flex-1
overflow-y-auto
p-4
space-y-4
">


{
messages.length===0 ?

(

<div className="
text-center
text-muted-foreground
mt-12
text-sm
space-y-2
">

<Bot className="mx-auto h-8 w-8"/>


<p>
Welcome 👋
24x7 Help Center me aapka swagat hai.
</p>

<p>
CampusHub, academics, events, notices, placements,
marketplace ya kisi bhi college se related help ke liye yahan puch sakte ho.
</p>


</div>

)

:

messages.map(m=>(


<div

key={m.id}

className={`
flex
${
m.role==="USER"
?
"justify-end"
:
"justify-start"
}

`}

>


<div

className={`
max-w-[75%]
rounded-xl
px-4
py-2
text-sm
whitespace-pre-wrap

${
m.role==="USER"

?

"bg-primary text-primary-foreground"

:

"bg-muted"

}

`}

>

{m.content}

</div>



</div>


))


}



{
loading && (

<p className="
text-xs
text-muted-foreground
">

AI thinking...

</p>

)

}



<div ref={messagesEndRef}/>


</div>





{
error && (

<p className="
text-xs
text-red-500
px-3
pb-1
">

{error}

</p>

)

}




{/* INPUT */}


<form

onSubmit={handleSend}

className="
flex
gap-2
p-3
border-t
bg-background
"


>


<Textarea

placeholder="Ask anything..."

value={input}

onChange={(e)=>setInput(e.target.value)}

onKeyDown={(e)=>{

if(
e.key==="Enter"
&&
!e.shiftKey
){

e.preventDefault()

handleSend(e)

}

}}

rows={1}

className="
resize-none
min-h-[42px]
max-h-[42px]
"

/>



<Button

type="submit"

disabled={loading}

className="
h-[42px]
w-[42px]
p-0
shrink-0
"

>

<Send className="h-4 w-4"/>

</Button>


</form>




</div>



</div>


)


}