"use client"

import { useEffect, useState } from "react"

import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

import {
  Copy,
  Check,
  Users,
  Gift,
  MessageCircle,
  Sparkles,
  Share2
} from "lucide-react"



export default function ReferralsPage(){


  const [data,setData] = useState<{
    referralCode:string
    totalInvited:number
    successfulReferrals:number

  } | null>(null)



  const [copied,setCopied] = useState(false)



  useEffect(()=>{

    fetch("/api/referral")
      .then(r=>r.json())
      .then(setData)

  },[])




  if(!data){

    return (

      <div className="space-y-6">


        <Skeleton className="h-10 w-52"/>


        <Skeleton className="
          h-40
          rounded-3xl
        "/>


      </div>

    )

  }




  const referralLink =
    typeof window !== "undefined"
    ?
    `${window.location.origin}/signup?ref=${data.referralCode}`
    :
    ""




  function handleCopy(){

    navigator.clipboard.writeText(referralLink)

    setCopied(true)


    setTimeout(()=>{

      setCopied(false)

    },2000)

  }




  const whatsappMessage = encodeURIComponent(
    `Hey! Join CampusHub using my referral link and get rewards 🎁 ${referralLink}`
  )




  return (

    <div className="
      max-w-3xl
      mx-auto
      space-y-7
      pb-10
    ">



      <PageHeader

        title="Invite Friends"

        description="
          Grow CampusHub with your classmates and earn rewards
        "

      />





      {/* Hero Card */}


      <div className="
        rounded-3xl
        border
        bg-gradient-to-br
        from-primary/15
        via-card
        to-card
        p-6
      ">


        <div className="
          flex
          gap-4
          items-start
        ">



          <div className="
            rounded-2xl
            bg-primary/20
            p-3
          ">


            <Sparkles className="
              h-6
              w-6
              text-primary
            "/>


          </div>



          <div>


            <h2 className="
              text-lg
              font-bold
            ">

              Invite & Earn 🎉

            </h2>



            <p className="
              text-sm
              text-muted-foreground
              mt-1
            ">

              Share your link with friends and unlock exclusive rewards.

            </p>



          </div>



        </div>




        <div className="
          mt-5
          rounded-2xl
          bg-background/70
          border
          p-4
        ">


          <p className="
            text-xs
            text-muted-foreground
          ">

            Your Referral Code

          </p>



          <p className="
            text-2xl
            font-bold
            tracking-widest
            mt-1
          ">

            {data.referralCode}

          </p>


        </div>



      </div>
      
      {/* Referral Stats */}


      <div className="
        grid
        grid-cols-2
        gap-4
      ">


        <StatCard

          label="Friends Invited"

          value={data.totalInvited}

          icon={Users}

        />



        <StatCard

          label="Rewards Earned"

          value={data.successfulReferrals}

          icon={Gift}

        />


      </div>







      {/* Referral Link Card */}



      <div className="
        rounded-3xl
        border
        bg-card
        p-5
        space-y-4
      ">



        <div className="
          flex
          items-center
          gap-2
        ">


          <Share2 className="
            h-5
            w-5
          "/>



          <h2 className="
            font-semibold
          ">

            Share your invitation link

          </h2>


        </div>






        <div className="
          flex
          gap-2
        ">



          <div className="
            flex-1
            rounded-xl
            border
            bg-muted/40
            px-3
            py-3
            text-sm
            truncate
          ">


            {referralLink}


          </div>





          <Button

            size="sm"

            variant="outline"

            onClick={handleCopy}

            className="
              rounded-xl
            "

          >


            {
              copied
              ?

              <Check className="
                h-4
                w-4
              "/>

              :

              <Copy className="
                h-4
                w-4
              "/>
            }



          </Button>



        </div>







        <a

          href={`https://wa.me/?text=${whatsappMessage}`}

          target="_blank"

          rel="noopener noreferrer"

          className="block"

        >


          <Button

            className="
              w-full
              rounded-xl
              bg-green-600
              hover:bg-green-700
              text-white
            "

          >


            <MessageCircle className="
              h-4
              w-4
              mr-2
            "/>


            Share on WhatsApp


          </Button>



        </a>



      </div>










      {/* How it Works */}



      <div className="
        rounded-3xl
        border
        bg-gradient-to-r
        from-primary/10
        to-transparent
        p-5
      ">



        <h2 className="
          font-semibold
          mb-3
        ">

          How it works 🚀

        </h2>





        <div className="
          space-y-3
          text-sm
        ">


          <div className="
            flex
            gap-3
          ">


            <span className="
              h-7
              w-7
              rounded-full
              bg-primary/20
              flex
              items-center
              justify-center
              text-xs
              font-bold
            ">

              1

            </span>


            <p className="
              text-muted-foreground
            ">

              Share your referral link with classmates.

            </p>


          </div>





          <div className="
            flex
            gap-3
          ">


            <span className="
              h-7
              w-7
              rounded-full
              bg-primary/20
              flex
              items-center
              justify-center
              text-xs
              font-bold
            ">

              2

            </span>


            <p className="
              text-muted-foreground
            ">

              Friend joins CampusHub using your link.

            </p>


          </div>





          <div className="
            flex
            gap-3
          ">


            <span className="
              h-7
              w-7
              rounded-full
              bg-primary/20
              flex
              items-center
              justify-center
              text-xs
              font-bold
            ">

              3

            </span>


            <p className="
              text-muted-foreground
            ">

              Both users receive reward benefits 🎁

            </p>


          </div>



        </div>



      </div>




    </div>

  )

}