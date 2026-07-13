"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

import {
  Trophy,
  Medal,
  Crown,
  User,
  Target,
} from "lucide-react"



type Attempt = {
  id:number
  score:number
  totalQuestions:number
  submittedAt:string
  user:{
    name:string
  }
}




export default function LeaderboardPage(){


  const params=useParams()

  const testId=params.id



  const [attempts,setAttempts]=useState<Attempt[]>([])

  const [loading,setLoading]=useState(true)






  useEffect(()=>{


    fetch(`/api/tests/${testId}/leaderboard`)

      .then(r=>r.json())

      .then(data=>{

        setAttempts(data)

        setLoading(false)

      })


  },[testId])







  if(loading){


    return (

      <div className="
        flex
        min-h-[300px]
        items-center
        justify-center
        text-muted-foreground
      ">

        Loading leaderboard...

      </div>

    )

  }







  return (

    <div className="
      mx-auto
      max-w-4xl
      space-y-8
      pb-10
    ">



      {/* Header */}


      <div className="
        rounded-3xl
        border
        bg-gradient-to-br
        from-yellow-500/10
        to-card
        p-8
      ">


        <div className="
          flex
          items-center
          gap-4
        ">


          <div className="
            rounded-2xl
            bg-yellow-500/20
            p-4
          ">

            <Trophy className="
              h-10
              w-10
              text-yellow-600
            "/>

          </div>



          <div>


            <h1 className="
              text-3xl
              font-bold
            ">

              Leaderboard

            </h1>


            <p className="
              text-muted-foreground
              mt-1
            ">

              Top performers of this test

            </p>


          </div>


        </div>


      </div>









      {
        attempts.length===0 ? (


          <div className="
            rounded-3xl
            border
            bg-card
            p-8
            text-center
          ">


            <Target className="
              mx-auto
              h-12
              w-12
              text-muted-foreground
            "/>



            <p className="
              mt-4
              text-muted-foreground
            ">

              Abhi tak koi attempt nahi hai

            </p>


          </div>


        ) : (



          <div className="space-y-5">







            {/* Top 3 */}



            <div className="
              grid
              grid-cols-1
              md:grid-cols-3
              gap-4
            ">



            {
              attempts.slice(0,3).map((a,index)=>(


                <div

                  key={a.id}

                  className={`

                    rounded-3xl
                    border
                    bg-card
                    p-6
                    text-center
                    shadow-sm

                    ${
                      index===0
                      ?
                      "md:-translate-y-3 border-yellow-400"
                      :
                      ""

                    }

                  `}

                >



                  {
                    index===0 ? (

                      <Crown className="
                        mx-auto
                        h-8
                        w-8
                        text-yellow-500
                      "/>


                    ) : (

                      <Medal className="
                        mx-auto
                        h-8
                        w-8
                        text-muted-foreground
                      "/>

                    )
                  }



                  <p className="
                    mt-3
                    font-bold
                  ">

                    #{index+1}

                  </p>



                  <p className="
                    mt-2
                    font-semibold
                  ">

                    {a.user.name}

                  </p>



                  <p className="
                    mt-3
                    text-2xl
                    font-bold
                    text-primary
                  ">

                    {a.score}

                    <span className="
                      text-sm
                      text-muted-foreground
                    ">

                      /{a.totalQuestions}

                    </span>


                  </p>


                </div>


              ))
            }



            </div>









            {/* Full Ranking */}



            <div className="
              rounded-3xl
              border
              bg-card
              overflow-hidden
            ">



            {
              attempts.map((a,index)=>(


                <div

                  key={a.id}

                  className="
                    flex
                    items-center
                    gap-4
                    border-b
                    last:border-0
                    p-5
                  "

                >



                  <div className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    bg-muted
                    font-bold
                  ">

                    {index+1}

                  </div>





                  <div className="
                    flex-1
                  ">


                    <p className="font-semibold">

                      {a.user.name}

                    </p>


                    <p className="
                      text-xs
                      text-muted-foreground
                      flex
                      items-center
                      gap-1
                    ">

                      <User className="h-3 w-3"/>

                      Student

                    </p>


                  </div>





                  <div className="
                    text-right
                  ">


                    <p className="
                      font-bold
                    ">

                      {a.score}/{a.totalQuestions}

                    </p>


                    <p className="
                      text-xs
                      text-muted-foreground
                    ">

                      Score

                    </p>


                  </div>




                </div>


              ))
            }


            </div>





          </div>


        )
      }





    </div>

  )

}