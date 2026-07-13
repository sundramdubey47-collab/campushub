"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"

import {
  Clock,
  CheckCircle2,
  Trophy,
  Brain,
  AlertTriangle,
} from "lucide-react"



type Question = {
  id:number
  questionText:string
  options:string[]
}



export default function TakeTestPage(){

  const params = useParams()
  const router = useRouter()

  const testId = params.id


  const [attemptId,setAttemptId]=useState<number|null>(null)

  const [questions,setQuestions]=useState<Question[]>([])

  const [answers,setAnswers]=useState<{
    [key:number]:number
  }>({})


  const [secondsLeft,setSecondsLeft]=useState(0)

  const [loading,setLoading]=useState(true)

  const [submitting,setSubmitting]=useState(false)

  const [result,setResult]=useState<{
    score:number
    totalQuestions:number
  }|null>(null)

  const [error,setError]=useState("")





  useEffect(()=>{


    async function startTest(){


      const res = await fetch(
        `/api/tests/${testId}/attempt`,
        {
          method:"POST"
        }
      )


      const data = await res.json()



      if(!res.ok){

        setError(data.error)
        setLoading(false)
        return

      }



      setAttemptId(data.attemptId)

      setQuestions(data.questions)

      setSecondsLeft(
        data.durationMinutes * 60
      )

      setLoading(false)


    }


    startTest()


  },[testId])






  useEffect(()=>{


    if(
      loading ||
      result ||
      secondsLeft<=0
    ) return



    const timer=setInterval(()=>{


      setSecondsLeft((s)=>{


        if(s<=1){

          handleSubmit()

          return 0

        }


        return s-1


      })


    },1000)



    return ()=>clearInterval(timer)



  },[
    loading,
    result,
    secondsLeft
  ])







  function selectAnswer(
    questionId:number,
    index:number
  ){

    setAnswers({
      ...answers,
      [questionId]:index
    })

  }






  async function handleSubmit(){


    if(
      submitting ||
      !attemptId
    ) return



    setSubmitting(true)



    const answerList = questions.map(q=>({

      questionId:q.id,

      selectedIndex:
        answers[q.id] ?? null

    }))





    const res = await fetch(

      `/api/attempts/${attemptId}/submit`,

      {

        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },

        body:JSON.stringify({
          answers:answerList
        })

      }

    )



    const data = await res.json()


    setSubmitting(false)



    if(res.ok){

      setResult(data)

    }



  }






  function formatTime(seconds:number){

    const m=Math.floor(seconds/60)

    const s=seconds%60


    return `${m}:${s
      .toString()
      .padStart(2,"0")}`

  }






  if(error){

    return (

      <div className="
        rounded-3xl
        border
        bg-red-500/10
        p-6
        text-red-600
      ">

        <AlertTriangle className="mb-2"/>

        {error}

      </div>

    )

  }






  if(loading){

    return (

      <div className="
        flex
        min-h-[300px]
        items-center
        justify-center
        text-muted-foreground
      ">

        Test load ho raha hai...

      </div>

    )

  }








  if(result){


    return (

      <div className="
        mx-auto
        max-w-md
        rounded-3xl
        border
        bg-card
        p-8
        text-center
        shadow-lg
        space-y-5
      ">


        <div className="
          mx-auto
          flex
          h-20
          w-20
          items-center
          justify-center
          rounded-full
          bg-green-500/10
        ">

          <CheckCircle2
            className="
              h-10
              w-10
              text-green-600
            "
          />

        </div>




        <h1 className="
          text-2xl
          font-bold
        ">

          Test Completed 🎉

        </h1>




        <p className="
          text-5xl
          font-bold
          text-primary
        ">

          {result.score}

          <span className="
            text-xl
            text-muted-foreground
          ">

            /{result.totalQuestions}

          </span>

        </p>




        <Button

          className="w-full"

          onClick={()=>
            router.push(
              `/tests/${testId}/leaderboard`
            )
          }

        >

          <Trophy className="mr-2 h-4 w-4"/>

          View Leaderboard

        </Button>



      </div>

    )

  }







  const attempted =
    Object.keys(answers).length



  return (

    <div className="
      mx-auto
      max-w-3xl
      space-y-6
      pb-10
    ">



      {/* Top bar */}


      <div className="
        sticky
        top-0
        z-10
        rounded-3xl
        border
        bg-background/90
        backdrop-blur
        p-4
        shadow-sm
      ">


        <div className="
          flex
          items-center
          justify-between
        ">



          <div className="
            flex
            items-center
            gap-2
            font-bold
          ">


            <Brain className="text-primary"/>

            AI Test


          </div>




          <div className={`
            flex
            items-center
            gap-2
            rounded-full
            px-4
            py-2
            font-mono
            font-bold

            ${
              secondsLeft<60
              ?
              "bg-red-500/10 text-red-600"
              :
              "bg-muted"
            }

          `}>


            <Clock className="h-4 w-4"/>

            {formatTime(secondsLeft)}


          </div>



        </div>




        <div className="
          mt-3
          text-xs
          text-muted-foreground
        ">

          {attempted}/{questions.length} questions attempted

        </div>


      </div>








      {
        questions.map((q,index)=>(


          <div

            key={q.id}

            className="
              rounded-3xl
              border
              bg-card
              p-6
              space-y-5
            "

          >


            <p className="
              font-semibold
              text-lg
            ">

              {index+1}. {q.questionText}

            </p>





            <div className="space-y-3">


            {
              q.options.map((option,optIndex)=>(


                <label

                  key={optIndex}

                  className={`

                    flex
                    cursor-pointer
                    items-center
                    gap-3
                    rounded-2xl
                    border
                    p-4
                    transition

                    ${
                      answers[q.id]===optIndex

                      ?

                      "border-primary bg-primary/10"

                      :

                      "hover:bg-muted"

                    }

                  `}

                >



                  <input

                    type="radio"

                    name={`q-${q.id}`}

                    checked={
                      answers[q.id]===optIndex
                    }

                    onChange={()=>
                      selectAnswer(
                        q.id,
                        optIndex
                      )
                    }

                  />



                  <span>

                    {option}

                  </span>



                </label>


              ))
            }


            </div>


          </div>


        ))
      }








      <Button

        className="
          h-12
          w-full
          text-base
        "

        onClick={handleSubmit}

        disabled={submitting}

      >

        {
          submitting
          ?
          "Submitting..."
          :
          "Submit Test"
        }


      </Button>



    </div>

  )

}