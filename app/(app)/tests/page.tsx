"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/empty-state"
import { Skeleton } from "@/components/ui/skeleton"

import { useSession } from "next-auth/react"

import {
  Brain,
  Plus,
  Clock,
  HelpCircle,
  Users,
  Lock,
  Sparkles,
  ArrowRight,
  Trophy,
  BookOpenCheck,
  Zap,
} from "lucide-react"



type Test = {
  id:number
  title:string
  topic:string
  difficulty:string
  durationMinutes:number
  isPremium:boolean
  price:number | null
  createdBy:{
    name:string
  }
  _count:{
    questions:number
    attempts:number
  }
}




const DIFFICULTY_STYLES:Record<string,string>={

  EASY:
  "bg-green-500/15 text-green-600",

  MEDIUM:
  "bg-yellow-500/15 text-yellow-600",

  HARD:
  "bg-red-500/15 text-red-600",

}





export default function TestsPage(){


  const {data:session}=useSession()


  const canCreate=[
    "FACULTY",
    "ADMIN",
    "SUPER_ADMIN"
  ].includes(
    (session?.user as any)?.role
  )



  const [tests,setTests]=useState<Test[]>([])

  const [loading,setLoading]=useState(true)

  const [isPremium,setIsPremium]=useState(true)





  useEffect(()=>{


    fetch("/api/tests")
      .then(r=>r.json())
      .then(data=>{
        setTests(data)
        setLoading(false)
      })



    fetch("/api/dashboard")
      .then(r=>r.json())
      .then(d=>{
        setIsPremium(!!d.isPremium)
      })


  },[])





  const premiumTestCount =
    tests.filter(
      t=>t.isPremium
    ).length






  return (


    <div className="space-y-8">





      {/* Hero */}


      <div className="
        rounded-3xl
        border
        bg-gradient-to-br
        from-primary/10
        via-card
        to-card
        p-6
      ">


        <div className="
          flex
          flex-col
          gap-5
          md:flex-row
          md:items-center
          md:justify-between
        ">



          <div>


            <div className="
              flex
              items-center
              gap-2
              text-primary
              font-medium
              text-sm
            ">

              <Brain className="h-4 w-4"/>

              AI Powered Learning

            </div>



            <h1 className="
              mt-3
              text-3xl
              font-bold
            ">

              AI Test Series

            </h1>



            <p className="
              mt-2
              text-muted-foreground
              max-w-xl
            ">

              Practice smarter with syllabus based
              AI-generated tests and improve your score.

            </p>


          </div>




          {
            canCreate && (

              <Link href="/tests/create">

                <Button className="h-11">

                  <Plus className="mr-2 h-4 w-4"/>

                  Create Test

                </Button>

              </Link>

            )
          }


        </div>



      </div>








      {
        !isPremium && premiumTestCount>0 && (


          <motion.div

            initial={{
              opacity:0,
              y:-10
            }}

            animate={{
              opacity:1,
              y:0
            }}

            className="
              rounded-3xl
              border
              bg-yellow-500/10
              p-5
            "

          >


            <div className="
              flex
              items-center
              justify-between
              gap-4
              flex-wrap
            ">



              <div className="
                flex
                gap-3
              ">


                <div className="
                  rounded-full
                  bg-yellow-500/20
                  p-3
                ">

                  <Sparkles className="text-yellow-600"/>

                </div>



                <div>

                  <p className="font-semibold">

                    {premiumTestCount} Premium tests available

                  </p>


                  <p className="
                    text-sm
                    text-muted-foreground
                  ">

                    Unlock advanced tests and resources.

                  </p>


                </div>



              </div>




              <Link href="/premium">

                <Button>

                  Go Premium

                  <ArrowRight className="ml-2 h-4 w-4"/>

                </Button>

              </Link>



            </div>



          </motion.div>


        )
      }








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
              [1,2,3].map(i=>(

                <Skeleton
                  key={i}
                  className="
                    h-56
                    rounded-3xl
                  "
                />

              ))
            }


          </div>



        ) : tests.length===0 ? (



          <EmptyState

            icon={Brain}

            title="No tests available"

            description="
              Faculty will publish tests here soon.
            "

          />



        ) : (




          <div className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            gap-6
          ">


          {
            tests.map((test,index)=>(


              <motion.div

                key={test.id}

                initial={{
                  opacity:0,
                  y:20
                }}

                animate={{
                  opacity:1,
                  y:0
                }}

                transition={{
                  delay:index*0.05
                }}

                whileHover={{
                  y:-5
                }}

              >


              <Link href={`/tests/${test.id}`}>



                <div className={`

                  h-full
                  rounded-3xl
                  border
                  p-5
                  space-y-4
                  shadow-sm
                  transition

                  ${
                    test.isPremium && !isPremium

                    ?

                    "bg-yellow-500/5 border-yellow-500/40"

                    :

                    "bg-card hover:shadow-xl"

                  }

                `}>



                  <div className="
                    flex
                    justify-between
                    gap-3
                  ">



                    <h2 className="
                      font-bold
                      text-lg
                      line-clamp-2
                    ">

                      {test.title}

                    </h2>




                    {
                      test.isPremium ? (

                        <span className="
                          flex
                          items-center
                          gap-1
                          rounded-full
                          bg-yellow-500/20
                          px-3
                          py-1
                          text-xs
                          text-yellow-700
                        ">

                          <Lock className="h-3 w-3"/>

                          Premium

                        </span>


                      ) : (

                        <span className="
                          rounded-full
                          bg-green-500/15
                          px-3
                          py-1
                          text-xs
                          text-green-600
                        ">

                          Free

                        </span>

                      )
                    }



                  </div>





                  <p className="
                    text-sm
                    text-muted-foreground
                    line-clamp-2
                  ">

                    {test.topic}

                  </p>






                  <div className="
                    flex
                    flex-wrap
                    gap-2
                  ">


                    <span className={`
                      rounded-full
                      px-3
                      py-1
                      text-xs
                      ${DIFFICULTY_STYLES[test.difficulty]}
                    `}>

                      {test.difficulty}

                    </span>




                    <span className="
                      flex
                      items-center
                      gap-1
                      rounded-full
                      bg-muted
                      px-3
                      py-1
                      text-xs
                    ">

                      <Clock className="h-3 w-3"/>

                      {test.durationMinutes} min

                    </span>





                    <span className="
                      flex
                      items-center
                      gap-1
                      rounded-full
                      bg-muted
                      px-3
                      py-1
                      text-xs
                    ">

                      <HelpCircle className="h-3 w-3"/>

                      {test._count.questions}

                    </span>



                  </div>






                  <div className="
                    border-t
                    pt-3
                    text-xs
                    text-muted-foreground
                    flex
                    justify-between
                  ">


                    <span className="
                      flex
                      items-center
                      gap-1
                    ">

                      <Users className="h-3 w-3"/>

                      {test._count.attempts}

                    </span>



                    <span className="
                      flex
                      items-center
                      gap-1
                    ">

                      <Trophy className="h-3 w-3"/>

                      AI Practice

                    </span>



                  </div>






                  {
                    test.isPremium && !isPremium && (

                      <p className="
                        flex
                        items-center
                        gap-1
                        text-xs
                        font-medium
                        text-yellow-600
                      ">

                        <Zap className="h-3 w-3"/>

                        Unlock Premium ₹{test.price}

                      </p>

                    )
                  }



                </div>



              </Link>


              </motion.div>


            ))
          }



          </div>



        )
      }



    </div>

  )

}







