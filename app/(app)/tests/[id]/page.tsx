"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

import { Button } from "@/components/ui/button"

import {
  Brain,
  Clock,
  HelpCircle,
  Lock,
  Sparkles,
  User,
  Trophy,
  CheckCircle2,
} from "lucide-react"



declare global {
  interface Window {
    Razorpay:any
  }
}



type Test = {
  id:number
  title:string
  topic:string
  difficulty:string
  durationMinutes:number
  isPremium:boolean
  price:number|null
  hasAccess:boolean
  createdBy:{
    name:string
  }
  _count:{
    questions:number
  }
}




export default function TestDetailPage(){


  const params=useParams()

  const router=useRouter()

  const {data:session}=useSession()


  const testId=params.id



  const [test,setTest]=useState<Test|null>(null)

  const [loading,setLoading]=useState(false)

  const [error,setError]=useState("")





  useEffect(()=>{


    fetch(`/api/tests/${testId}`)
      .then(r=>r.json())
      .then(setTest)


  },[testId])







  async function handleUnlock(){


    setError("")

    setLoading(true)




    const orderRes=await fetch(

      `/api/tests/${testId}/purchase`,

      {
        method:"POST"
      }

    )



    const orderData=await orderRes.json()




    if(!orderRes.ok){

      setError(orderData.error)

      setLoading(false)

      return

    }






    const options={


      key:orderData.keyId,

      amount:orderData.amount,

      currency:"INR",

      name:"CampusHub Test",

      description:test?.title,


      order_id:orderData.orderId,



      prefill:{

        name:
        session?.user?.name || "",


        email:
        session?.user?.email || ""

      },



      handler:async(response:any)=>{


        const verifyRes=await fetch(

          `/api/tests/${testId}/verify-purchase`,

          {

            method:"POST",

            headers:{
              "Content-Type":"application/json"
            },


            body:JSON.stringify({

              razorpay_order_id:
              response.razorpay_order_id,


              razorpay_payment_id:
              response.razorpay_payment_id,


              razorpay_signature:
              response.razorpay_signature

            })

          }

        )




        if(verifyRes.ok){


          const updated =
          await fetch(
            `/api/tests/${testId}`
          ).then(r=>r.json())


          setTest(updated)


        }
        else{

          setError(
            "Payment verify nahi ho paya"
          )

        }


      },



      modal:{

        ondismiss:()=>setLoading(false)

      },



      theme:{

        color:"#000000"

      }



    }





    const rzp =
    new window.Razorpay(options)


    rzp.open()


    setLoading(false)


  }








  if(!test){


    return (

      <div className="
        flex
        min-h-[300px]
        items-center
        justify-center
        text-muted-foreground
      ">

        Loading test...

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





      {/* Hero */}


      <div className="
        rounded-3xl
        border
        bg-gradient-to-br
        from-primary/10
        to-card
        p-8
      ">



        <div className="
          flex
          items-start
          gap-4
        ">


          <div className="
            rounded-2xl
            bg-primary/10
            p-4
          ">

            <Brain className="
              h-8
              w-8
              text-primary
            "/>


          </div>




          <div>


            <h1 className="
              text-3xl
              font-bold
            ">

              {test.title}

            </h1>



            <p className="
              mt-2
              text-muted-foreground
            ">

              {test.topic}

            </p>


          </div>


        </div>


      </div>








      {/* Stats */}


      <div className="
        grid
        grid-cols-1
        sm:grid-cols-3
        gap-4
      ">


        <div className="
          rounded-2xl
          border
          bg-card
          p-5
        ">

          <Clock className="mb-2 text-primary"/>

          <p className="text-sm text-muted-foreground">

            Duration

          </p>

          <p className="font-bold">

            {test.durationMinutes} Minutes

          </p>

        </div>





        <div className="
          rounded-2xl
          border
          bg-card
          p-5
        ">

          <HelpCircle className="mb-2 text-primary"/>

          <p className="text-sm text-muted-foreground">

            Questions

          </p>

          <p className="font-bold">

            {test._count.questions}

          </p>


        </div>





        <div className="
          rounded-2xl
          border
          bg-card
          p-5
        ">


          <Trophy className="mb-2 text-primary"/>


          <p className="text-sm text-muted-foreground">

            Difficulty

          </p>


          <p className="font-bold">

            {test.difficulty}

          </p>


        </div>


      </div>









      {/* Instructor */}


      <div className="
        rounded-3xl
        border
        bg-card
        p-5
        flex
        items-center
        gap-3
      ">


        <div className="
          rounded-full
          bg-muted
          p-3
        ">

          <User/>

        </div>



        <div>

          <p className="font-semibold">

            Created By

          </p>


          <p className="
            text-sm
            text-muted-foreground
          ">

            {test.createdBy.name}

          </p>


        </div>


      </div>








      {
        error && (

          <div className="
            rounded-xl
            bg-red-500/10
            p-4
            text-sm
            text-red-600
          ">

            {error}

          </div>

        )
      }








      {/* Action */}



      <div className="
        rounded-3xl
        border
        bg-card
        p-6
        space-y-4
      ">


        {
          test.hasAccess ? (


            <>


              <div className="
                flex
                items-center
                gap-2
                text-green-600
                font-medium
              ">

                <CheckCircle2 className="h-5 w-5"/>

                You have access

              </div>




              <Button

                className="
                  w-full
                  h-12
                "

                onClick={()=>
                  router.push(
                    `/tests/${test.id}/attempt`
                  )
                }

              >

                Start Test

              </Button>


            </>



          ) : (



            <>


              <div className="
                flex
                items-center
                gap-3
              ">


                <Lock className="text-yellow-600"/>


                <div>

                  <p className="font-semibold">

                    Premium Test

                  </p>


                  <p className="
                    text-sm
                    text-muted-foreground
                  ">

                    Unlock full access for ₹{test.price}

                  </p>


                </div>


              </div>




              <Button

                className="
                  w-full
                  h-12
                "

                onClick={handleUnlock}

                disabled={loading}

              >

                <Sparkles className="mr-2 h-4 w-4"/>


                {
                  loading
                  ?
                  "Processing..."
                  :
                  `Unlock ₹${test.price}`
                }


              </Button>


            </>


          )
        }



      </div>



    </div>

  )

}