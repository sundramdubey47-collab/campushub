"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

import { Button } from "@/components/ui/button"

import {
  Crown,
  Check,
  Sparkles,
  ShieldCheck,
  Download,
  BookOpen,
} from "lucide-react"



declare global {
  interface Window {
    Razorpay:any
  }
}



const PLANS = [

  {
    type:"WEEKLY",
    label:"Weekly",
    price:19,
    popular:false
  },

  {
    type:"MONTHLY",
    label:"Monthly",
    price:99,
    popular:true
  },

  {
    type:"YEARLY",
    label:"Yearly",
    price:899,
    popular:false
  },

]





const FEATURES=[

  "Premium Notes Access",

  "Unlimited Downloads",

  "AI Test Premium Content",

  "Exclusive Academic Resources",

  "No Ads Experience"

]







export default function PremiumPage(){


  const router=useRouter()

  const {data:session}=useSession()


  const [loading,setLoading]=useState<string|null>(null)

  const [error,setError]=useState("");







  async function handleSubscribe(planType:string){


    setError("")

    setLoading(planType)



    const orderRes=await fetch(

      "/api/payments/create-order",

      {

        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },

        body:JSON.stringify({
          planType
        })

      }

    )



    const orderData=await orderRes.json()



    if(!orderRes.ok){

      setError(orderData.error)

      setLoading(null)

      return

    }







    const razorpayOptions={


      key:orderData.keyId,


      amount:orderData.amount,


      currency:"INR",


      name:"CampusHub Premium",


      description:`${planType} Plan`,


      order_id:orderData.orderId,



      prefill:{

        name:
        session?.user?.name || "",


        email:
        session?.user?.email || ""

      },




      handler:async(response:any)=>{


        const verifyRes=await fetch(

          "/api/payments/verify",

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

          router.push("/dashboard")

        }

        else{

          setError(
            "Payment verify nahi ho paya"
          )

        }


      },



      modal:{

        ondismiss:()=>setLoading(null)

      },


      theme:{
        color:"#000000"
      }


    }







    const rzp=
    new window.Razorpay(
      razorpayOptions
    )


    rzp.open()


    setLoading(null)


  }









  return (

    <div className="
      mx-auto
      max-w-5xl
      space-y-10
      pb-10
    ">





      {/* Hero */}



      <div className="
        rounded-3xl
        border
        bg-gradient-to-br
        from-yellow-500/20
        via-background
        to-card
        p-8
        text-center
      ">


        <div className="
          mx-auto
          mb-4
          flex
          h-16
          w-16
          items-center
          justify-center
          rounded-full
          bg-yellow-500/20
        ">


          <Crown className="
            h-8
            w-8
            text-yellow-600
          "/>


        </div>




        <h1 className="
          text-3xl
          font-bold
        ">

          CampusHub Premium

        </h1>




        <p className="
          mt-3
          text-muted-foreground
        ">

          Unlock exclusive notes, AI tests and academic resources

        </p>


      </div>








      {/* Features */}



      <div className="
        grid
        grid-cols-1
        sm:grid-cols-3
        gap-4
      ">


        <FeatureCard
          icon={<Download/>}
          title="Unlimited Downloads"
        />


        <FeatureCard
          icon={<BookOpen/>}
          title="Premium Resources"
        />


        <FeatureCard
          icon={<ShieldCheck/>}
          title="Ad Free Experience"
        />


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








      {/* Plans */}



      <div className="
        grid
        grid-cols-1
        md:grid-cols-3
        gap-5
      ">



      {
        PLANS.map(plan=>(


          <div

            key={plan.type}

            className={`

              relative
              rounded-3xl
              border
              bg-card
              p-6
              space-y-5
              shadow-sm

              ${
                plan.popular
                ?
                "border-primary shadow-lg scale-[1.03]"
                :
                ""

              }

            `}

          >



            {
              plan.popular && (

                <div className="
                  absolute
                  -top-3
                  left-1/2
                  -translate-x-1/2
                  rounded-full
                  bg-primary
                  px-4
                  py-1
                  text-xs
                  text-primary-foreground
                ">

                  Most Popular

                </div>

              )
            }






            <div className="text-center">


              <h2 className="
                text-xl
                font-bold
              ">

                {plan.label}

              </h2>


              <p className="
                mt-3
                text-4xl
                font-bold
              ">

                ₹{plan.price}

              </p>


            </div>






            <div className="space-y-2">


            {
              FEATURES.slice(0,4).map(f=>(


                <p

                  key={f}

                  className="
                    flex
                    items-center
                    gap-2
                    text-sm
                  "

                >

                  <Check className="
                    h-4
                    w-4
                    text-green-600
                  "/>


                  {f}


                </p>


              ))
            }


            </div>





            <Button

              className="w-full"

              onClick={()=>
                handleSubscribe(plan.type)
              }


              disabled={
                loading===plan.type
              }

            >


              <Sparkles className="
                mr-2
                h-4
                w-4
              "/>


              {
                loading===plan.type
                ?
                "Processing..."
                :
                "Subscribe"
              }


            </Button>



          </div>


        ))
      }


      </div>



    </div>

  )

}






function FeatureCard({

  icon,
  title

}:{

  icon:React.ReactNode
  title:string

}){


  return (

    <div className="
      rounded-2xl
      border
      bg-card
      p-5
      flex
      items-center
      gap-3
    ">


      <div className="
        rounded-xl
        bg-primary/10
        p-3
        text-primary
      ">

        {icon}

      </div>


      <p className="font-medium">

        {title}

      </p>


    </div>

  )

}