"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/empty-state"
import { ReportButton } from "@/components/report-button"

import {
  Search,
  Plus,
  Phone,
  MapPin,
  Gift,
  CheckCircle2,
  User,
  PackageSearch,
  ShieldCheck,
} from "lucide-react"



type Item = {
  id:number
  type:string
  title:string
  description:string | null
  imageUrl:string | null
  location:string | null
  contactNumber:string | null
  reward:string | null
  createdAt:string
  reportedBy:{
    id:number
    name:string
  }
}



export function LostFoundClient({
  initialItems,
  currentUserId,
}:{
  initialItems:Item[]
  currentUserId:string
}){


  const [items,setItems] = useState<Item[]>(initialItems)



  async function handleResolve(id:number){

    await fetch(
      `/api/lost-found/${id}/resolve`,
      {
        method:"POST"
      }
    )

    setItems(
      items.filter(
        (i)=>i.id!==id
      )
    )

  }




  return (

    <div className="space-y-8">



      {/* Header */}


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
            text-sm
            font-medium
          ">

            <PackageSearch className="h-4 w-4"/>

            Campus Help Desk

          </div>



          <h1 className="
            mt-2
            text-3xl
            font-bold
          ">

            Lost & Found

          </h1>


          <p className="
            mt-2
            text-muted-foreground
            max-w-xl
          ">

            Lost something? Found something?
            Help your campus community return items safely.

          </p>


        </div>




        <Link href="/lost-found/report">

          <Button className="h-11">

            <Plus className="mr-2 h-4 w-4"/>

            Report Item

          </Button>


        </Link>


      </div>







      {
        items.length===0 ? (


          <EmptyState

            icon={Search}

            title="Nothing reported yet"

            description="
              No lost or found items currently.
              Everyone seems to have their belongings!
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
            items.map((item,index)=>(


              <motion.div

                key={item.id}

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

                className="
                  group
                  overflow-hidden
                  rounded-3xl
                  border
                  bg-card
                  shadow-sm
                  hover:shadow-xl
                  transition
                "

              >




                {/* Image */}


                <div className="
                  relative
                  aspect-video
                  bg-muted
                  overflow-hidden
                ">


                  {
                    item.imageUrl ? (

                      <img

                        src={item.imageUrl}

                        alt={item.title}

                        className="
                          h-full
                          w-full
                          object-cover
                          transition
                          duration-300
                          group-hover:scale-105
                        "

                      />


                    ) : (

                      <div className="
                        flex
                        h-full
                        items-center
                        justify-center
                      ">

                        <Search className="
                          h-12
                          w-12
                          text-muted-foreground
                        "/>


                      </div>

                    )
                  }




                  <span

                    className={`

                      absolute
                      right-3
                      top-3
                      rounded-full
                      px-3
                      py-1
                      text-xs
                      font-semibold
                      backdrop-blur

                      ${
                        item.type==="LOST"

                        ?

                        "bg-red-500/20 text-red-600"

                        :

                        "bg-green-500/20 text-green-600"

                      }

                    `}

                  >

                    {
                      item.type==="LOST"
                      ? "Lost"
                      : "Found"
                    }


                  </span>



                </div>






                <div className="p-5 space-y-4">



                  <h2 className="
                    text-lg
                    font-bold
                    line-clamp-1
                  ">

                    {item.title}

                  </h2>




                  {
                    item.description && (

                      <p className="
                        text-sm
                        text-muted-foreground
                        line-clamp-2
                      ">

                        {item.description}

                      </p>

                    )
                  }






                  <div className="
                    space-y-2
                    text-sm
                    text-muted-foreground
                  ">


                    {
                      item.location && (

                        <p className="
                          flex
                          items-center
                          gap-2
                        ">

                          <MapPin className="h-4 w-4"/>

                          {item.location}

                        </p>

                      )
                    }





                    {
                      item.contactNumber && (

                        <p className="
                          flex
                          items-center
                          gap-2
                        ">

                          <Phone className="h-4 w-4"/>

                          {item.contactNumber}

                        </p>

                      )
                    }






                    {
                      item.reward && (

                        <p className="
                          flex
                          items-center
                          gap-2
                          font-medium
                          text-green-600
                        ">


                          <Gift className="h-4 w-4"/>

                          Reward: {item.reward}


                        </p>

                      )
                    }



                  </div>







                  <div className="
                    border-t
                    pt-3
                    flex
                    items-center
                    justify-between
                    text-xs
                    text-muted-foreground
                  ">


                    <span className="
                      flex
                      items-center
                      gap-1
                    ">

                      <User className="h-3.5 w-3.5"/>

                      {item.reportedBy.name}

                    </span>




                    <span className="
                      flex
                      items-center
                      gap-1
                    ">

                      <ShieldCheck className="h-3.5 w-3.5"/>

                      Verified

                    </span>


                  </div>







                  <ReportButton

                    type="LOST_FOUND_ITEM"

                    targetId={item.id}

                  />






                  {
                    item.reportedBy.id.toString()===currentUserId && (

                      <Button

                        size="sm"

                        variant="outline"

                        className="w-full"

                        onClick={()=>handleResolve(item.id)}

                      >

                        <CheckCircle2 className="mr-2 h-4 w-4"/>

                        Mark as Resolved


                      </Button>

                    )
                  }



                </div>




              </motion.div>


            ))
          }


          </div>


        )
      }


    </div>

  )

}